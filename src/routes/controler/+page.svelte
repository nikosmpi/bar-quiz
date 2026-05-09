<script>
	import { onMount } from 'svelte';
	import { getSocket, joinRoom } from '$lib/socket-client';
	import Card from '$lib/components/Card.svelte';

	let { data } = $props();
	
	let gameState = $state({
		type: 'intro', // 'intro', 'card', 'question', 'leaderboard', 'prep', 'countdown', 'timesup'
		content: null,
		questionNumber: 0
	});

	let countdown = $state(5);
	let questionTimer = $state(0);
	let selectedOptionId = $state(null);
	let timerInterval;

	function startQuestionTimer() {
		if (timerInterval) clearInterval(timerInterval);
		questionTimer = gameState.content?.timeLimit || 30;
		selectedOptionId = null; // Reset selection for new question
		
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
			joinRoom(data.activeQuizId);
			
			const socket = getSocket();
			socket.on('game-update', (update) => {
				console.log('Controller Received Update:', update);
				
				if (update.command === 'SHOW_INTRO') {
					gameState = { type: 'intro', content: null, questionNumber: 0 };
				} else if (update.command === 'PREPARE_QUESTION') {
					// Use item from payload if available, else fallback to local data
					const q = update.payload.item || data.questions[update.payload.index];
					gameState = { type: 'prep', content: q, questionNumber: update.payload.number };
				} else if (update.command === 'SHOW_CONTENT') {
					// Use item from payload if available, else fallback to local data
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

	function submitAnswer(optionId) {
		if (gameState.type !== 'question' || questionTimer <= 0) return;
		selectedOptionId = optionId;
		console.log('Answer selected:', optionId);
		// Future: Emit SUBMIT_ANSWER to socket
	}
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
						<p class="sub-text">Διαθέσιμος χρόνος: {gameState.content?.timeLimit || 30} δευτερόλεπτα</p>
					</div>
				</Card>
			</div>

		{:else if gameState.type === 'countdown'}
			<div class="countdown-screen">
				<div class="countdown-circle">
					<span class="number">{countdown}</span>
				</div>
				<h3>ΕΤΟΙΜΑΣΤΕΙΤΕ...</h3>
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
				<div class="question-meta-row">
					<span class="q-number-badge">Ερώτηση #{data.questions.filter((q,i) => i <= data.questions.findIndex(x => x.id === gameState.content.id) && q.type === 'question').length}</span>
					<span class="timer-badge" class:low={questionTimer <= 5}>{questionTimer}s</span>
				</div>

				<div class="options-grid">
					{#each gameState.content.options || [] as opt, i}
						<button 
							class="option-btn color-{i}" 
							class:selected={selectedOptionId === opt.id}
							disabled={selectedOptionId !== null}
							onclick={() => submitAnswer(opt.id)}
						>
							<span class="letter">{String.fromCharCode(65 + i)}</span>
							<span class="text">{opt.text}</span>
							{#if selectedOptionId === opt.id}
								<span class="check-icon">✓</span>
							{/if}
						</button>
					{:else}
						<p class="no-options">Δεν βρέθηκαν επιλογές για αυτή την ερώτηση.</p>
					{/each}
				</div>

				{#if selectedOptionId}
					<div class="answer-feedback">
						<p>Η απάντησή σας καταχωρήθηκε!</p>
					</div>
				{/if}
			</div>

		{:else if gameState.type === 'timesup'}
			<div class="timesup-screen">
				<Card>
					<div class="timesup-content">
						<span class="status-icon">⌛</span>
						<h3>ΤΕΛΟΣ ΧΡΟΝΟΥ</h3>
						<p>{selectedOptionId ? 'Η απάντησή σας υποβλήθηκε.' : 'Δεν προλάβατε να απαντήσετε.'}</p>
					</div>
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

	.waiting-content, .attention-content, .timesup-content {
		text-align: center;
		padding: 2.5rem 1rem;
	}

	.status-icon { font-size: 4rem; display: block; margin-bottom: 1.5rem; }
	.status-icon.pulse { animation: pulse 2s infinite; }
	.status-icon.bounce { animation: bounce 2s infinite; }

	@keyframes pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.1); opacity: 0.7; } }
	@keyframes bounce { 0%, 20%, 50%, 80%, 100% {transform: translateY(0);} 40% {transform: translateY(-20px);} 60% {transform: translateY(-10px);} }

	h3 { color: #1e293b; margin: 0 0 1rem; font-size: 1.4rem; font-weight: 800; line-height: 1.2; }
	p { color: #64748b; font-size: 1rem; margin: 0; line-height: 1.5; }
	
	.item-title { font-weight: 700; color: #2563eb; margin-bottom: 0.5rem !important; }

	/* Countdown */
	.countdown-screen { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
	.countdown-circle {
		width: 120px; height: 120px;
		background: #2563eb;
		border-radius: 50%;
		display: flex; align-items: center; justify-content: center;
		margin-bottom: 2rem;
		box-shadow: 0 10px 25px rgba(37, 99, 235, 0.3);
		animation: pulse 1s infinite;
	}
	.countdown-circle .number { font-size: 5rem; font-weight: 900; color: white; }

	/* Question Screen */
	.question-meta-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
	.q-number-badge { background: #eff6ff; color: #2563eb; padding: 0.4rem 1rem; border-radius: 999px; font-weight: 800; font-size: 0.85rem; }
	.timer-badge { background: #0f172a; color: white; padding: 0.4rem 1rem; border-radius: 999px; font-weight: 800; font-size: 1rem; border: 2px solid #2563eb; }
	.timer-badge.low { background: #ef4444; border-color: #fca5a5; animation: blink 0.5s infinite; }
	@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

	.question-text-box { margin-bottom: 2rem; text-align: center; }
	.question-text-box h3 { font-size: 1.5rem; margin: 0; }

	.options-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 0.75rem;
		flex: 1;
	}

	.option-btn {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem;
		border: 3px solid transparent;
		border-radius: 16px;
		background: white;
		cursor: pointer;
		text-align: left;
		transition: all 0.2s;
		box-shadow: 0 2px 4px rgba(0,0,0,0.05);
		position: relative;
	}

	.option-btn:not(:disabled):active { transform: scale(0.98); }
	.option-btn.selected { border-color: #0f172a; background: #f8fafc; transform: scale(1.02); z-index: 10; }
	.option-btn:disabled:not(.selected) { opacity: 0.6; filter: grayscale(0.5); }

	.option-btn .letter {
		width: 45px; height: 45px;
		border-radius: 12px;
		display: flex; align-items: center; justify-content: center;
		font-size: 1.4rem; font-weight: 900; color: white;
		flex-shrink: 0;
	}

	.option-btn .text { font-size: 1.1rem; font-weight: 700; color: #1e293b; flex: 1; }
	.check-icon { font-size: 1.5rem; color: #10b981; font-weight: bold; }

	.color-0 .letter { background: #ef4444; }
	.color-1 .letter { background: #3b82f6; }
	.color-2 .letter { background: #10b981; }
	.color-3 .letter { background: #f59e0b; }

	.no-options { text-align: center; color: #94a3b8; font-style: italic; padding: 2rem; }

	.answer-feedback {
		margin-top: 1.5rem;
		text-align: center;
		padding: 1rem;
		background: #f0fdf4;
		border-radius: 12px;
		border: 1px solid #dcfce7;
	}
	.answer-feedback p { color: #166534; font-weight: 700; }

	.timesup-screen { animation: shake 0.5s ease-in-out; }
	@keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-10px); } 75% { transform: translateX(10px); } }
</style>
