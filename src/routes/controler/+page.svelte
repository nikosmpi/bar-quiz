<script>
	import { onMount } from 'svelte';
	import { getSocket, joinRoom } from '$lib/socket-client';
	import Card from '$lib/components/Card.svelte';

	let { data } = $props();
	
	let gameState = $state({
		type: 'intro', // 'intro', 'card', 'question', 'leaderboard', 'prep'
		content: null,
		questionNumber: 0
	});

	onMount(() => {
		if (data.activeQuizId) {
			joinRoom(data.activeQuizId);
			
			const socket = getSocket();
			socket.on('game-update', (update) => {
				console.log('Controller Received Update:', update);
				
				if (update.command === 'SHOW_INTRO') {
					gameState = { type: 'intro', content: null, questionNumber: 0 };
				} else if (update.command === 'PREPARE_QUESTION') {
					gameState = { type: 'prep', content: null, questionNumber: update.payload.number };
				} else if (update.command === 'SHOW_CONTENT') {
					const item = data.questions[update.payload.index];
					gameState = { type: item.type, content: item, questionNumber: 0 };
				} else if (update.command === 'SHOW_LEADERBOARD') {
					gameState = { type: 'leaderboard', content: null, questionNumber: 0 };
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
						<span class="status-icon pulse">⏳</span>
						<h3>Περιμένετε να ξεκινήσει το quiz...</h3>
						<p>Η ροή του παιχνιδιού ελέγχεται από τον Quizmaster.</p>
					</div>
				</Card>
			</div>

		{:else if gameState.type === 'prep'}
			<div class="attention-screen">
				<Card>
					<div class="attention-content">
						<span class="status-icon pulse">🎯</span>
						<h3>Προετοιμαστείτε!</h3>
						<p class="item-title">Ερώτηση #{gameState.questionNumber}</p>
						<p class="sub-text">Η ερώτηση θα εμφανιστεί σύντομα στην οθόνη σας.</p>
					</div>
				</Card>
			</div>

		{:else if gameState.type === 'card'}
			<div class="attention-screen">
				<Card>
					<div class="attention-content">
						<span class="status-icon bounce">📺</span>
						<h3>Δείτε την κεντρική οθόνη</h3>
						<p class="item-title">"{gameState.content.text}"</p>
						<p class="sub-text">Ο Quizmaster προβάλλει πληροφορίες αυτή τη στιγμή.</p>
					</div>
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
			<div class="attention-screen">
				<Card>
					<div class="attention-content">
						<span class="status-icon pulse">🏆</span>
						<h3>Δείτε την κεντρική οθόνη</h3>
						<p class="sub-text">Η κατάταξη εμφανίζεται στη μεγάλη οθόνη!</p>
					</div>
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

	.waiting-content, .attention-content {
		text-align: center;
		padding: 2.5rem 1rem;
	}

	.status-icon {
		font-size: 4rem;
		display: block;
		margin-bottom: 1.5rem;
	}

	.status-icon.pulse { animation: pulse 2s infinite; }
	.status-icon.bounce { animation: bounce 2s infinite; }

	@keyframes pulse {
		0% { transform: scale(1); opacity: 1; }
		50% { transform: scale(1.1); opacity: 0.7; }
		100% { transform: scale(1); opacity: 1; }
	}

	@keyframes bounce {
		0%, 20%, 50%, 80%, 100% {transform: translateY(0);}
		40% {transform: translateY(-20px);}
		60% {transform: translateY(-10px);}
	}

	h3 { color: #111827; margin: 0 0 1rem; font-size: 1.5rem; font-weight: 800; }
	p { color: #6b7280; font-size: 1rem; margin: 0; line-height: 1.5; }
	
	.item-title {
		font-weight: 600;
		color: #2563eb;
		margin-bottom: 0.5rem !important;
	}

	.sub-text {
		font-size: 0.9rem !important;
		opacity: 0.8;
	}

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
</style>
