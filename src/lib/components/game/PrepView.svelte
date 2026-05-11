<script>
	import Card from '../Card.svelte';

	let { 
		mode = 'display',
		questionNumber = 0,
		content = null
	} = $props();
</script>

{#if mode === 'display'}
	<div class="prep-view-display">
		<div class="prep-card">
			<span class="prep-icon">🔔</span>
			<h1>Προετοιμαστείτε!</h1>
			<p>Ακολουθεί η ερώτηση <strong>#{questionNumber}</strong></p>
			<div class="prep-time-info">
				Διαθέσιμος χρόνος: <strong>{content?.timeLimit || 30} δευτερόλεπτα</strong>
			</div>
		</div>
	</div>
{:else}
	<div class="prep-view-controller">
		<Card>
			<div class="attention-content">
				<span class="status-icon pulse">🎯</span>
				<h3>Προετοιμαστείτε!</h3>
				<p class="item-title">Ερώτηση #{questionNumber}</p>
				<p class="sub-text">Διαθέσιμος χρόνος: {content?.timeLimit || 30} δευτερόλεπτα</p>
			</div>
		</Card>
	</div>
{/if}

<style>
	/* Display Styles */
	.prep-view-display { flex: 1; display: flex; align-items: center; justify-content: center; background: radial-gradient(circle, #1e293b 0%, #000 100%); width: 100%; height: 100%; }
	.prep-card { text-align: center; animation: zoomIn 0.5s ease-out; }
	.prep-icon { font-size: 6rem; display: block; margin-bottom: 2rem; animation: rotate 2s infinite linear; }
	.prep-card h1 { font-size: 5rem; text-transform: uppercase; letter-spacing: 4px; color: #f59e0b; margin-bottom: 1rem; font-weight: 800; }
	.prep-card p { font-size: 2.5rem; color: #9ca3af; margin: 0; }
	.prep-time-info { margin-top: 2rem; font-size: 1.5rem; color: #fff; background: rgba(255,255,255,0.1); padding: 1rem 2rem; border-radius: 9999px; display: inline-block; }

	@keyframes zoomIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
	@keyframes rotate { 0% { transform: rotate(0); } 25% { transform: rotate(10deg); } 75% { transform: rotate(-10deg); } 100% { transform: rotate(0); } }

	/* Controller Styles */
	.attention-content { text-align: center; padding: 2.5rem 1rem; }
	.status-icon { font-size: 4rem; display: block; margin-bottom: 1.5rem; }
	.status-icon.pulse { animation: pulse 2s infinite; }
	@keyframes pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.1); opacity: 0.7; } }
	h3 { color: #1e293b; margin: 0 0 1rem; font-size: 1.4rem; font-weight: 800; line-height: 1.2; }
	.item-title { font-weight: 700; color: #2563eb; margin-bottom: 0.5rem !important; font-size: 1.1rem; }
	.sub-text { color: #64748b; font-size: 0.9rem; }
</style>
