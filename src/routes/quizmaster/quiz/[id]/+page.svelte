<script>
	import { enhance } from '$app/forms';
	let { data, form } = $props();

	let loading = $state(false);
	let uploading = $state(false);
	
	// Local state for form fields to prevent resets on re-renders
	let quizName = $state("");
	let quizIntro = $state("");
	let featuredImageUrl = $state("");

	// Keep local state in sync with server data when it updates (e.g. after save)
	$effect(() => {
		quizName = data.quiz.name;
		quizIntro = data.quiz.introText || '';
		featuredImageUrl = data.quiz.featuredImage || '';
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

	async function handleImageUpload(event) {
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
				// If we had a temporary image (different from saved one), delete it
				if (featuredImageUrl && featuredImageUrl !== data.quiz.featuredImage) {
					await deleteFile(featuredImageUrl);
				}
				featuredImageUrl = result.url;
			} else {
				alert(result.error || 'Σφάλμα στο ανέβασμα');
			}
		} catch (error) {
			console.error(error);
			alert('Αποτυχία ανεβάσματος εικόνας');
		} finally {
			uploading = false;
		}
	}

	async function removeImage() {
		if (featuredImageUrl) {
			// If it's a temporary upload, delete it from server immediately
			if (featuredImageUrl !== data.quiz.featuredImage) {
				await deleteFile(featuredImageUrl);
			}
			featuredImageUrl = '';
		}
	}
</script>

