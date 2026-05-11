<script>
	import { onMount } from 'svelte';
	import { getSocket, joinRoom } from '$lib/socket-client';
	
	import IntroView from '$lib/components/game/IntroView.svelte';
	import PrepView from '$lib/components/game/PrepView.svelte';
	import CountdownView from '$lib/components/game/CountdownView.svelte';
	import CardView from '$lib/components/game/CardView.svelte';
	import QuestionView from '$lib/components/game/QuestionView.svelte';
	import TimesUpView from '$lib/components/game/TimesUpView.svelte';
	import LeaderboardView from '$lib/components/game/LeaderboardView.svelte';

	let { data } = $props();
	
	let gameState = $state({
		type: 'intro', // 'intro', 'card', 'question', 'leaderboard', 'prep', 'countdown', 'timesup'
		content: null,
		questionNumber: 0
	});

	let countdown = $state(5);
	let questionTimer = $state(0);
	let selectedOptionId = $state(null);
	let userAnswers = $state(data.userAnswers || []);
	let timerInterval;

	// Check if current question is already answered
	let isAlreadyAnswered = $derived(
		gameState.type === 'question' && 
		gameState.content && 
		userAnswers.some(a => a.questionId === gameState.content.id)
	);

	// Get the selected option ID for the current question if it exists
	let previouslySelectedId = $derived(
		gameState.content ? userAnswers.find(a => a.questionId === gameState.content.id)?.optionId : null
	);

	$effect(() => {
		if (previouslySelectedId) {
			selectedOptionId = previouslySelectedId;
		}
	});

	function startQuestionTimer() {
		if (timerInterval) clearInterval(timerInterval);
		questionTimer = gameState.content?.timeLimit || 30;
		
		// Reset local selection ONLY if not already answered
		if (!isAlreadyAnswered) {
			selectedOptionId = null;
		}
		
		timerInterval = setInterval(() => {
			if (questionTimer > 0) {
				questionTimer -= 1;
			} else {
				clearInterval(timerInterval);
				gameState.type = 'timesup';
			}
		}, 1000);
	}

	function startCountdown(targetItem) {
		gameState.type = 'countdown';
		gameState.content = targetItem;
		countdown = 5;
		
		if (timerInterval) clearInterval(timerInterval);
		
		const timer = setInterval(() => {
			countdown -= 1;
			if (countdown <= 0) {
				clearInterval(timer);
				gameState.type = 'question';
				startQuestionTimer();
			}
		}, 1000);
	}

	onMount(() => {
		if (data.activeQuizId) {
			joinRoom(data.activeQuizId, data.user);
			
			const socket = getSocket();
			socket.on('game-update', (update) => {
				console.log('Controller Received Update:', update);
				
				if (update.command === 'SHOW_INTRO') {
					gameState = { type: 'intro', content: null, questionNumber: 0 };
				} else if (update.command === 'RESET_GAME') {
					userAnswers = [];
					selectedOptionId = null;
					gameState = { type: 'intro', content: null, questionNumber: 0 };
				} else if (update.command === 'PREPARE_QUESTION') {
					const q = update.payload.item || data.questions[update.payload.index];
					gameState = { type: 'prep', content: q, questionNumber: update.payload.number };
				} else if (update.command === 'SHOW_CONTENT') {
					const item = update.payload.item || data.questions[update.payload.index];
					if (item.type === 'question') {
						startCountdown(item);
					} else {
						gameState = { type: item.type, content: item, questionNumber: 0 };
					}
				} else if (update.command === 'SHOW_LEADERBOARD') {
					gameState = { type: 'leaderboard', content: null, questionNumber: 0 };
				}
			});
		}
	});

	async function submitAnswer(optionId) {
		if (gameState.type !== 'question' || questionTimer <= 0 || selectedOptionId || isAlreadyAnswered) return;
		
		selectedOptionId = optionId;
		
		try {
			const response = await fetch('/api/game/answer', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					quizId: data.activeQuizId,
					questionId: gameState.content.id,
					optionId: optionId
				})
			});
			
			const result = await response.json();
			if (!response.ok) {
				console.error('Error submitting answer:', result.error);
			} else {
				console.log('Answer saved successfully:', result);
				userAnswers.push({
					questionId: gameState.content.id,
					optionId: optionId
				});
				
				const socket = getSocket();
				if (socket) {
					socket.emit('answer-submitted', { roomId: data.activeQuizId });
				}
			}
		} catch (err) {
			console.error('Network error while submitting answer:', err);
		}
	}
</script>

<div class="controller-container">
	<header class="quiz-header">
		<h2>{data.activeQuiz?.name || 'Quiz'}</h2>
		<p class="user-info">Παίκτης: <strong>{data.user.username || data.user.name}</strong></p>
	</header>

	<main class="game-area">
		{#if gameState.type === 'intro'}
			<IntroView mode="controller" />
		{:else if gameState.type === 'prep'}
			<PrepView mode="controller" questionNumber={gameState.questionNumber} content={gameState.content} />
		{:else if gameState.type === 'countdown'}
			<CountdownView mode="controller" {countdown} />
		{:else if gameState.type === 'card'}
			<CardView mode="controller" content={gameState.content} />
		{:else if gameState.type === 'question'}
			<QuestionView 
				mode="controller" 
				content={gameState.content} 
				{questionTimer} 
				{selectedOptionId} 
				{isAlreadyAnswered}
				onSelect={submitAnswer}
			/>
		{:else if gameState.type === 'timesup'}
			<TimesUpView mode="controller" hasAnswered={selectedOptionId || isAlreadyAnswered} />
		{:else if gameState.type === 'leaderboard'}
			<LeaderboardView mode="controller" />
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
		gap: 1rem;
		min-height: 95vh;
		background: #f8fafc;
	}

	.quiz-header {
		text-align: center;
		padding: 0.5rem 0;
		border-bottom: 1px solid #e2e8f0;
	}

	.quiz-header h2 { margin: 0; color: #0f172a; font-size: 1.1rem; font-weight: 800; }
	.user-info { margin: 0.2rem 0 0; color: #64748b; font-size: 0.8rem; }

	.game-area { flex: 1; display: flex; flex-direction: column; margin-top: 1rem; }
</style>

