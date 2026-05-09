<script>
	import { onMount } from 'svelte';
	import { getSocket, joinRoom } from '$lib/socket-client';
	import Card from '$lib/components/Card.svelte';

	let { data } = $props();
	
	let gameState = $state({
		type: 'intro', // 'intro', 'card', 'question', 'leaderboard'
		content: null
	});

	onMount(() => {
		if (data.activeQuizId) {
			joinRoom(data.activeQuizId);
			
			const socket = getSocket();
			socket.on('game-update', (update) => {
				console.log('Controller Received Update:', update);
				
				if (update.command === 'SHOW_INTRO') {
					gameState = { type: 'intro', content: null };
				} else if (update.command === 'SHOW_CONTENT') {
					const item = data.questions[update.payload.index];
					gameState = { type: item.type, content: item };
				} else if (update.command === 'SHOW_LEADERBOARD') {
					gameState = { type: 'leaderboard', content: null };
				}
			});
		}
	});
</script>

<div class="controller-container">
	<header class="quiz-header">
		<h2>{data.activeQuiz?.name || 'Quiz'}</h2>
		<p class="user-info">Παίκτης: <strong>{data.user.username || data.user.name}</strong></p>
	</header>

	<main class="game-area">
		{#if gameState.type === 'intro'}
			<div class="waiting-screen">
				<Card>
					<div class="waiting-content">
						<span class="pulse-icon">⏳</span>
						<h3>Περιμένετε να ξεκινήσει το quiz...</h3>
						<p>Η ροή του παιχνιδιού ελέγχεται από τον Quizmaster.</p>
					</div>
				</Card>
			</div>
		{:else if gameState.type === 'card'}
			<div class="card-screen">
				<Card>
					<h3>{gameState.content.text}</h3>
					<p>Παρακολουθήστε την οθόνη προβολής για περισσότερες πληροφορίες.</p>
				</Card>
			</div>
		{:else if gameState.type === 'question'}
			<div class="question-screen">
				<Card>
					<div class="question-info">
						<span class="q-label">Ερώτηση</span>
						<h3>{gameState.content.text}</h3>
					</div>
					<p class="instructions">Ετοιμαστείτε να απαντήσετε!</p>
					<!-- Answers will go here later -->
				</Card>
			</div>
		{:else if gameState.type === 'leaderboard'}
			<div class="leaderboard-screen">
				<Card>
					<h3>Κατάταξη</h3>
					<p>Δείτε τη θέση σας στη μεγάλη οθόνη!</p>
				</Card>
			</div>
		{/if}
	</main>
</div>

<style>
	.controller-container {
		max-width: 500px;
		margin: 0 auto;
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 2rem;
		min-height: 80vh;
	}

	.quiz-header {
		text-align: center;
		padding: 1rem 0;
		border-bottom: 1px solid #e5e7eb;
	}

	.quiz-header h2 { margin: 0; color: #111827; font-size: 1.25rem; }
	.user-info { margin: 0.5rem 0 0; color: #6b7280; font-size: 0.9rem; }

	.waiting-content {
		text-align: center;
		padding: 2rem 1rem;
	}

	.pulse-icon {
		font-size: 3rem;
		display: block;
		margin-bottom: 1rem;
		animation: pulse 2s infinite;
	}

	@keyframes pulse {
		0% { transform: scale(1); opacity: 1; }
		50% { transform: scale(1.1); opacity: 0.7; }
		100% { transform: scale(1); opacity: 1; }
	}

	.waiting-content h3 { color: #111827; margin: 0 0 1rem; }
	.waiting-content p { color: #6b7280; font-size: 0.95rem; margin: 0; }

	.q-label {
		display: inline-block;
		background: #eff6ff;
		color: #2563eb;
		padding: 0.25rem 0.75rem;
		border-radius: 9999px;
		font-size: 0.75rem;
		font-weight: bold;
		text-transform: uppercase;
		margin-bottom: 0.75rem;
	}

	.question-info h3 { margin: 0; font-size: 1.5rem; color: #111827; line-height: 1.3; }
	.instructions { margin-top: 2rem; color: #6b7280; font-style: italic; }

	.card-screen h3, .leaderboard-screen h3 { text-align: center; color: #111827; }
	.card-screen p, .leaderboard-screen p { text-align: center; color: #6b7280; }
</style>
