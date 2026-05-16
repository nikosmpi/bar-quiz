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

	let hasMedia = $derived(content?.mediaUrl);
	let isMediaTemplate = $derived(content?.template === 'question_media');
</script>

{#if mode === 'display'}
	<div class="question-view-display template-{content?.template || 'standard'}" class:has-media={hasMedia}>
		<TimerBadge value={questionTimer} class="absolute-timer" />
		
		{#if isMediaTemplate && hasMedia}
			<div class="split-layout">
				<div class="media-side">
					<MediaPreview url={content.mediaUrl} type={content.mediaType} class="question-media-preview" />
				</div>
				<div class="content-side">
					<div class="question-header">
						<h1>{content?.text}</h1>
						{#if content?.explanation}
							<p class="explanation">{content.explanation}</p>
						{/if}
					</div>
					<OptionGrid options={content?.options || []} mode="display" {showCorrect} />
				</div>
			</div>
		{:else}
			<div class="standard-layout">
				<div class="question-header">
					<h1>{content?.text}</h1>
					{#if content?.explanation}
						<p class="explanation">{content.explanation}</p>
					{/if}
				</div>
				
				{#if hasMedia}
					<div class="media-container">
						<MediaPreview url={content.mediaUrl} type={content.mediaType} class="question-media-preview" />
					</div>
				{/if}

				<OptionGrid options={content?.options || []} mode="display" {showCorrect} />
			</div>
		{/if}
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
		height: 100%;
		box-sizing: border-box;
		position: relative;
		overflow: hidden;
	}

	.standard-layout {
		display: flex;
		flex-direction: column;
		padding: 1.5rem 3rem;
		gap: 1rem;
		height: 100%;
		justify-content: space-between;
	}

	.split-layout {
		display: grid;
		grid-template-columns: 0.8fr 1.2fr;
		height: 100%;
	}

	.media-side {
		background: rgba(0,0,0,0.2);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1.5rem;
		min-height: 0;
	}

	.content-side {
		display: flex;
		flex-direction: column;
		padding: 2rem;
		gap: 1.5rem;
		justify-content: center;
		background: rgba(255,255,255,0.03);
	}

	:global(.absolute-timer) {
		position: absolute;
		top: 1.5rem;
		right: 1.5rem;
		z-index: 1000;
	}

	.question-header {
		text-align: center;
		min-height: 80px;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	.standard-layout .question-header {
		padding-right: 140px; /* Clear the absolute timer */
	}

	.question-header h1 { font-size: 2.2rem; line-height: 1.2; margin: 0; font-weight: 800; }
	.question-header .explanation { font-size: 1.2rem; color: #9ca3af; margin: 0.4rem 0 0; }

	.media-container {
		flex: 1;
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 0;
		padding: 0.5rem 0;
	}

	:global(.question-media-preview) {
		max-height: 100% !important;
		width: auto !important;
		max-width: 100% !important;
		object-fit: contain;
		border-radius: 12px;
		box-shadow: 0 15px 20px -5px rgba(0, 0, 0, 0.3);
	}

	.split-layout :global(.question-media-preview) {
		max-height: 70vh !important;
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
		.standard-layout .question-header { padding-right: 0; padding-top: 6rem; }
		.question-header h1 { font-size: 2rem; }
		.split-layout { grid-template-columns: 1fr; }
		.media-side { padding: 1rem; height: 40vh; }
		.content-side { padding: 1.5rem; }
	}
</style>
