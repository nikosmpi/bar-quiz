<script>
	let { 
		mode = 'display',
		countdown = 5
	} = $props();
</script>

{#if mode === 'display'}
	<div class="countdown-view-display">
		<div class="countdown-circle">
			<span class="number" key={countdown}>{countdown}</span>
			<svg><circle r="140" cx="150" cy="150"></circle></svg>
		</div>
		<h2>ΕΤΟΙΜΑΣΤΕΙΤΕ...</h2>
	</div>
{:else}
	<div class="countdown-view-controller">
		<div class="countdown-circle-mini">
			<span class="number">{countdown}</span>
		</div>
		<h3>ΕΤΟΙΜΑΣΤΕΙΤΕ...</h3>
	</div>
{/if}

<style>
	/* Display Styles */
	.countdown-view-display { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; background: radial-gradient(circle, #1e293b 0%, #000 100%); width: 100%; height: 100%; }
	.countdown-circle { position: relative; width: 300px; height: 300px; display: flex; align-items: center; justify-content: center; margin-bottom: 2rem; }
	.countdown-circle .number { font-size: 8rem; font-weight: 900; color: #fff; z-index: 1; animation: scaleIn 0.5s ease-out; }
	.countdown-circle svg { position: absolute; width: 300px; height: 300px; transform: rotate(-90deg); }
	.countdown-circle circle { fill: none; stroke: #2563eb; stroke-width: 15; stroke-dasharray: 880; stroke-linecap: round; }
	.countdown-view-display h2 { font-size: 3rem; letter-spacing: 8px; color: #2563eb; animation: pulse 1s infinite; font-weight: 800; }
	
	@keyframes scaleIn { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
	@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

	/* Controller Styles */
	.countdown-view-controller { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
	.countdown-circle-mini {
		width: 120px; height: 120px;
		background: #2563eb;
		border-radius: 50%;
		display: flex; align-items: center; justify-content: center;
		margin-bottom: 2rem;
		box-shadow: 0 10px 25px rgba(37, 99, 235, 0.3);
		animation: pulse-mini 1s infinite;
	}
	.countdown-circle-mini .number { font-size: 5rem; font-weight: 900; color: white; }
	.countdown-view-controller h3 { color: #1e293b; margin: 0; font-size: 1.4rem; font-weight: 800; }

	@keyframes pulse-mini { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.1); opacity: 0.7; } }
</style>
