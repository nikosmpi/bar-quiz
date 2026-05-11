<script>
	import Card from '../Card.svelte';
	import QRCodeDisplay from '../shared/QRCodeDisplay.svelte';

	let { 
		mode = 'display',
		homeTitle = "",
		homeSubtitle = "",
		activeQuiz = null,
		baseUrl = ""
	} = $props();
</script>

{#if mode === 'display'}
	<div class="intro-view-display">
		<div class="intro-content">
			<h1>{homeTitle}</h1>
			<p class="subtitle">{homeSubtitle}</p>
			{#if activeQuiz}
				<div class="active-quiz-badge">Quiz: {activeQuiz.name}</div>
			{/if}
		</div>
		<div class="join-info">
			<QRCodeDisplay url={baseUrl} size={300} class="qr-wrapper" />
			<p class="join-text">Σαρώστε για να παίξετε!</p>
			<p class="url-text">{baseUrl}</p>
		</div>
	</div>
{:else}
	<div class="intro-view-controller">
		<Card>
			<div class="waiting-content">
				<span class="status-icon pulse">⏳</span>
				<h3>Περιμένετε να ξεκινήσει το quiz...</h3>
				<p>Η ροή του παιχνιδιού ελέγχεται από τον Quizmaster.</p>
			</div>
		</Card>
	</div>
{/if}

<style>
	/* Display Styles */
	.intro-view-display { flex: 1; display: grid; grid-template-columns: 1fr 400px; align-items: center; padding: 4rem; gap: 4rem; width: 100%; height: 100%; box-sizing: border-box; }
	.intro-content h1 { font-size: 5rem; line-height: 1.1; margin: 0; background: linear-gradient(to right, #fff, #9ca3af); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 800; }
	.subtitle { font-size: 2.5rem; color: #9ca3af; margin: 0; }
	.active-quiz-badge { display: inline-block; background: #2563eb; color: white; padding: 0.75rem 1.5rem; border-radius: 9999px; font-size: 1.5rem; font-weight: 600; margin-top: 2rem; }
	
	.join-info { background: white; padding: 2rem; border-radius: 24px; display: flex; flex-direction: column; align-items: center; color: #000; text-align: center; }
	.join-text { font-size: 1.5rem; font-weight: 800; margin: 1rem 0 0.5rem; }
	.url-text { font-size: 1.1rem; color: #4b5563; font-family: monospace; }

	/* Controller Styles */
	.waiting-content { text-align: center; padding: 2.5rem 1rem; }
	.status-icon { font-size: 4rem; display: block; margin-bottom: 1.5rem; }
	.status-icon.pulse { animation: pulse 2s infinite; }
	@keyframes pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.1); opacity: 0.7; } }
	h3 { color: #1e293b; margin: 0 0 1rem; font-size: 1.4rem; font-weight: 800; line-height: 1.2; }
	p { color: #64748b; font-size: 1rem; margin: 0; line-height: 1.5; }

	@media (max-width: 1200px) {
		.intro-view-display { grid-template-columns: 1fr; text-align: center; }
		.intro-content { display: flex; flex-direction: column; align-items: center; }
	}
</style>
