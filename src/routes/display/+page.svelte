<script>
	import { onMount } from 'svelte';
	import { getSocket, joinRoom } from '$lib/socket-client';
	import QRCode from 'qrcode';
	import MediaPreview from '$lib/components/MediaPreview.svelte';

	let { data } = $props();
	
	let gameState = $state({
		type: 'intro', // 'intro', 'card', 'question', 'leaderboard', 'prep', 'countdown', 'timesup'
		content: null,
		questionNumber: 0
	});

	let countdown = $state(5);
	let questionTimer = $state(0);
	let qrCodeUrl = $state('');
	let hasInteracted = $state(false);

	let timerInterval;

	function startQuestionTimer() {
		if (timerInterval) clearInterval(timerInterval);
		questionTimer = gameState.content?.timeLimit || 30;
		
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
					if (item.type === 'question') {
						startCountdown(item);
					} else {
						gameState = { type: item.type, content: item, questionNumber: 0 };
					}
				} else if (update.command === 'SHOW_LEADERBOARD') {
					gameState = { type: 'leaderboard', content: null, questionNumber: 0 };
				} else if (update.command === 'VIDEO_CONTROL') {
					handleVideoControl(update.payload.action, update.payload.value);
				}
			});

			try {
				qrCodeUrl = await QRCode.toDataURL(data.baseUrl, {
					width: 300,
					margin: 2,
					color: { dark: '#000000', light: '#ffffff' }
				});
			} catch (err) { console.error(err); }
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

	{#if gameState.type === 'question'}
		<div class="question-timer-badge">
			<span class="timer-label">ΧΡΟΝΟΣ</span>
			<span class="timer-value" class:low-time={questionTimer <= 5}>{questionTimer}</span>
		</div>
	{/if}

	{#if gameState.type === 'intro'}
		<div class="intro-view">
			<div class="intro-content">
				<h1>{data.homeTitle}</h1>
				<p class="subtitle">{data.homeSubtitle}</p>
				{#if data.activeQuiz}
					<div class="active-quiz-badge">Quiz: {data.activeQuiz.name}</div>
				{/if}
			</div>
			<div class="join-info">
				<div class="qr-wrapper">
					{#if qrCodeUrl}<img src={qrCodeUrl} alt="Scan to join" />{/if}
				</div>
				<p class="join-text">Σαρώστε για να παίξετε!</p>
				<p class="url-text">{data.baseUrl}</p>
			</div>
		</div>

	{:else if gameState.type === 'prep'}
		<div class="prep-view">
			<div class="prep-card">
				<span class="prep-icon">🔔</span>
				<h1>Προετοιμαστείτε!</h1>
				<p>Ακολουθεί η ερώτηση <strong>#{gameState.questionNumber}</strong></p>
				<div class="prep-time-info">
					Διαθέσιμος χρόνος: <strong>{gameState.content?.timeLimit || 30} δευτερόλεπτα</strong>
				</div>
			</div>
		</div>

	{:else if gameState.type === 'countdown'}
		<div class="countdown-view">
			<div class="countdown-circle">
				<span class="number" key={countdown}>{countdown}</span>
				<svg><circle r="140" cx="150" cy="150"></circle></svg>
			</div>
			<h2>ΕΤΟΙΜΑΣΤΕΙΤΕ...</h2>
		</div>

	{:else if gameState.type === 'card'}
		{@const card = gameState.content}
		{@const hasMedia = card.mediaType !== 'none' && card.mediaUrl}
		
		<div class="card-view template-{card.template}">
			{#if card.template === 'card_full_media' && hasMedia}
				<div class="full-media-wrap">
					<MediaPreview url={card.mediaUrl} type={card.mediaType} class="full-screen-preview" />
				</div>
			{:else if card.template === 'card_split_media' && hasMedia}
				<div class="split-view">
					<div class="media-side"><MediaPreview url={card.mediaUrl} type={card.mediaType} /></div>
					<div class="text-side">
						<div class="text-animate-up">
							<h1>{card.text}</h1>
							{#if card.explanation}<p class="explanation">{card.explanation}</p>{/if}
						</div>
					</div>
				</div>
			{:else}
				<div class="text-centered-view" class:only-title={!card.explanation}>
					<div class="text-animate-up">
						<h1>{card.text}</h1>
						{#if card.explanation}<p class="explanation">{card.explanation}</p>{/if}
					</div>
				</div>
			{/if}
		</div>

	{:else if gameState.type === 'question'}
		<div class="question-view">
			<div class="question-header">
				<h1>{gameState.content.text}</h1>
				{#if gameState.content.explanation}
					<p class="explanation">{gameState.content.explanation}</p>
				{/if}
			</div>
			
			<div class="media-container">
				{#if gameState.content.mediaUrl}
					<MediaPreview url={gameState.content.mediaUrl} type={gameState.content.mediaType} class="question-media-preview" />
				{/if}
			</div>

			<div class="options-grid">
				{#each gameState.content.options as opt, i}
					<div class="option-card">
						<span class="option-letter">{String.fromCharCode(65 + i)}</span>
						<span class="option-text">{opt.text}</span>
					</div>
				{/each}
			</div>
		</div>

	{:else if gameState.type === 'timesup'}
		<div class="timesup-view">
			<div class="timesup-card">
				<span class="timesup-icon">⌛</span>
				<h1>ΤΕΛΟΣ ΧΡΟΝΟΥ</h1>
			</div>
		</div>

	{:else if gameState.type === 'leaderboard'}
		<div class="leaderboard-view">
			<h2>Κατάταξη</h2>
			<p>Σύντομα κοντά σας!</p>
		</div>
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

	h1 { margin: 0; font-weight: 800; }

	/* Global Question Timer */
	.question-timer-badge {
		position: absolute;
		top: 2rem;
		right: 2rem;
		background: rgba(0, 0, 0, 0.8);
		border: 4px solid #2563eb;
		padding: 0.75rem 1.5rem;
		border-radius: 20px;
		display: flex;
		flex-direction: column;
		align-items: center;
		z-index: 1000;
		min-width: 140px;
		animation: slideInRight 0.5s ease-out;
	}
	@keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
	
	.timer-label { font-size: 0.8rem; font-weight: 900; color: #3b82f6; letter-spacing: 2px; margin-bottom: 0.1rem; }
	.timer-value { font-size: 3.5rem; font-weight: 900; line-height: 1; }
	.timer-value.low-time { color: #ef4444; animation: blink 0.5s infinite; }
	@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

	/* Animations */
	.text-animate-up {
		animation: fadeInUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	@keyframes fadeInUp {
		from { transform: translateY(40px); opacity: 0; }
		to { transform: translateY(0); opacity: 1; }
	}

	/* Views */
	.intro-view { flex: 1; display: grid; grid-template-columns: 1fr 400px; align-items: center; padding: 4rem; gap: 4rem; }
	.intro-content h1 { font-size: 5rem; line-height: 1.1; background: linear-gradient(to right, #fff, #9ca3af); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
	.subtitle { font-size: 2.5rem; color: #9ca3af; margin: 0; }
	.active-quiz-badge { display: inline-block; background: #2563eb; color: white; padding: 0.75rem 1.5rem; border-radius: 9999px; font-size: 1.5rem; font-weight: 600; margin-top: 2rem; }
	.join-info { background: white; padding: 2rem; border-radius: 24px; display: flex; flex-direction: column; align-items: center; color: #000; text-align: center; }
	.qr-wrapper img { width: 100%; max-width: 300px; }
	.join-text { font-size: 1.5rem; font-weight: 800; margin: 1rem 0 0.5rem; }
	.url-text { font-size: 1.1rem; color: #4b5563; font-family: monospace; }
	
	.prep-view { flex: 1; display: flex; align-items: center; justify-content: center; background: radial-gradient(circle, #1e293b 0%, #000 100%); }
	.prep-card { text-align: center; animation: zoomIn 0.5s ease-out; }
	.prep-icon { font-size: 6rem; display: block; margin-bottom: 2rem; animation: rotate 2s infinite linear; }
	.prep-card h1 { font-size: 5rem; text-transform: uppercase; letter-spacing: 4px; color: #f59e0b; margin-bottom: 1rem; }
	.prep-card p { font-size: 2.5rem; color: #9ca3af; }
	.prep-time-info { margin-top: 2rem; font-size: 1.5rem; color: #fff; background: rgba(255,255,255,0.1); padding: 1rem 2rem; border-radius: 9999px; }
	@keyframes zoomIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
	@keyframes rotate { 0% { transform: rotate(0); } 25% { transform: rotate(10deg); } 75% { transform: rotate(-10deg); } 100% { transform: rotate(0); } }

	/* Countdown */
	.countdown-view { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; background: radial-gradient(circle, #1e293b 0%, #000 100%); }
	.countdown-circle { position: relative; width: 300px; height: 300px; display: flex; align-items: center; justify-content: center; margin-bottom: 2rem; }
	.countdown-circle .number { font-size: 8rem; font-weight: 900; color: #fff; z-index: 1; animation: scaleIn 0.5s ease-out; }
	.countdown-circle svg { position: absolute; width: 300px; height: 300px; transform: rotate(-90deg); }
	.countdown-circle circle { fill: none; stroke: #2563eb; stroke-width: 15; stroke-dasharray: 880; stroke-linecap: round; }
	.countdown-view h2 { font-size: 3rem; letter-spacing: 8px; color: #2563eb; animation: pulse 1s infinite; }
	@keyframes scaleIn { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }

	/* Time's Up View */
	.timesup-view { flex: 1; display: flex; align-items: center; justify-content: center; background: radial-gradient(circle, #7f1d1d 0%, #000 100%); }
	.timesup-card { text-align: center; animation: shake 0.5s ease-in-out; }
	.timesup-icon { font-size: 8rem; display: block; margin-bottom: 2rem; }
	.timesup-card h1 { font-size: 6rem; color: #fff; text-shadow: 0 0 30px rgba(239, 68, 68, 0.5); margin-bottom: 1rem; }
	.timesup-card p { font-size: 2rem; color: #fca5a5; }
	@keyframes shake {
		0%, 100% { transform: translateX(0); }
		25% { transform: translateX(-10px); }
		75% { transform: translateX(10px); }
	}

	/* Card View */
	.card-view { flex: 1; width: 100%; }
	.full-media-wrap { position: relative; height: 100%; width: 100%; }
	:global(.full-screen-preview) { height: 100% !important; border-radius: 0 !important; }
	.split-view { display: grid; grid-template-columns: 1fr 1fr; height: 100%; }
	.media-side { display: flex; align-items: center; justify-content: center; background: #111; padding: 2rem; }
	.text-side { padding: 4rem; display: flex; flex-direction: column; justify-content: center; gap: 2rem; align-items: center; text-align: center; }
	.text-side h1 { font-size: 4rem; line-height: 1.1; }
	.explanation { font-size: 2rem; color: #9ca3af; line-height: 1.4; }
	.text-centered-view { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 4rem; gap: 2rem; }
	.text-centered-view h1 { font-size: 4rem; max-width: 1200px; color: #fff; line-height: 1.2; margin: 0; }
	.text-centered-view .explanation { font-size: 2.5rem; max-width: 1000px; color: #9ca3af; margin-top: 2rem; }
	.text-centered-view.only-title h1 { font-size: 7rem; background: linear-gradient(to bottom, #fff, #94a3b8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

	/* Question View - REFACTORED */
	.question-view {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 2rem 4rem;
		gap: 1.5rem;
		height: 100%;
		justify-content: space-between;
		box-sizing: border-box;
	}

	.question-header {
		text-align: center;
		padding-right: 180px; /* Clear the absolute timer */
		min-height: 100px;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	.question-header h1 {
		font-size: 3rem;
		line-height: 1.2;
		margin: 0;
	}

	.question-header .explanation {
		font-size: 1.5rem;
		color: #9ca3af;
		margin: 0.5rem 0 0;
	}

	.media-container {
		flex: 1;
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 0; /* Important for flex shrink */
		padding: 1rem 0;
	}

	:global(.question-media-preview) {
		max-height: 100% !important;
		width: auto !important;
		object-fit: contain;
	}

	.options-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.5rem;
		flex: 0 0 auto;
		margin-bottom: 1rem;
	}

	.option-card {
		background: #1f2937;
		border: 3px solid #374151;
		border-radius: 16px;
		padding: 1.25rem;
		display: flex;
		align-items: center;
		gap: 1.5rem;
	}

	.option-letter {
		width: 50px;
		height: 50px;
		background: #2563eb;
		border-radius: 10px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.75rem;
		font-weight: 900;
		flex-shrink: 0;
	}

	.option-text {
		font-size: 1.5rem;
		font-weight: 600;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.leaderboard-view { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }

	@media (max-width: 1200px) {
		.intro-view { grid-template-columns: 1fr; text-align: center; }
		.intro-content { align-items: center; }
		.split-view { grid-template-columns: 1fr; }
		.question-header { padding-right: 0; padding-top: 6rem; }
	}
</style>
