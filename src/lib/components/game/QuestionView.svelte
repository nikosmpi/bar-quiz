<script>
	import MediaPreview from '../MediaPreview.svelte';
	import TimerBadge from '../shared/TimerBadge.svelte';
	import OptionGrid from '../shared/OptionGrid.svelte';

	let { 
		mode = 'display',
		content = null,
		questionTimer = 0,
		selectedOptionId = null,
		showCorrect = false,
		isAlreadyAnswered = false,
		onSelect = () => {}
	} = $props();
</script>

{#if mode === 'display'}
	<div class="question-view-display">
		<TimerBadge value={questionTimer} class="absolute-timer" />
		
		<div class="question-header">
			<h1>{content?.text}</h1>
			{#if content?.explanation}
				<p class="explanation">{content.explanation}</p>
			{/if}
		</div>
		
		<div class="media-container">
			{#if content?.mediaUrl}
				<MediaPreview url={content.mediaUrl} type={content.mediaType} class="question-media-preview" />
			{/if}
		</div>

		<OptionGrid options={content?.options || []} mode="display" {showCorrect} />
	</div>
{:else}
	<div class="question-view-controller">
		<div class="question-meta-row">
			<span class="q-number-badge">Ερώτηση</span>
			<TimerBadge value={questionTimer} showLabel={false} showSuffix={true} class="mini-timer" />
		</div>

		<OptionGrid 
			options={content?.options || []} 
			mode="controller" 
			selectedId={selectedOptionId}
			{showCorrect}
			disabled={isAlreadyAnswered}
			onSelect={onSelect}
		/>

		{#if selectedOptionId || isAlreadyAnswered}
			<div class="answer-feedback">
				<p>Η απάντησή σας καταχωρήθηκε!</p>
			</div>
		{/if}
	</div>
{/if}

<style>
	/* Display Styles */
	.question-view-display {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 2rem 4rem;
		gap: 1.5rem;
		height: 100%;
		justify-content: space-between;
		box-sizing: border-box;
		position: relative;
	}

	:global(.absolute-timer) {
		position: absolute;
		top: 2rem;
		right: 2rem;
		z-index: 1000;
	}

	.question-header {
		text-align: center;
		padding-right: 180px; /* Clear the absolute timer */
		min-height: 100px;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	.question-header h1 { font-size: 3rem; line-height: 1.2; margin: 0; font-weight: 800; }
	.question-header .explanation { font-size: 1.5rem; color: #9ca3af; margin: 0.5rem 0 0; }

	.media-container {
		flex: 1;
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 0;
		padding: 1rem 0;
	}

	:global(.question-media-preview) {
		max-height: 100% !important;
		width: auto !important;
		object-fit: contain;
	}

	/* Controller Styles */
	.question-view-controller { flex: 1; display: flex; flex-direction: column; }
	.question-meta-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
	.q-number-badge { background: #eff6ff; color: #2563eb; padding: 0.4rem 1rem; border-radius: 999px; font-weight: 800; font-size: 0.85rem; }
	
	:global(.mini-timer) {
		padding: 0.4rem 1rem !important;
		border-radius: 999px !important;
		min-width: auto !important;
		border-width: 2px !important;
	}
	:global(.mini-timer .timer-value) { font-size: 1rem !important; }

	.answer-feedback {
		margin-top: 1.5rem;
		text-align: center;
		padding: 1rem;
		background: #f0fdf4;
		border-radius: 12px;
		border: 1px solid #dcfce7;
	}
	.answer-feedback p { color: #166534; font-weight: 700; margin: 0; }

	@media (max-width: 1200px) {
		.question-header { padding-right: 0; padding-top: 6rem; }
		.question-header h1 { font-size: 2rem; }
	}
</style>
