<script>
	import { enhance } from '$app/forms';
	let { data, form } = $props();

	let loading = $state(false);
	let uploading = $state(false);
	let message = $state(null);

	// Local state for media
	let mediaType = $state('none');
	let mediaUrl = $state('');

	$effect(() => {
		mediaType = data.question.mediaType || 'none';
		mediaUrl = data.question.mediaUrl || '';
	});

	$effect(() => {
		if (form?.success) {
			message = { type: 'success', text: 'Αλλαγές αποθηκεύτηκαν!' };
			setTimeout(() => message = null, 3000);
		}
	});

	async function deleteFile(url) {
		if (!url || !url.startsWith('/uploads/')) return;
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

	async function handleFileUpload(event) {
		const file = event.target.files[0];
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
				// If we had a temporary file, delete it
				if (mediaUrl && mediaUrl.startsWith('/uploads/') && mediaUrl !== data.question.mediaUrl) {
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

	function getYoutubeId(url) {
		if (!url) return null;
		const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
		const match = url.match(regExp);
		return (match && match[2].length === 11) ? match[2] : null;
	}
</script>

<div class="edit-question-page">
	<header>
		<a href="/quizmaster/quiz/{data.quiz.id}" class="back-link">← Επιστροφή στο Quiz: {data.quiz.name}</a>
		<h1>Επεξεργασία Ερώτησης</h1>
	</header>

	<form method="POST" action="?/updateQuestion" use:enhance={() => {
		loading = true;
		return async ({ update }) => {
			await update();
			loading = false;
		};
	}} class="edit-form">
		<input type="hidden" name="mediaType" value={mediaType} />
		<input type="hidden" name="mediaUrl" value={mediaUrl} />

		<section class="main-card">
			<div class="field">
				<label for="q-text">Κείμενο Ερώτησης</label>
				<textarea id="q-text" name="text" rows="3" value={data.question.text} required></textarea>
			</div>

			<div class="meta-grid">
				<div class="field">
					<label for="q-points">Πόντοι</label>
					<input type="number" id="q-points" name="points" value={data.question.points} min="1" />
				</div>
				<div class="field">
					<label for="q-time">Χρόνος (sec)</label>
					<input type="number" id="q-time" name="timeLimit" value={data.question.timeLimit} min="5" />
				</div>
			</div>
		</section>

		<section class="media-card">
			<h2>Πολυμέσα (Προαιρετικό)</h2>
			<div class="media-selector">
				<button type="button" class:active={mediaType === 'none'} onclick={() => mediaType = 'none'}>Χωρίς</button>
				<button type="button" class:active={mediaType === 'image'} onclick={() => mediaType = 'image'}>Εικόνα</button>
				<button type="button" class:active={mediaType === 'video'} onclick={() => mediaType = 'video'}>Βίντεο (YouTube)</button>
				<button type="button" class:active={mediaType === 'video_file'} onclick={() => mediaType = 'video_file'}>Βίντεο (MP4)</button>
			</div>

			<div class="media-content">
				{#if mediaType === 'image'}
					<div class="upload-zone">
						<input type="file" accept="image/*" onchange={handleFileUpload} disabled={uploading} />
						{#if uploading}<p>Ανέβασμα...</p>{/if}
						{#if mediaUrl && mediaUrl.startsWith('/uploads/') && !mediaUrl.endsWith('.mp4')}
							<div class="preview">
								<img src={mediaUrl} alt="Preview" />
								<button type="button" class="remove-btn" onclick={() => { deleteFile(mediaUrl); mediaUrl = ''; }}>✕</button>
							</div>
						{/if}
					</div>
				{:else if mediaType === 'video'}
					<div class="video-input">
						<label for="v-url">Link από YouTube:</label>
						<input type="text" id="v-url" bind:value={mediaUrl} placeholder="https://www.youtube.com/watch?v=..." />
						{#if getYoutubeId(mediaUrl)}
							<div class="video-preview">
								<iframe 
									width="100%" 
									height="200" 
									src="https://www.youtube.com/embed/{getYoutubeId(mediaUrl)}" 
									title="YouTube video player" 
									frameborder="0" 
									allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
									allowfullscreen
								></iframe>
							</div>
						{/if}
					</div>
				{:else if mediaType === 'video_file'}
					<div class="upload-zone">
						<input type="file" accept="video/mp4" onchange={handleFileUpload} disabled={uploading} />
						{#if uploading}<p>Ανέβασμα...</p>{/if}
						{#if mediaUrl && mediaUrl.startsWith('/uploads/') && mediaUrl.endsWith('.mp4')}
							<div class="preview">
								<video src={mediaUrl} controls muted width="100%"></video>
								<button type="button" class="remove-btn" onclick={() => { deleteFile(mediaUrl); mediaUrl = ''; }}>✕</button>
							</div>
						{/if}
					</div>
				{/if}
			</div>
		</section>

		<section class="options-card">
			<h2>Επιλογές Απάντησης</h2>
			<div class="options-list">
				{#each data.options as opt}
					<div class="option-row" class:is-correct={opt.isCorrect}>
						<div class="radio-wrapper">
							<input type="radio" name="correctOption" value={opt.id} checked={opt.isCorrect} required />
						</div>
						<div class="input-wrapper">
							<input type="hidden" name="optionId" value={opt.id} />
							<input type="text" name="optionText" value={opt.text} required />
						</div>
					</div>
				{/each}
			</div>
		</section>

		<div class="sticky-actions">
			{#if message}
				<span class="status-msg {message.type}">{message.text}</span>
			{/if}
			<button type="submit" class="save-btn" disabled={loading || uploading}>
				{loading ? 'Αποθήκευση...' : 'Αποθήκευση Αλλαγών'}
			</button>
		</div>
	</form>
</div>

<style>
	.edit-question-page {
		max-width: 700px;
		margin: 0 auto;
		padding: 1rem;
	}

	header { margin-bottom: 2rem; }
	.back-link { color: #2563eb; text-decoration: none; font-size: 0.9rem; display: inline-block; margin-bottom: 0.5rem; }
	h1 { margin: 0; font-size: 1.8rem; color: #111827; }

	.edit-form { display: flex; flex-direction: column; gap: 1.5rem; padding-bottom: 6rem; }

	section {
		background: white;
		padding: 1.5rem;
		border-radius: 12px;
		border: 1px solid #e5e7eb;
		box-shadow: 0 1px 3px rgba(0,0,0,0.1);
	}

	.field { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem; }
	.field label { font-weight: 600; font-size: 0.9rem; color: #4b5563; }
	textarea, input[type="text"], input[type="number"] { padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; font-family: inherit; font-size: 1rem; }

	.meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

	h2 { font-size: 1.25rem; margin: 0 0 1rem 0; }

	.media-selector {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
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
		font-size: 0.85rem;
		color: #4b5563;
		transition: all 0.2s;
	}

	.media-selector button.active {
		background: white;
		color: #111827;
		box-shadow: 0 1px 2px rgba(0,0,0,0.1);
	}

	.upload-zone .preview {
		position: relative;
		margin-top: 1rem;
		max-width: 100%;
	}

	.upload-zone img, .upload-zone video {
		width: 100%;
		border-radius: 8px;
	}

	.remove-btn {
		position: absolute;
		top: -10px;
		right: -10px;
		background: #ef4444;
		color: white;
		border: none;
		border-radius: 50%;
		width: 24px;
		height: 24px;
		cursor: pointer;
		z-index: 10;
	}

	.video-input {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.video-preview {
		margin-top: 1rem;
		border-radius: 8px;
		overflow: hidden;
		border: 1px solid #e5e7eb;
	}

	.options-list { display: flex; flex-direction: column; gap: 0.75rem; }
	.option-row { display: flex; gap: 1rem; align-items: center; padding: 0.75rem; border: 1px solid #e5e7eb; border-radius: 8px; }
	.option-row.is-correct { border-color: #10b981; background: #f0fdf4; }
	.input-wrapper { flex: 1; }
	.input-wrapper input { width: 100%; border: 1px solid #d1d5db; padding: 0.5rem; border-radius: 4px; }

	.sticky-actions {
		position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%);
		background: white; padding: 1rem 2rem; border-radius: 9999px;
		box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
		display: flex; align-items: center; gap: 1.5rem; border: 1px solid #e5e7eb; z-index: 100;
	}

	.save-btn { background: #2563eb; color: white; border: none; padding: 0.75rem 2rem; border-radius: 9999px; font-weight: 600; cursor: pointer; }
	.save-btn:disabled { background: #9ca3af; cursor: not-allowed; }
	.status-msg.success { color: #059669; }
</style>
