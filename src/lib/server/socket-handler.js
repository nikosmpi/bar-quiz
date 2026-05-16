import { Server } from 'socket.io';

/**
 * Core WebSocket logic shared between Dev (Vite) and Prod (Node)
 */
export async function injectWebSockets(httpServer) {
	console.log('[Socket] Initializing WebSocket server...');
	// Move DB imports inside to avoid Vite config loading issues ($env not available in vite.config)
	const { db } = await import('./db/index.js');
	const { answer } = await import('./db/schema.js');
	const { eq, and, sql } = await import('drizzle-orm');

	// Read trusted origins from env
	const trustedOrigins = (process.env.TRUSTED_ORIGINS || '').split(',').filter(Boolean);
	
	const io = new Server(httpServer, {
		cors: {
			origin: trustedOrigins.length > 0 ? trustedOrigins : "*",
			methods: ["GET", "POST"],
			credentials: true
		}
	});

	// Map to store user data per room
	// roomId -> Map(socketId -> { userData, answerCount, answeredCurrent })
	const roomUsers = new Map();

	function broadcastRoomUsers(roomId) {
		const usersMap = roomUsers.get(roomId);
		if (usersMap) {
			const usersList = Array.from(usersMap.values());
			console.log(`[Socket] Broadcasting ${usersList.length} users for room ${roomId}`);
			io.to(roomId).emit('room-users-update', usersList);
		} else {
			io.to(roomId).emit('room-users-update', []);
		}
	}

	async function getDbAnswerCount(userId, quizId) {
		if (!userId || !quizId) return 0;
		try {
			const result = await db.select({ 
				count: sql`count(*)` 
			})
			.from(answer)
			.where(and(
				eq(answer.userId, userId), 
				eq(answer.quizId, quizId)
			))
			.get();
			
			const finalCount = parseInt(result?.count || 0);
			return finalCount;
		} catch (err) {
			console.error('[DB Error] Fetching answer count:', err);
			return 0;
		}
	}

	io.on('connection', (socket) => {
		let currentRoom = null;

		socket.on('join-room', async (data) => {
			const roomId = typeof data === 'string' ? data : data.roomId;
			const userData = typeof data === 'object' ? data.userData : null;

			if (!roomId) return;

			socket.join(roomId);
			currentRoom = roomId;

			if (userData && userData.id) {
				if (!roomUsers.has(roomId)) {
					roomUsers.set(roomId, new Map());
				}
				
				const dbCount = await getDbAnswerCount(userData.id, roomId);

				roomUsers.get(roomId).set(socket.id, {
					...userData,
					answerCount: dbCount,
					answeredCurrent: false // Initial state
				});
				
				broadcastRoomUsers(roomId);
			} else {
				broadcastRoomUsers(roomId);
			}
		});

		socket.on('answer-submitted', async (data) => {
			const { roomId } = data;
			if (roomId && roomUsers.has(roomId)) {
				const usersMap = roomUsers.get(roomId);
				if (usersMap.has(socket.id)) {
					const userRecord = usersMap.get(socket.id);
					const freshCount = await getDbAnswerCount(userRecord.id, roomId);
					userRecord.answerCount = freshCount;
					userRecord.answeredCurrent = true; // Mark as answered for current question
					broadcastRoomUsers(roomId);
				}
			}
		});

		socket.on('game-command', (data) => {
			const { roomId, command, payload } = data;
			
			// Reset current answer status for ALL users when preparing a new question
			if (command === 'PREPARE_QUESTION' && roomUsers.has(roomId)) {
				const usersMap = roomUsers.get(roomId);
				for (let user of usersMap.values()) {
					user.answeredCurrent = false;
				}
				broadcastRoomUsers(roomId);
			}

			if (command === 'RESET_GAME' && roomUsers.has(roomId)) {
				const usersMap = roomUsers.get(roomId);
				for (let user of usersMap.values()) {
					user.answerCount = 0;
					user.answeredCurrent = false;
				}
				broadcastRoomUsers(roomId);
			}

			io.to(roomId).emit('game-update', { command, payload });
		});

		socket.on('disconnect', () => {
			if (currentRoom && roomUsers.has(currentRoom)) {
				const usersMap = roomUsers.get(currentRoom);
				if (usersMap.has(socket.id)) {
					usersMap.delete(socket.id);
					broadcastRoomUsers(currentRoom);
				}
			}
		});
	});

	return io;
}

/**
 * Vite Plugin wrapper
 */
export const webSocketServer = {
	name: 'webSocketServer',
	async configureServer(server) {
		if (!server.httpServer) return;
		await injectWebSockets(server.httpServer);
	}
};
