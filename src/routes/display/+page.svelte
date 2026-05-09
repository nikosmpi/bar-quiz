<script>
	import { onMount } from 'svelte';
	import { getSocket, joinRoom } from '$lib/socket-client';
	import QRCode from 'qrcode';
	import MediaPreview from '$lib/components/MediaPreview.svelte';

	let { data } = $props();
	
	let gameState = $state({
		type: 'intro', // 'intro', 'card', 'question', 'leaderboard'
		content: null
	});

	let qrCodeUrl = $state('');

	onMount(async () => {
		if (data.activeQuizId) {
			joinRoom(data.activeQuizId);
			
			const socket = getSocket();
			socket.on('game-update', (update) => {
				console.log('Display Received Update:', update);
				
				if (update.command === 'SHOW_INTRO') {
					gameState = { type: 'intro', content: null };
				} else if (update.command === 'SHOW_CONTENT') {
					const item = data.questions[update.payload.index];
					gameState = { type: item.type, content: item };
				} else if (update.command === 'SHOW_LEADERBOARD') {
					gameState = { type: 'leaderboard', content: null };
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
				case 'seek': 
					// YouTube seek is a bit different, we'd need to know current time. 
					// For simple seek without API sync, we'll try to just tell it to seek.
					// Note: This requires the YouTube URL to have enablejsapi=1
					post('seekTo', [value, true]); 
					break;
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

	{:else if gameState.type === 'card'}
		{@const card = gameState.content}
		<div class="card-view template-{card.template}">
			{#if card.template === 'card_full_media'}
				<div class="full-media-wrap">
					<MediaPreview url={card.mediaUrl} type={card.mediaType} class="full-screen-preview" />
					<!-- Title removed as requested -->
				</div>

			{:else if card.template === 'card_split_media'}
				<div class="split-view">
					<div class="media-side">
						<MediaPreview url={card.mediaUrl} type={card.mediaType} />
					</div>
					<div class="text-side">
						<h1>{card.text}</h1>
						{#if card.explanation}<p class="explanation">{card.explanation}</p>{/if}
					</div>
				</div>

			{:else} <!-- card_title_text -->
				<div class="text-centered-view">
					<h1>{card.text}</h1>
					{#if card.explanation}<p class="explanation">{card.explanation}</p>{/if}
				</div>
			{/if}
		</div>

	{:else if gameState.type === 'question'}
		<div class="question-view">
			<h2>Ερώτηση: {gameState.content.text}</h2>
			<p>Περιμένετε τους παίκτες να απαντήσουν...</p>
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
	}

	h1 { margin: 0; font-weight: 800; }

	.intro-view { height: 100%; display: grid; grid-template-columns: 1fr 400px; align-items: center; padding: 4rem; gap: 4rem; }
	.intro-content h1 { font-size: 5rem; line-height: 1.1; background: linear-gradient(to right, #fff, #9ca3af); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
	.subtitle { font-size: 2.5rem; color: #9ca3af; margin: 0; }
	.active-quiz-badge { display: inline-block; background: #2563eb; color: white; padding: 0.75rem 1.5rem; border-radius: 9999px; font-size: 1.5rem; font-weight: 600; margin-top: 2rem; }
	.join-info { background: white; padding: 2rem; border-radius: 24px; display: flex; flex-direction: column; align-items: center; color: #000; text-align: center; }
	.qr-wrapper img { width: 100%; max-width: 300px; }
	.join-text { font-size: 1.5rem; font-weight: 800; margin: 1rem 0 0.5rem; }
	.url-text { font-size: 1.1rem; color: #4b5563; font-family: monospace; }

	.card-view { height: 100%; width: 100%; }
	.full-media-wrap { position: relative; height: 100%; width: 100%; }
	:global(.full-screen-preview) { height: 100% !important; border-radius: 0 !important; }

	.split-view { display: grid; grid-template-columns: 1fr 1fr; height: 100%; }
	.media-side { display: flex; align-items: center; justify-content: center; background: #111; padding: 2rem; }
	.text-side { padding: 4rem; display: flex; flex-direction: column; justify-content: center; gap: 2rem; }
	.text-side h1 { font-size: 4rem; line-height: 1.1; }
	.explanation { font-size: 2rem; color: #9ca3af; line-height: 1.4; }

	.text-centered-view { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 4rem; gap: 2rem; }
	.text-centered-view h1 { font-size: 6rem; max-width: 1200px; }
	.text-centered-view .explanation { font-size: 3rem; max-width: 1000px; }

	.question-view, .leaderboard-view { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
	.question-view h2, .leaderboard-view h2 { font-size: 4rem; }

	@media (max-width: 1200px) {
		.intro-view { grid-template-columns: 1fr; text-align: center; }
		.intro-content { align-items: center; }
		.split-view { grid-template-columns: 1fr; }
	}
</style>
