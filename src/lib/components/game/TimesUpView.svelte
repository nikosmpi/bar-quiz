<script>
	import Card from '../Card.svelte';

	let { 
		mode = 'display',
		hasAnswered = false
	} = $props();
</script>

{#if mode === 'display'}
	<div class="timesup-view-display">
		<div class="timesup-card">
			<span class="timesup-icon">⌛</span>
			<h1>ΤΕΛΟΣ ΧΡΟΝΟΥ</h1>
		</div>
	</div>
{:else}
	<div class="timesup-view-controller">
		<Card>
			<div class="timesup-content">
				<span class="status-icon">⌛</span>
				<h3>ΤΕΛΟΣ ΧΡΟΝΟΥ</h3>
				<p>{hasAnswered ? 'Η απάντησή σας υποβλήθηκε.' : 'Δεν προλάβατε να απαντήσετε.'}</p>
			</div>
		</Card>
	</div>
{/if}

<style>
	/* Display Styles */
	.timesup-view-display { flex: 1; display: flex; align-items: center; justify-content: center; background: radial-gradient(circle, #7f1d1d 0%, #000 100%); width: 100%; height: 100%; }
	.timesup-card { text-align: center; animation: shake 0.5s ease-in-out; }
	.timesup-icon { font-size: 8rem; display: block; margin-bottom: 2rem; }
	.timesup-view-display h1 { font-size: 6rem; color: #fff; text-shadow: 0 0 30px rgba(239, 68, 68, 0.5); margin: 0; font-weight: 800; }
	
	@keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-10px); } 75% { transform: translateX(10px); } }

	/* Controller Styles */
	.timesup-content { text-align: center; padding: 2.5rem 1rem; }
	.status-icon { font-size: 4rem; display: block; margin-bottom: 1.5rem; }
	h3 { color: #1e293b; margin: 0 0 1rem; font-size: 1.4rem; font-weight: 800; }
	p { color: #64748b; font-size: 1rem; margin: 0; }
</style>
