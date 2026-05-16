<script>
	let { 
		options = [], 
		mode = 'display', // 'display' or 'controller'
		selectedId = null,
		showCorrect = false,
		disabled = false,
		onSelect = () => {},
		class: className = ""
	} = $props();

	function getLetter(index) {
		return String.fromCharCode(65 + index);
	}
</script>

<div class="options-grid mode-{mode} {className}">
	{#each options as opt, i}
		{#if mode === 'controller'}
			<button 
				class="option-btn color-{i}" 
				class:selected={selectedId === opt.id}
				class:is-correct-reveal={showCorrect && opt.isCorrect}
				disabled={disabled || (selectedId !== null && selectedId !== opt.id)}
				onclick={() => onSelect(opt.id)}
			>
				<span class="option-letter">{getLetter(i)}</span>
				<span class="option-text">{opt.text}</span>
				{#if selectedId === opt.id}
					<span class="check-icon">✓</span>
				{/if}
			</button>
		{:else}
			<div class="option-card" class:is-correct-reveal={showCorrect && opt.isCorrect}>
				<span class="option-letter">{getLetter(i)}</span>
				<span class="option-text">{opt.text}</span>
			</div>
		{/if}
	{/each}
</div>

<style>
	.options-grid {
		display: grid;
		gap: 1.5rem;
		width: 100%;
	}

	.mode-display {
		grid-template-columns: 1fr 1fr;
	}

	.mode-controller {
		grid-template-columns: 1fr;
		gap: 0.75rem;
	}

	.option-card, .option-btn {
		background: #1f2937;
		border: 3px solid #374151;
		border-radius: 16px;
		padding: 1.25rem;
		display: flex;
		align-items: center;
		gap: 1.5rem;
		color: white;
		text-align: left;
		transition: all 0.2s;
	}

	.is-correct-reveal {
		border-color: #10b981 !important;
		background: #064e3b !important;
		box-shadow: 0 0 20px rgba(16, 185, 129, 0.4);
		transform: scale(1.02);
	}

	.mode-controller .is-correct-reveal {
		background: #ecfdf5 !important;
		color: #065f46 !important;
	}

	.option-letter {
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

	/* Controller Styles */
	.option-btn {
		cursor: pointer;
		box-shadow: 0 2px 4px rgba(0,0,0,0.05);
		position: relative;
		border: 3px solid transparent;
		background: white;
		color: #1e293b;
		padding: 1rem;
	}

	.option-btn .option-letter {
		width: 45px;
		height: 45px;
		font-size: 1.4rem;
	}

	.option-btn .option-text {
		font-size: 1.1rem;
		font-weight: 700;
	}

	.option-btn:not(:disabled):active { transform: scale(0.98); }
	.option-btn.selected { border-color: #0f172a; background: #f8fafc; transform: scale(1.02); z-index: 10; }
	.option-btn:disabled:not(.selected) { opacity: 0.6; filter: grayscale(0.5); }

	.color-0 .option-letter { background: #ef4444; }
	.color-1 .option-letter { background: #3b82f6; }
	.color-2 .option-letter { background: #10b981; }
	.color-3 .option-letter { background: #f59e0b; }

	.check-icon { font-size: 1.5rem; color: #10b981; font-weight: bold; margin-left: auto; }

	@media (max-width: 1200px) {
		.mode-display .option-text { font-size: 1.2rem; }
		.mode-display .option-letter { width: 40px; height: 40px; font-size: 1.4rem; }
	}
</style>
