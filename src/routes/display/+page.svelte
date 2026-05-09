<script>
	import { onMount } from 'svelte';
	import { getSocket, joinRoom } from '$lib/socket-client';
	import QRCode from 'qrcode';
	import MediaPreview from '$lib/components/MediaPreview.svelte';

	let { data } = $props();
	
	let gameState = $state({
		type: 'intro', // 'intro', 'card', 'question', 'leaderboard', 'prep'
		content: null,
		questionNumber: 0
	});

	let qrCodeUrl = $state('');

	onMount(async () => {
		if (data.activeQuizId) {
			joinRoom(data.activeQuizId);
			
			const socket = getSocket();
			socket.on('game-update', (update) => {
				console.log('Display Received Update:', update);
				
				if (update.command === 'SHOW_INTRO') {
					gameState = { type: 'intro', content: null, questionNumber: 0 };
				} else if (update.command === 'PREPARE_QUESTION') {
					gameState = { type: 'prep', content: null, questionNumber: update.payload.number };
				} else if (update.command === 'SHOW_CONTENT') {
					const item = data.questions[update.payload.index];
					gameState = { type: item.type, content: item, questionNumber: 0 };
				} else if (update.command === 'SHOW_LEADERBOARD') {
					gameState = { type: 'leaderboard', content: null, questionNumber: 0 };
				} else if (update.command === 'VIDEO_CONTROL') {
					handleVideoControl(update.payload.action, update.payload.value);
				}
			});

			// Generate QR Code
			try {
				qrCodeUrl = await QRCode.toDataURL(data.baseUrl, {
					width: 300,
					margin: 2,
					color: { dark: '#000000', light: '#ffffff' }
				});
			} catch (err) {
				console.error('QR Code generation failed:', err);
			}
		}
	});

	function handleVideoControl(action, value) {
		const video = document.querySelector('video');
		const iframe = document.querySelector('iframe');

		if (video) {
			switch (action) {
				case 'play': video.play(); break;
				case 'pause': video.pause(); break;
				case 'stop': video.pause(); video.currentTime = 0; break;
				case 'seek': video.currentTime += value; break;
				case 'mute': video.muted = true; break;
				case 'unmute': video.muted = false; video.volume = 1; break;
			}
		}

		if (iframe) {
			const post = (func, args = '') => iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func, args }), '*');
			switch (action) {
				case 'play': post('playVideo'); break;
				case 'pause': post('pauseVideo'); break;
				case 'stop': post('stopVideo'); break;
				case 'seek': post('seekTo', [value, true]); break;
				case 'mute': post('mute'); break;
				case 'unmute': post('unMute'); post('setVolume', [100]); break;
			}
		}
	}
</script>

<div class="display-container">
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
			</div>
		</div>

	{:else if gameState.type === 'card'}
		{@const card = gameState.content}
		<div class="card-view template-{card.template}">
			{#if card.template === 'card_full_media'}
				<div class="full-media-wrap">
					<MediaPreview url={card.mediaUrl} type={card.mediaType} class="full-screen-preview" />
				</div>
			{:else if card.template === 'card_split_media'}
				<div class="split-view">
					<div class="media-side">
						<MediaPreview url={card.mediaUrl} type={card.mediaType} />
					</div>
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
					<MediaPreview url={gameState.content.mediaUrl} type={gameState.content.mediaType} />
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
	}

	h1 { margin: 0; font-weight: 800; }

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

	/* Intro View */
	.intro-view { 
		flex: 1;
		display: grid; 
		grid-template-columns: 1fr 400px; 
		align-items: center; 
		padding: 4rem; 
		gap: 4rem; 
	}
	.intro-content h1 { font-size: 5rem; line-height: 1.1; background: linear-gradient(to right, #fff, #9ca3af); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
	.subtitle { font-size: 2.5rem; color: #9ca3af; margin: 0; }
	.active-quiz-badge { display: inline-block; background: #2563eb; color: white; padding: 0.75rem 1.5rem; border-radius: 9999px; font-size: 1.5rem; font-weight: 600; margin-top: 2rem; }
	.join-info { background: white; padding: 2rem; border-radius: 24px; display: flex; flex-direction: column; align-items: center; color: #000; text-align: center; }
	.qr-wrapper img { width: 100%; max-width: 300px; }
	.join-text { font-size: 1.5rem; font-weight: 800; margin: 1rem 0 0.5rem; }
	.url-text { font-size: 1.1rem; color: #4b5563; font-family: monospace; }

	/* Prep View */
	.prep-view { flex: 1; display: flex; align-items: center; justify-content: center; background: radial-gradient(circle, #1e293b 0%, #000 100%); }
	.prep-card { text-align: center; animation: zoomIn 0.5s ease-out; }
	.prep-icon { font-size: 6rem; display: block; margin-bottom: 2rem; animation: rotate 2s infinite linear; }
	.prep-card h1 { font-size: 5rem; text-transform: uppercase; letter-spacing: 4px; color: #f59e0b; margin-bottom: 1rem; }
	.prep-card p { font-size: 2.5rem; color: #9ca3af; }

	@keyframes zoomIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
	@keyframes rotate { 0% { transform: rotate(0); } 25% { transform: rotate(10deg); } 75% { transform: rotate(-10deg); } 100% { transform: rotate(0); } }

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

	/* Question View */
	.question-view { flex: 1; display: flex; flex-direction: column; padding: 3rem; gap: 2rem; }
	.question-header { text-align: center; }
	.question-header h1 { font-size: 3.5rem; margin-bottom: 1rem; }
	.media-container { flex: 1; display: flex; justify-content: center; align-items: center; overflow: hidden; max-height: 40vh; }
	.options-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; height: 30vh; }
	.option-card { background: #1f2937; border: 3px solid #374151; border-radius: 20px; padding: 1.5rem; display: flex; align-items: center; gap: 2rem; }
	.option-letter { width: 60px; height: 60px; background: #2563eb; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 900; }
	.option-text { font-size: 1.75rem; font-weight: 600; }

	.leaderboard-view { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }

	@media (max-width: 1200px) {
		.intro-view { grid-template-columns: 1fr; text-align: center; }
		.intro-content { align-items: center; }
		.split-view { grid-template-columns: 1fr; }
	}
</style>
