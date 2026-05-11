<script>
	import Card from '../Card.svelte';
	import MediaPreview from '../MediaPreview.svelte';

	let { 
		mode = 'display',
		content = null
	} = $props();

	let hasMedia = $derived(content?.mediaType !== 'none' && content?.mediaUrl);
</script>

{#if mode === 'display'}
	<div class="card-view-display template-{content?.template}">
		{#if content?.template === 'card_full_media' && hasMedia}
			<div class="full-media-wrap">
				<MediaPreview url={content.mediaUrl} type={content.mediaType} class="full-screen-preview" />
			</div>
		{:else if content?.template === 'card_split_media' && hasMedia}
			<div class="split-view">
				<div class="media-side"><MediaPreview url={content.mediaUrl} type={content.mediaType} /></div>
				<div class="text-side">
					<div class="text-animate-up">
						<h1>{content.text}</h1>
						{#if content.explanation}<p class="explanation">{content.explanation}</p>{/if}
					</div>
				</div>
			</div>
		{:else}
			<div class="text-centered-view" class:only-title={!content?.explanation}>
				<div class="text-animate-up">
					<h1>{content?.text}</h1>
					{#if content?.explanation}<p class="explanation">{content.explanation}</p>{/if}
				</div>
			</div>
		{/if}
	</div>
{:else}
	<div class="card-view-controller">
		<Card>
			<div class="attention-content">
				<span class="status-icon bounce">📺</span>
				<h3>Δείτε την κεντρική οθόνη</h3>
				<p class="item-title">"{content?.text}"</p>
				<p class="sub-text">Ο Quizmaster προβάλλει πληροφορίες αυτή τη στιγμή.</p>
			</div>
		</Card>
	</div>
{/if}

<style>
	/* Display Styles */
	.card-view-display { flex: 1; width: 100%; height: 100%; }
	.full-media-wrap { position: relative; height: 100%; width: 100%; }
	:global(.full-screen-preview) { height: 100% !important; border-radius: 0 !important; width: 100% !important; object-fit: contain; }
	
	.split-view { display: grid; grid-template-columns: 1fr 1fr; height: 100%; }
	.media-side { display: flex; align-items: center; justify-content: center; background: #111; padding: 2rem; }
	.text-side { padding: 4rem; display: flex; flex-direction: column; justify-content: center; gap: 2rem; align-items: center; text-align: center; }
	.text-side h1 { font-size: 4rem; line-height: 1.1; margin: 0; }
	.explanation { font-size: 2rem; color: #9ca3af; line-height: 1.4; margin-top: 1rem; }
	
	.text-centered-view { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 4rem; gap: 2rem; box-sizing: border-box; }
	.text-centered-view h1 { font-size: 4rem; max-width: 1200px; color: #fff; line-height: 1.2; margin: 0; }
	.text-centered-view .explanation { font-size: 2.5rem; max-width: 1000px; color: #9ca3af; margin-top: 2rem; }
	.text-centered-view.only-title h1 { font-size: 7rem; background: linear-gradient(to bottom, #fff, #94a3b8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

	.text-animate-up { animation: fadeInUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards; width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; }
	@keyframes fadeInUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

	/* Controller Styles */
	.attention-content { text-align: center; padding: 2.5rem 1rem; }
	.status-icon { font-size: 4rem; display: block; margin-bottom: 1.5rem; }
	.status-icon.bounce { animation: bounce 2s infinite; }
	@keyframes bounce { 0%, 20%, 50%, 80%, 100% {transform: translateY(0);} 40% {transform: translateY(-20px);} 60% {transform: translateY(-10px);} }
	h3 { color: #1e293b; margin: 0 0 1rem; font-size: 1.4rem; font-weight: 800; line-height: 1.2; }
	.item-title { font-weight: 700; color: #2563eb; margin-bottom: 0.5rem !important; }
	.sub-text { color: #64748b; font-size: 0.9rem; }

	@media (max-width: 1200px) {
		.split-view { grid-template-columns: 1fr; }
		.text-side h1 { font-size: 2.5rem; }
		.text-centered-view h1 { font-size: 3rem; }
		.text-centered-view.only-title h1 { font-size: 4rem; }
	}
</style>
