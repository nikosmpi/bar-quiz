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
	let hasInteracted = $state(false);
	let showCorrect = $state(false);

	let timerInterval;

	function startQuestionTimer() {
		if (timerInterval) clearInterval(timerInterval);
		questionTimer = gameState.content?.timeLimit || 30;
		showCorrect = false;
		
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
		showCorrect = false;
		
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

	onMount(async () => {
		if (data.activeQuizId) {
			joinRoom(data.activeQuizId);
			
			const socket = getSocket();
			socket.on('game-update', (update) => {
				if (update.command === 'SHOW_INTRO') {
					gameState = { type: 'intro', content: null, questionNumber: 0 };
				} else if (update.command === 'PREPARE_QUESTION') {
					const q = data.questions[update.payload.index];
					gameState = { type: 'prep', content: q, questionNumber: update.payload.number };
				} else if (update.command === 'SHOW_CONTENT') {
					const item = data.questions[update.payload.index];
					const isReview = update.payload.isReview || false;
					showCorrect = false;

					if (item.type === 'question') {
						if (isReview) {
							if (timerInterval) clearInterval(timerInterval);
							questionTimer = 0;
							gameState = { type: 'question', content: item, questionNumber: update.payload.number || 0 };
						} else {
							startCountdown(item);
						}
					} else {
						gameState = { type: item.type, content: item, questionNumber: 0 };
					}
				} else if (update.command === 'SHOW_LEADERBOARD') {
					gameState = { type: 'leaderboard', content: update.payload, questionNumber: 0 };
				} else if (update.command === 'SHOW_CORRECT_ANSWER') {
					showCorrect = true;
				} else if (update.command === 'VIDEO_CONTROL') {
					handleVideoControl(update.payload.action, update.payload.value);
				}
			});
		}
	});

	function handleVideoControl(action, value) {
		const video = document.querySelector('video');
		const iframe = document.getElementById('yt-player');
		if (video) {
			try {
				switch (action) {
					case 'play': video.play().catch(e => console.error(e)); break;
					case 'pause': video.pause(); break;
					case 'stop': video.pause(); video.currentTime = 0; break;
					case 'seek': video.currentTime += value; break;
					case 'mute': video.muted = true; break;
					case 'unmute': video.muted = false; video.volume = 1.0; break;
				}
			} catch (e) { console.error(e); }
		}
		if (iframe) {
			try {
				const post = (func, args = "") => iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func, args }), '*');
				switch (action) {
					case 'play': post('playVideo'); break;
					case 'pause': post('pauseVideo'); break;
					case 'stop': post('stopVideo'); post('seekTo', [0, true]); break;
					case 'seek': post('seekTo', [value, true]); break;
					case 'mute': post('mute'); break;
					case 'unmute': post('unMute'); post('setVolume', 100); break;
				}
			} catch (e) { console.error(e); }
		}
	}

	function enableMedia() { hasInteracted = true; }
</script>

<div class="display-container" onclick={enableMedia} onkeydown={enableMedia} role="button" tabindex="0">
	{#if !hasInteracted}
		<div class="interaction-overlay">
			<div class="interaction-prompt">
				<span class="icon">🖱️</span>
				<h2>Κάντε κλικ για ενεργοποίηση</h2>
				<p>Απαραίτητο για την αναπαραγωγή ήχου και video.</p>
			</div>
		</div>
	{/if}

	{#if gameState.type === 'intro'}
		<IntroView 
			mode="display" 
			homeTitle={data.homeTitle} 
			homeSubtitle={data.homeSubtitle} 
			activeQuiz={data.activeQuiz} 
			baseUrl={data.baseUrl} 
		/>
	{:else if gameState.type === 'prep'}
		<PrepView mode="display" questionNumber={gameState.questionNumber} content={gameState.content} />
	{:else if gameState.type === 'countdown'}
		<CountdownView mode="display" {countdown} />
	{:else if gameState.type === 'card'}
		<CardView mode="display" content={gameState.content} />
	{:else if gameState.type === 'question'}
		<QuestionView mode="display" content={gameState.content} {questionTimer} {showCorrect} />
	{:else if gameState.type === 'timesup'}
		<TimesUpView mode="display" />
	{:else if gameState.type === 'leaderboard'}
		<LeaderboardView mode="display" />
	{/if}
</div>

<style>
	.display-container {
		height: 100vh;
		width: 100vw;
		background-color: #000;
		color: #fff;
		overflow: hidden;
		box-sizing: border-box;
		font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
		display: flex;
		flex-direction: column;
		position: relative;
	}

	.interaction-overlay {
		position: absolute;
		top: 0; left: 0; right: 0; bottom: 0;
		background: rgba(0,0,0,0.9);
		z-index: 10000;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
	}

	.interaction-prompt { text-align: center; color: white; }
	.interaction-prompt .icon { font-size: 5rem; display: block; margin-bottom: 1rem; animation: pulse 2s infinite; }
	.interaction-prompt h2 { font-size: 2.5rem; margin-bottom: 0.5rem; }
	.interaction-prompt p { font-size: 1.2rem; opacity: 0.7; }

	@keyframes pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.1); opacity: 0.7; } }
</style>
