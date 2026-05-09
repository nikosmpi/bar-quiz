<script>
	import { onMount } from 'svelte';
	import { getSocket, joinRoom } from '$lib/socket-client';

	let { data } = $props();
	let lastCommand = $state('Αναμονή για εντολή...');

	onMount(() => {
		if (data.activeQuizId) {
			joinRoom(data.activeQuizId);
			
			const socket = getSocket();
			socket.on('game-update', (data) => {
				lastCommand = `Λήψη εντολής: ${data.command}`;
				console.log('Game Update Received:', data);
			});
		}
	});
</script>

<div class="controller-container">
	<h1>Quiz Controller</h1>
	<div class="status-card">
		<p class="quiz-info">Συνδεδεμένος στο Quiz: <strong>{data.activeQuizId || 'Άγνωστο'}</strong></p>
		<p class="command-display">{lastCommand}</p>
	</div>
</div>

<style>
	.controller-container {
		max-width: 600px;
		margin: 0 auto;
		padding: 2rem 1rem;
		text-align: center;
	}

	h1 {
		color: #111827;
		margin-bottom: 2rem;
	}

	.status-card {
		background: white;
		padding: 2rem;
		border-radius: 12px;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
	}

	.quiz-info {
		color: #6b7280;
		margin-bottom: 1rem;
	}

	.command-display {
		font-size: 1.5rem;
		font-weight: bold;
		color: #2563eb;
	}
</style>
