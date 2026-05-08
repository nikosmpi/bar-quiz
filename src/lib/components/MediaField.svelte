<script>
	import Button from './Button.svelte';
	import MediaPreview from './MediaPreview.svelte';

	let { 
		mediaType = $bindable('none'), 
		mediaUrl = $bindable(''),
		originalUrl = '',
		allowYouTube = true,
		allowVideoFile = true
	} = $props();

	let uploading = $state(false);

	async function deleteFile(url) {
		if (!url || !url.startsWith('/uploads/')) return;
		if (url === originalUrl) return;

		try {
			await fetch('/api/upload', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ url })
			});
		} catch (err) {
			console.error('Failed to delete file:', err);
		}
	}

	async function handleUpload(e) {
		const file = e.target.files[0];
		if (!file) return;

		uploading = true;
		const formData = new FormData();
		formData.append('file', file);

		try {
			const response = await fetch('/api/upload', {
				method: 'POST',
				body: formData
			});
			const result = await response.json();
			if (result.success) {
				if (mediaUrl && mediaUrl.startsWith('/uploads/') && mediaUrl !== originalUrl) {
					await deleteFile(mediaUrl);
				}
				mediaUrl = result.url;
			} else {
				alert(result.error || 'Σφάλμα στο ανέβασμα');
			}
		} catch (error) {
			console.error(error);
			alert('Αποτυχία ανεβάσματος αρχείου');
		} finally {
			uploading = false;
		}
	}

	async function removeMedia() {
		if (mediaUrl && mediaUrl.startsWith('/uploads/') && mediaUrl !== originalUrl) {
			await deleteFile(mediaUrl);
		}
		mediaUrl = '';
	}

	function changeType(newType) {
		if (newType === 'none') {
			removeMedia();
		}
		mediaType = newType;
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
		{#if mediaType === 'image'}
			<div class="upload-zone">
				<input 
					type="file" 
					accept="image/*" 
					onchange={handleUpload} 
					disabled={uploading} 
				/>
				{#if uploading}<p class="status">Ανέβασμα...</p>{/if}
				{#if mediaUrl && !mediaUrl.endsWith('.mp4')}
					<div class="preview-container">
						<MediaPreview url={mediaUrl} type="image" />
						<Button variant="danger" onclick={removeMedia} class="remove-btn">✕</Button>
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
		{:else if mediaType === 'video_file'}
			<div class="upload-zone">
				<input 
					type="file" 
					accept="video/mp4" 
					onchange={handleUpload} 
					disabled={uploading} 
				/>
				{#if uploading}<p class="status">Ανέβασμα...</p>{/if}
				{#if mediaUrl && mediaUrl.endsWith('.mp4')}
					<div class="preview-container">
						<MediaPreview url={mediaUrl} type="video_file" />
						<Button variant="danger" onclick={removeMedia} class="remove-btn">✕</Button>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>

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

	.upload-zone {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.status {
		font-size: 0.85rem;
		color: #2563eb;
		margin: 0;
	}

	.preview-container {
		position: relative;
		margin-top: 0.5rem;
	}

	.remove-btn {
		position: absolute;
		top: 5px;
		right: 5px;
		width: 28px;
		height: 28px;
		padding: 0;
		border-radius: 50%;
		z-index: 10;
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
