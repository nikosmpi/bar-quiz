import { io } from 'socket.io-client';
import { browser } from '$app/environment';

let socket;

export const getSocket = () => {
	if (!browser) return null;
	
	if (!socket) {
		socket = io();
		console.log('Socket client initialized');
	}
	
	return socket;
};

export const joinRoom = (roomId, userData = null) => {
	const s = getSocket();
	if (s) {
		console.log(`Joining room ${roomId}`, userData);
		s.emit('join-room', { roomId, userData });
	}
};

export const sendCommand = (roomId, command, payload = {}) => {
	const s = getSocket();
	if (s) s.emit('game-command', { roomId, command, payload });
};
