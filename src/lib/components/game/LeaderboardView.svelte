<script>
	import Card from '../Card.svelte';

	let { mode = 'display' } = $props();
</script>

{#if mode === 'display'}
	<div class="leaderboard-view-display">
		<h2>Κατάταξη</h2>
		<div class="placeholder-msg">
			<span class="icon">🏆</span>
			<p>Σύντομα κοντά σας!</p>
		</div>
	</div>
{:else}
	<div class="leaderboard-view-controller">
		<Card>
			<div class="attention-content">
				<span class="status-icon pulse">🏆</span>
				<h3>Δείτε την κεντρική οθόνη</h3>
				<p class="sub-text">Η κατάταξη εμφανίζεται στη μεγάλη οθόνη!</p>
			</div>
		</Card>
	</div>
{/if}

<style>
	/* Display Styles */
	.leaderboard-view-display { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; width: 100%; height: 100%; }
	.leaderboard-view-display h2 { font-size: 4rem; color: #fff; margin-bottom: 2rem; font-weight: 800; }
	.placeholder-msg { background: rgba(255,255,255,0.1); padding: 3rem; border-radius: 24px; }
	.placeholder-msg .icon { font-size: 5rem; display: block; margin-bottom: 1rem; }
	.placeholder-msg p { font-size: 2rem; color: #9ca3af; margin: 0; }

	/* Controller Styles */
	.attention-content { text-align: center; padding: 2.5rem 1rem; }
	.status-icon { font-size: 4rem; display: block; margin-bottom: 1.5rem; }
	.status-icon.pulse { animation: pulse 2s infinite; }
	@keyframes pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.1); opacity: 0.7; } }
	h3 { color: #1e293b; margin: 0 0 1rem; font-size: 1.4rem; font-weight: 800; }
	.sub-text { color: #64748b; font-size: 1rem; }
</style>
