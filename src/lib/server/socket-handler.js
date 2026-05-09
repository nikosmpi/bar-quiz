import { Server } from 'socket.io';

export const webSocketServer = {
	name: 'webSocketServer',
	configureServer(server) {
		if (!server.httpServer) return;

		const io = new Server(server.httpServer);

		io.on('connection', (socket) => {
			console.log('User connected:', socket.id);

			socket.on('join-room', (roomId) => {
				socket.join(roomId);
				console.log(`Socket ${socket.id} joined room ${roomId}`);
			});

			socket.on('game-command', (data) => {
				// data: { roomId, command, payload }
				const { roomId, command, payload } = data;
				console.log(`Command received for room ${roomId}: ${command}`, payload);
				
				// Broadcast to everyone in the room
				io.to(roomId).emit('game-update', { command, payload });
			});

			socket.on('disconnect', () => {
				console.log('User disconnected:', socket.id);
			});
		});
	}
};
