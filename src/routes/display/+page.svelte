<script>
	import { onMount } from 'svelte';
	import { getSocket, joinRoom } from '$lib/socket-client';
	import QRCode from 'qrcode';

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
				}
			});

			// Generate QR Code
			try {
				qrCodeUrl = await QRCode.toDataURL(data.baseUrl, {
					width: 300,
					margin: 2,
					color: {
						dark: '#000000',
						light: '#ffffff'
					}
				});
			} catch (err) {
				console.error('QR Code generation failed:', err);
			}
		}
	});
</script>

<div class="display-container">
	{#if gameState.type === 'intro'}
		<div class="intro-view">
			<div class="intro-content">
				<h1>{data.homeTitle}</h1>
				<p class="subtitle">{data.homeSubtitle}</p>
				{#if data.activeQuiz}
					<div class="active-quiz-badge">
						Quiz: {data.activeQuiz.name}
					</div>
				{/if}
			</div>

			<div class="join-info">
				<div class="qr-wrapper">
					{#if qrCodeUrl}
						<img src={qrCodeUrl} alt="Scan to join" />
					{/if}
				</div>
				<p class="join-text">Σαρώστε για να παίξετε!</p>
				<p class="url-text">{data.baseUrl}</p>
			</div>
		</div>
	{:else}
		<div class="placeholder-view">
			<h2>{gameState.type.toUpperCase()}</h2>
			<p>Υλοποίηση σε εξέλιξη...</p>
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

	/* Intro View Styling */
	.intro-view {
		height: 100%;
		display: grid;
		grid-template-columns: 1fr 400px;
		align-items: center;
		padding: 4rem;
		gap: 4rem;
	}

	.intro-content {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.intro-content h1 {
		font-size: 5rem;
		margin: 0;
		line-height: 1.1;
		font-weight: 800;
		background: linear-gradient(to right, #fff, #9ca3af);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	.subtitle {
		font-size: 2.5rem;
		color: #9ca3af;
		margin: 0;
		max-width: 800px;
	}

	.active-quiz-badge {
		display: inline-block;
		background: #2563eb;
		color: white;
		padding: 0.75rem 1.5rem;
		border-radius: 9999px;
		font-size: 1.5rem;
		font-weight: 600;
		margin-top: 2rem;
		width: fit-content;
	}

	.join-info {
		background: white;
		padding: 2rem;
		border-radius: 24px;
		display: flex;
		flex-direction: column;
		align-items: center;
		color: #000;
		text-align: center;
		box-shadow: 0 25px 50px -12px rgba(255, 255, 255, 0.1);
	}

	.qr-wrapper img {
		width: 100%;
		max-width: 300px;
		height: auto;
		display: block;
	}

	.join-text {
		font-size: 1.5rem;
		font-weight: 800;
		margin: 1rem 0 0.5rem;
		color: #111827;
	}

	.url-text {
		font-size: 1.1rem;
		color: #4b5563;
		margin: 0;
		font-family: monospace;
	}

	.placeholder-view {
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	.placeholder-view h2 { font-size: 4rem; margin-bottom: 1rem; }
	.placeholder-view p { font-size: 1.5rem; opacity: 0.7; }

	@media (max-width: 1200px) {
		.intro-view {
			grid-template-columns: 1fr;
			text-align: center;
			padding: 2rem;
		}
		.intro-content { align-items: center; }
		.intro-content h1 { font-size: 3.5rem; }
		.subtitle { font-size: 1.8rem; }
	}
</style>
