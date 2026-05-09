import { Server } from 'socket.io';

export const webSocketServer = {
	name: 'webSocketServer',
	async configureServer(server) {
		if (!server.httpServer) return;

		// Move DB imports inside to avoid Vite config loading issues ($env not available in vite.config)
		const { db } = await import('./db/index.js');
		const { answer } = await import('./db/schema.js');
		const { eq, and, sql } = await import('drizzle-orm');

		const io = new Server(server.httpServer);

		// Map to store user data per room
		// roomId -> Map(socketId -> { userData, answerCount })
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
				console.log(`[DB] Count for User:${userId} Quiz:${quizId} => ${finalCount}`);
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
						answerCount: dbCount
					});
					
					console.log(`[Join] Player: ${userData.username || userData.name} joined ${roomId} with ${dbCount} answers`);
					broadcastRoomUsers(roomId);
				} else {
					console.log(`[Join] Manager/Display joined room: ${roomId}`);
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
						broadcastRoomUsers(roomId);
					}
				}
			});

			socket.on('game-command', (data) => {
				const { roomId, command, payload } = data;
				
				if (command === 'RESET_GAME' && roomUsers.has(roomId)) {
					const usersMap = roomUsers.get(roomId);
					for (let user of usersMap.values()) {
						user.answerCount = 0;
					}
					console.log(`[Game] Resetting counts for room ${roomId}`);
					broadcastRoomUsers(roomId);
				}

				io.to(roomId).emit('game-update', { command, payload });
			});

			socket.on('disconnect', () => {
				if (currentRoom && roomUsers.has(currentRoom)) {
					const usersMap = roomUsers.get(currentRoom);
					if (usersMap.has(socket.id)) {
						console.log(`[Leave] User from room ${currentRoom} disconnected`);
						usersMap.delete(socket.id);
						broadcastRoomUsers(currentRoom);
					}
				}
			});
		});
	}
};