<div class="edit-quiz-container">
	<header class="main-header">
		<a href="/quizmaster" class="back-link">← Επιστροφή στο Dashboard</a>
		<h1>Επεξεργασία Quiz</h1>
	</header>

	<div class="editor-layout">
		<!-- Left Side: Quiz Settings -->
		<aside class="settings-sidebar">
			<section class="settings-card">
				<h2>Πληροφορίες Quiz</h2>
				<form method="POST" action="?/updateQuizInfo" use:enhance class="quiz-info-form">
					<div class="field">
						<label for="quiz-name">Όνομα Quiz</label>
						<input type="text" id="quiz-name" name="name" bind:value={quizName} required />
					</div>

					<div class="field">
						<label for="quiz-image-file">Χαρακτηριστική Εικόνα</label>
						<input type="file" id="quiz-image-file" accept="image/*" onchange={handleImageUpload} disabled={uploading} />
						<input type="hidden" name="featuredImage" value={featuredImageUrl} />
						
						{#if uploading}
							<p class="upload-status">Ανέβασμα και μετατροπή...</p>
						{/if}

						{#if featuredImageUrl}
							<div class="image-preview">
								<img src={featuredImageUrl} alt="Preview" />
								<button type="button" class="remove-img" onclick={removeImage}>Αφαίρεση</button>
							</div>
						{/if}
					</div>

					<div class="field">
						<label for="quiz-intro">Εισαγωγικό Κείμενο</label>
						<textarea id="quiz-intro" name="introText" rows="5" bind:value={quizIntro}></textarea>
					</div>

					<button type="submit" class="save-info-btn" disabled={uploading}>
						{loading ? 'Αποθήκευση...' : 'Αποθήκευση Πληροφοριών'}
					</button>
				</form>
				
				<hr class="separator" />
				
				<div class="danger-zone">
					<h3>Επικίνδυνη Ζώνη</h3>
					<form method="POST" action="?/deleteQuiz" use:enhance={( { cancel } ) => {
						if(!confirm('Είστε σίγουροι ότι θέλετε να διαγράψετε ολόκληρο το Quiz; Αυτή η ενέργεια δεν αναιρείται.')) return cancel();
						return async ({ update }) => { await update(); };
					}}>
						<button type="submit" class="delete-quiz-btn">Διαγραφή Quiz</button>
					</form>
				</div>
			</section>
		</aside>

		<!-- Right Side: Questions Management -->
		<main class="questions-main">
			<section class="add-question-section">
				<h3>Προσθήκη Ερώτησης</h3>
				<form 
					method="POST" 
					action="?/addQuestion" 
					use:enhance={() => {
						loading = true;
						return async ({ update }) => {
							await update();
							loading = false;
						};
					}}
					class="add-form"
				>
					<input type="text" name="text" placeholder="Γράψτε την ερώτηση εδώ..." required />
					<button type="submit" disabled={loading}>Προσθήκη</button>
				</form>
			</section>

			<section class="questions-list">
				<h2>Ερωτήσεις ({data.questions.length})</h2>
				{#if data.questions.length === 0}
					<p class="empty">Δεν υπάρχουν ακόμα ερωτήσεις.</p>
				{:else}
					<div class="questions-grid">
						{#each data.questions as q, i (q.id)}
							<div class="question-row-card">
								<div class="reorder-actions">
									<form method="POST" action="?/reorderQuestion" use:enhance>
										<input type="hidden" name="questionId" value={q.id} />
										<input type="hidden" name="direction" value="up" />
										<button type="submit" class="order-btn" disabled={i === 0} title="Μετακίνηση πάνω">▲</button>
									</form>
									<form method="POST" action="?/reorderQuestion" use:enhance>
										<input type="hidden" name="questionId" value={q.id} />
										<input type="hidden" name="direction" value="down" />
										<button type="submit" class="order-btn" disabled={i === data.questions.length - 1} title="Μετακίνηση κάτω">▼</button>
									</form>
								</div>
								<div class="q-info">
									<span class="q-text">{q.text}</span>
									<div class="q-meta">
										<span class="badge">{q.points} pts</span>
										<span class="badge">{q.timeLimit}s</span>
										<span class="badge">{q.options.length} επιλογές</span>
									</div>
								</div>
								<div class="q-actions">
									<a href="/quizmaster/quiz/{data.quiz.id}/question/{q.id}" class="edit-link-btn">Επεξεργασία</a>
									<form method="POST" action="?/deleteQuestion" use:enhance>
										<input type="hidden" name="questionId" value={q.id} />
										<button type="submit" class="delete-icon-btn" onclick={(e) => { if(!confirm('Διαγραφή ερώτησης;')) e.preventDefault(); }} title="Διαγραφή">
											✕
										</button>
									</form>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</section>
		</main>
	</div>
</div>

<style>
	.edit-quiz-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 1rem;
	}

	.main-header {
		margin-bottom: 2rem;
		border-bottom: 1px solid #e5e7eb;
		padding-bottom: 1rem;
	}

	.main-header h1 {
		margin: 0.5rem 0 0;
		font-size: 1.8rem;
		color: #111827;
	}

	.back-link {
		color: #2563eb;
		text-decoration: none;
		font-size: 0.9rem;
	}

	.editor-layout {
		display: grid;
		grid-template-columns: 350px 1fr;
		gap: 2rem;
		align-items: start;
	}

	@media (max-width: 900px) {
		.editor-layout {
			grid-template-columns: 1fr;
		}
	}

	.settings-card {
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 12px;
		padding: 1.5rem;
		box-shadow: 0 1px 3px rgba(0,0,0,0.1);
		position: sticky;
		top: 5rem;
	}

	.settings-card h2 {
		margin: 0 0 1.5rem 0;
		font-size: 1.2rem;
		color: #111827;
	}

	.quiz-info-form {
		display: flex;
		flex-direction: column;
		gap: 1.2rem;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.field label {
		font-size: 0.85rem;
		font-weight: 600;
		color: #4b5563;
	}

	.field input, .field textarea {
		padding: 0.6rem;
		border: 1px solid #d1d5db;
		border-radius: 4px;
		font-family: inherit;
	}

	.upload-status {
		font-size: 0.8rem;
		color: #2563eb;
		margin: 0;
	}

	.image-preview {
		margin-top: 0.5rem;
		border-radius: 4px;
		overflow: hidden;
		border: 1px solid #e5e7eb;
		position: relative;
	}

	.image-preview img {
		width: 100%;
		display: block;
		max-height: 150px;
		object-fit: cover;
	}

	.remove-img {
		position: absolute;
		top: 5px;
		right: 5px;
		background: rgba(239, 68, 68, 0.9);
		color: white;
		border: none;
		padding: 2px 8px;
		border-radius: 4px;
		font-size: 0.7rem;
		cursor: pointer;
	}

	.save-info-btn {
		background: #2563eb;
		color: white;
		border: none;
		padding: 0.75rem;
		border-radius: 6px;
		font-weight: 600;
		cursor: pointer;
		margin-top: 0.5rem;
	}

	.save-info-btn:disabled {
		background: #9ca3af;
		cursor: not-allowed;
	}

	.separator {
		border: 0;
		border-top: 1px solid #f3f4f6;
		margin: 1.5rem 0;
	}

	.danger-zone h3 {
		color: #991b1b;
		font-size: 0.9rem;
		margin: 0 0 0.75rem 0;
	}

	.delete-quiz-btn {
		width: 100%;
		background: #fee2e2;
		color: #dc2626;
		border: 1px solid #fecaca;
		padding: 0.6rem;
		border-radius: 6px;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.2s;
	}

	.delete-quiz-btn:hover {
		background: #fecaca;
	}

	/* Questions Section Styles */
	.add-question-section {
		background: #f9fafb;
		padding: 1.5rem;
		border-radius: 12px;
		margin-bottom: 2rem;
		border: 1px dashed #d1d5db;
	}

	.add-form {
		display: flex;
		gap: 1rem;
	}

	.add-form input {
		flex: 1;
		padding: 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 6px;
	}

	.add-form button {
		background: #059669;
		color: white;
		border: none;
		padding: 0 1.5rem;
		border-radius: 6px;
		font-weight: 600;
		cursor: pointer;
	}

	.questions-grid {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.question-row-card {
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 10px;
		padding: 1rem 1.5rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		transition: box-shadow 0.2s;
		gap: 1rem;
	}

	.question-row-card:hover {
		box-shadow: 0 2px 4px rgba(0,0,0,0.05);
	}

	.reorder-actions {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.order-btn {
		background: #f3f4f6;
		border: 1px solid #e5e7eb;
		border-radius: 4px;
		padding: 2px 8px;
		font-size: 0.7rem;
		cursor: pointer;
		color: #4b5563;
		transition: all 0.2s;
	}

	.order-btn:hover:not(:disabled) {
		background: #e5e7eb;
		color: #111827;
	}

	.order-btn:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.q-info {
		flex: 1;
	}

	.q-text {
		font-weight: 600;
		color: #111827;
		display: block;
		margin-bottom: 0.25rem;
	}

	.badge {
		background: #f3f4f6;
		padding: 0.2rem 0.6rem;
		border-radius: 4px;
		font-size: 0.75rem;
		color: #4b5563;
		margin-right: 0.5rem;
	}

	.q-actions {
		display: flex;
		gap: 1rem;
		align-items: center;
	}

	.edit-link-btn {
		color: #2563eb;
		text-decoration: none;
		font-weight: 600;
		font-size: 0.9rem;
	}

	.edit-link-btn:hover {
		text-decoration: underline;
	}

	.delete-icon-btn {
		background: none;
		border: none;
		color: #9ca3af;
		cursor: pointer;
		font-size: 1.2rem;
		padding: 0.2rem;
		transition: color 0.2s;
	}

	.delete-icon-btn:hover {
		color: #ef4444;
	}
</style>
