<script>
	let { 
		value = 0, 
		label = "ΧΡΟΝΟΣ", 
		lowTimeLimit = 5, 
		showLabel = true, 
		showSuffix = false,
		class: className = ""
	} = $props();

	let isLowTime = $derived(value <= lowTimeLimit && value > 0);
</script>

<div class="timer-badge {className}" class:low-time={isLowTime}>
	{#if showLabel}
		<span class="timer-label">{label}</span>
	{/if}
	<span class="timer-value">{value}{showSuffix ? 's' : ''}</span>
</div>

<style>
	.timer-badge {
		background: rgba(0, 0, 0, 0.8);
		border: 4px solid #2563eb;
		padding: 0.75rem 1.5rem;
		border-radius: 20px;
		display: flex;
		flex-direction: column;
		align-items: center;
		min-width: 140px;
		color: white;
		transition: all 0.3s ease;
	}

	.timer-label {
		font-size: 0.8rem;
		font-weight: 900;
		color: #3b82f6;
		letter-spacing: 2px;
		margin-bottom: 0.1rem;
		text-transform: uppercase;
	}

	.timer-value {
		font-size: 3.5rem;
		font-weight: 900;
		line-height: 1;
	}

	.low-time {
		border-color: #ef4444;
	}

	.low-time .timer-value {
		color: #ef4444;
		animation: blink 0.5s infinite;
	}

	@keyframes blink {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.5; }
	}
</style>
