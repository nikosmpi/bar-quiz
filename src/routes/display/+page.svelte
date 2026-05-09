<script>
	import { onMount } from 'svelte';
	import { getSocket, joinRoom } from '$lib/socket-client';

	let { data } = $props();
	let status = $state('Αναμονή για έναρξη...');

	onMount(() => {
		if (data.activeQuizId) {
			joinRoom(data.activeQuizId);
			
			const socket = getSocket();
			socket.on('game-update', (data) => {
				status = `Εντολή: ${data.command}`;
				console.log('Display Received Update:', data);
			});
		}
	});
</script>

<div class="display-container">
	<h1>Quiz Display</h1>
	<p class="status">{status}</p>
</div>

<style>
	.display-container {
		height: 100vh;
		width: 100vw;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		background-color: #000;
		color: #fff;
		text-align: center;
		padding: 2rem;
		overflow: hidden;
		box-sizing: border-box;
	}

	h1 {
		font-size: 4rem;
		margin-bottom: 2rem;
	}

	.status {
		font-size: 2.5rem;
		color: #10b981;
		font-weight: bold;
		text-transform: uppercase;
		letter-spacing: 2px;
	}
</style>
