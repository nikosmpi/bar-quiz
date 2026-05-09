<script>
	import Button from './Button.svelte';
	import MediaPreview from './MediaPreview.svelte';
	import MediaPicker from './MediaPicker.svelte';

	let { 
		mediaType = $bindable('none'), 
		mediaUrl = $bindable(''),
		allowYouTube = true,
		allowVideoFile = true
	} = $props();

	let showPicker = $state(false);

	function removeMedia() {
		mediaUrl = '';
	}

	function changeType(newType) {
		if (newType === 'none') {
			removeMedia();
		}
		mediaType = newType;
	}

	function selectFromLibrary(item) {
		mediaUrl = item.url;
		showPicker = false;
	}
</script>

<div class="media-field">
	<div class="media-selector">
		<button 
			type="button" 
			class:active={mediaType === 'none'} 
			onclick={() => changeType('none')}
		>Χωρίς</button>
		
		<button 
			type="button" 
			class:active={mediaType === 'image'} 
			onclick={() => changeType('image')}
		>Εικόνα</button>
		
		{#if allowYouTube}
			<button 
				type="button" 
				class:active={mediaType === 'video'} 
				onclick={() => changeType('video')}
			>YouTube</button>
		{/if}
		
		{#if allowVideoFile}
			<button 
				type="button" 
				class:active={mediaType === 'video_file'} 
				onclick={() => changeType('video_file')}
			>Βίντεο (MP4)</button>
		{/if}
	</div>

	<div class="media-content">
		{#if mediaType === 'image' || mediaType === 'video_file'}
			<div class="library-trigger">
				{#if !mediaUrl}
					<Button variant="secondary" onclick={() => showPicker = true} class="btn-full">
						Άνοιγμα Βιβλιοθήκης Πολυμέσων
					</Button>
				{:else}
					<div class="preview-container">
						<MediaPreview url={mediaUrl} type={mediaType === 'video_file' ? 'video_file' : 'image'} />
						<div class="preview-actions">
							<Button variant="secondary" onclick={() => showPicker = true}>Αλλαγή</Button>
							<Button variant="danger" onclick={removeMedia}>Αφαίρεση</Button>
						</div>
					</div>
				{/if}
			</div>
		{:else if mediaType === 'video'}
			<div class="url-input">
				<label for="media-url">YouTube URL:</label>
				<input 
					type="text" 
					id="media-url" 
					bind:value={mediaUrl} 
					placeholder="https://www.youtube.com/watch?v=..." 
				/>
				{#if mediaUrl}
					<div class="preview-container">
						<MediaPreview url={mediaUrl} type="video" />
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>

{#if showPicker}
	<MediaPicker 
		type={mediaType === 'video_file' ? 'video' : 'image'} 
		onSelect={selectFromLibrary} 
		onClose={() => showPicker = false} 
	/>
{/if}

<style>
	.media-field {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.media-selector {
		display: flex;
		gap: 0.25rem;
		background: #f3f4f6;
		padding: 0.25rem;
		border-radius: 8px;
	}

	.media-selector button {
		flex: 1;
		padding: 0.5rem;
		border: none;
		background: transparent;
		border-radius: 6px;
		cursor: pointer;
		font-weight: 600;
		font-size: 0.8rem;
		color: #4b5563;
		transition: all 0.2s;
	}

	.media-selector button.active {
		background: white;
		color: #111827;
		box-shadow: 0 1px 2px rgba(0,0,0,0.1);
	}

	.preview-container {
		position: relative;
		margin-top: 0.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.preview-actions {
		display: flex;
		gap: 0.5rem;
	}

	.url-input {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.url-input label {
		font-size: 0.85rem;
		font-weight: 600;
		color: #4b5563;
	}

	.url-input input {
		padding: 0.6rem;
		border: 1px solid #d1d5db;
		border-radius: 4px;
		width: 100%;
		box-sizing: border-box;
	}
</style>
