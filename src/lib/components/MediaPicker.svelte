<script>
	import { onMount } from 'svelte';
	import Button from './Button.svelte';

	let { 
		type = 'image', // 'image' or 'video'
		context = '',   // e.g., 'profile'
		onSelect, 
		onClose 
	} = $props();

	let items = $state([]);
	let loading = $state(true);
	let error = $state(null);
	let uploading = $state(false);
	let isDragging = $state(false);

	async function fetchMedia() {
		loading = true;
		try {
			const res = await fetch(`/api/upload?type=${type}`);
			if (res.ok) {
				items = await res.json();
			} else {
				error = 'Αποτυχία φόρτωσης βιβλιοθήκης';
			}
		} catch (e) {
			error = 'Σφάλμα σύνδεσης';
		} finally {
			loading = false;
		}
	}

	async function handleUpload(file) {
		if (!file) return;
		
		// Validate type
		if (type === 'image' && !file.type.startsWith('image/')) {
			alert('Παρακαλώ επιλέξτε μια εικόνα.');
			return;
		}
		if (type === 'video' && !file.type.startsWith('video/')) {
			alert('Παρακαλώ επιλέξτε ένα video (MP4).');
			return;
		}

		uploading = true;
		const formData = new FormData();
		formData.append('file', file);

		try {
			const response = await fetch(`/api/upload?context=${context}`, {
				method: 'POST',
				body: formData
			});
			const result = await response.json();
			if (result.success) {
				// Refresh list and select the new item
				await fetchMedia();
				const newItem = items.find(i => i.url === result.url);
				if (newItem) onSelect(newItem);
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

	function onFileSelect(e) {
		handleUpload(e.target.files[0]);
	}

	function onDrop(e) {
		e.preventDefault();
		isDragging = false;
		handleUpload(e.dataTransfer.files[0]);
	}

	async function deleteItem(item, e) {
		e.stopPropagation();
		if (!confirm('Διαγραφή αυτού του αρχείου από τη βιβλιοθήκη;')) return;
		
		try {
			const res = await fetch('/api/upload', {
				method: 'DELETE',
				body: JSON.stringify({ id: item.id, url: item.url })
			});
			if (res.ok) {
				items = items.filter(i => i.id !== item.id);
			}
		} catch (e) {
			alert('Αποτυχία διαγραφής');
		}
	}

	onMount(fetchMedia);
</script>

<div class="media-picker-overlay" ondragover={(e) => e.preventDefault()}>
	<div class="media-picker-content">
		<header>
			<h2>Βιβλιοθήκη Πολυμέσων ({type === 'image' ? 'Εικόνες' : 'Video'})</h2>
			<button class="close-btn" onclick={onClose}>✕</button>
		</header>

		<div 
			class="upload-dropzone" 
			class:dragging={isDragging}
			onclick={() => document.getElementById('file-upload').click()}
			onkeydown={(e) => e.key === 'Enter' && document.getElementById('file-upload').click()}
			ondragover={(e) => { e.preventDefault(); isDragging = true; }}
			ondragleave={() => isDragging = false}
			ondrop={onDrop}
			role="button"
			tabindex="0"
		>
			<input 
				type="file" 
				id="file-upload" 
				hidden 
				accept={type === 'image' ? 'image/*' : 'video/mp4'} 
				onchange={onFileSelect} 
			/>
			
			{#if uploading}
				<div class="uploading-state">
					<span class="spinner"></span>
					<p>Ανέβασμα αρχείου...</p>
				</div>
			{:else}
				<div class="prompt">
					<span class="icon">📤</span>
					<p><strong>Σύρετε εδώ</strong> ή <strong>κάντε κλικ</strong> για να ανεβάσετε νέο αρχείο</p>
				</div>
			{/if}
		</div>

		<div class="media-grid-container">
			{#if loading}
				<div class="loader">Φόρτωση βιβλιοθήκης...</div>
			{:else if error}
				<div class="error-msg">{error}</div>
			{:else if items.length === 0}
				<div class="empty-state">Δεν βρέθηκαν αρχεία στη βιβλιοθήκη.</div>
			{:else}
				<div class="grid">
					{#each items as item}
						<div class="media-item">
							<button class="select-btn" onclick={() => onSelect(item)} aria-label="Επιλογή {item.name}">
								{#if item.type === 'image'}
									<img src={item.url} alt={item.name} />
								{:else}
									<div class="video-placeholder">
										<span class="icon">🎬</span>
										<span class="name">{item.name}</span>
									</div>
								{/if}
							</button>
							<button class="delete-item-btn" onclick={(e) => deleteItem(item, e)} title="Διαγραφή">✕</button>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.media-picker-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background: rgba(0, 0, 0, 0.7);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 2000;
		padding: 1rem;
	}

	.media-picker-content {
		background: white;
		width: 100%;
		max-width: 900px;
		max-height: 90vh;
		border-radius: 16px;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
	}

	header {
		padding: 1.25rem 1.5rem;
		border-bottom: 1px solid #e5e7eb;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	header h2 { margin: 0; font-size: 1.25rem; color: #111827; }

	.close-btn {
		background: #f3f4f6;
		border: none;
		font-size: 1.25rem;
		cursor: pointer;
		color: #6b7280;
		width: 32px;
		height: 32px;
		border-radius: 50%;
		display: flex;
		justify-content: center;
		align-items: center;
		transition: all 0.2s;
	}

	.close-btn:hover { background: #e5e7eb; color: #111827; }

	.upload-dropzone {
		margin: 1.5rem;
		padding: 2rem;
		border: 2px dashed #d1d5db;
		border-radius: 12px;
		text-align: center;
		cursor: pointer;
		transition: all 0.2s;
		background: #f9fafb;
	}

	.upload-dropzone:hover, .upload-dropzone.dragging {
		border-color: #2563eb;
		background: #eff6ff;
	}

	.prompt .icon { font-size: 2.5rem; display: block; margin-bottom: 0.5rem; }
	.prompt p { margin: 0; color: #4b5563; }
	.prompt strong { color: #2563eb; }

	.uploading-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
	}

	.media-grid-container {
		padding: 0 1.5rem 1.5rem;
		overflow-y: auto;
		flex: 1;
		min-height: 200px;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
		gap: 1rem;
	}

	.media-item {
		aspect-ratio: 1;
		border: 2px solid #f3f4f6;
		border-radius: 8px;
		overflow: hidden;
		position: relative;
		background: #f9fafb;
		transition: all 0.2s;
	}

	.select-btn {
		width: 100%;
		height: 100%;
		padding: 0;
		border: none;
		background: transparent;
		cursor: pointer;
		display: block;
	}

	.media-item:hover {
		border-color: #2563eb;
		transform: translateY(-2px);
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
	}

	.media-item img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.video-placeholder {
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 0.5rem;
		text-align: center;
	}

	.delete-item-btn {
		position: absolute;
		top: 0.25rem;
		right: 0.25rem;
		background: rgba(239, 68, 68, 0.9);
		color: white;
		border: none;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 0.8rem;
		cursor: pointer;
		opacity: 0;
		transition: opacity 0.2s;
	}

	.media-item:hover .delete-item-btn { opacity: 1; }

	.spinner {
		width: 30px;
		height: 30px;
		border: 3px solid #2563eb;
		border-bottom-color: transparent;
		border-radius: 50%;
		display: inline-block;
		animation: rotation 1s linear infinite;
	}

	@keyframes rotation {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	.loader, .error-msg, .empty-state {
		text-align: center;
		padding: 2rem;
		color: #6b7280;
	}
</style>
