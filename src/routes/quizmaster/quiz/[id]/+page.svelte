<script>
	import { enhance } from '$app/forms';
	let { data, form } = $props();

	let loading = $state(false);
	let editingQuestionId = $state(null);

	function toggleEdit(id) {
		if (editingQuestionId === id) {
			editingQuestionId = null;
		} else {
			editingQuestionId = id;
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
						<input type="text" id="quiz-name" name="name" value={data.quiz.name} required />
					</div>

					<div class="field">
						<label for="quiz-image">URL Χαρακτηριστικής Εικόνας</label>
						<input type="text" id="quiz-image" name="featuredImage" value={data.quiz.featuredImage || ''} placeholder="https://..." />
						{#if data.quiz.featuredImage}
							<div class="image-preview">
								<img src={data.quiz.featuredImage} alt="Preview" />
							</div>
						{/if}
					</div>

					<div class="field">
						<label for="quiz-intro">Εισαγωγικό Κείμενο</label>
						<textarea id="quiz-intro" name="introText" rows="5" value={data.quiz.introText || ''}></textarea>
					</div>

					<button type="submit" class="save-info-btn">Αποθήκευση Πληροφοριών</button>
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
					{#each data.questions as q (q.id)}
						<div class="question-card" class:editing={editingQuestionId === q.id}>
							{#if editingQuestionId === q.id}
								<form method="POST" action="?/updateQuestion" use:enhance={() => {
									loading = true;
									return async ({ update }) => {
										await update();
										loading = false;
										editingQuestionId = null;
									};
								}} class="edit-question-form">
									<input type="hidden" name="questionId" value={q.id} />
									
									<div class="field">
										<label>Ερώτηση:</label>
										<input type="text" name="text" value={q.text} required />
									</div>

									<div class="meta-fields">
										<div class="field">
											<label>Πόντοι:</label>
											<input type="number" name="points" value={q.points} min="1" />
										</div>
										<div class="field">
											<label>Χρόνος (sec):</label>
											<input type="number" name="timeLimit" value={q.timeLimit} min="5" />
										</div>
									</div>

									<div class="options-grid">
										<label class="options-label">Επιλογές (επιλέξτε τη σωστή):</label>
										{#each q.options as opt}
											<div class="option-row">
												<input type="radio" name="correctOption" value={opt.id} checked={opt.isCorrect} required />
												<input type="hidden" name="optionId" value={opt.id} />
												<input type="text" name="optionText" value={opt.text} required />
											</div>
										{/each}
									</div>

									<div class="form-actions">
										<button type="button" class="cancel-btn" onclick={() => toggleEdit(null)}>Ακύρωση</button>
										<button type="submit" class="save-btn" disabled={loading}>Αποθήκευση</button>
									</div>
								</form>
							{:else}
								<div class="question-view">
									<div class="q-header">
										<span class="q-text">{q.text}</span>
										<div class="q-meta">
											<span class="badge">{q.points} pts</span>
											<span class="badge">{q.timeLimit}s</span>
										</div>
									</div>
									<div class="q-options">
										{#each q.options as opt}
											<div class="opt" class:correct={opt.isCorrect}>
												{opt.text} {opt.isCorrect ? '✓' : ''}
											</div>
										{/each}
									</div>
									<div class="q-actions">
										<button class="edit-btn" onclick={() => toggleEdit(q.id)}>Επεξεργασία</button>
										<form method="POST" action="?/deleteQuestion" use:enhance>
											<input type="hidden" name="questionId" value={q.id} />
											<button type="submit" class="delete-btn" onclick={(e) => { if(!confirm('Διαγραφή ερώτησης;')) e.preventDefault(); }}>Διαγραφή</button>
										</form>
									</div>
								</div>
							{/if}
						</div>
					{/each}
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

	.image-preview {
		margin-top: 0.5rem;
		border-radius: 4px;
		overflow: hidden;
		border: 1px solid #e5e7eb;
	}

	.image-preview img {
		width: 100%;
		display: block;
		max-height: 150px;
		object-fit: cover;
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

	.question-card {
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 12px;
		padding: 1.5rem;
		margin-bottom: 1rem;
		box-shadow: 0 1px 3px rgba(0,0,0,0.1);
	}

	.question-card.editing {
		border-color: #2563eb;
		box-shadow: 0 0 0 2px #bfdbfe;
	}

	.q-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 1rem;
	}

	.q-text {
		font-size: 1.1rem;
		font-weight: 600;
		color: #111827;
	}

	.badge {
		background: #f3f4f6;
		padding: 0.2rem 0.6rem;
		border-radius: 4px;
		font-size: 0.75rem;
		color: #4b5563;
		margin-left: 0.5rem;
	}

	.q-options {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.opt {
		padding: 0.5rem;
		background: #f9fafb;
		border-radius: 4px;
		font-size: 0.9rem;
	}

	.opt.correct {
		background: #d1fae5;
		color: #065f46;
		font-weight: 600;
	}

	.q-actions {
		display: flex;
		gap: 0.5rem;
		justify-content: flex-end;
		border-top: 1px solid #f3f4f6;
		padding-top: 1rem;
	}

	.edit-btn {
		background: #f3f4f6;
		border: none;
		padding: 0.4rem 1rem;
		border-radius: 4px;
		cursor: pointer;
	}

	.delete-btn {
		background: #fee2e2;
		color: #dc2626;
		border: none;
		padding: 0.4rem 1rem;
		border-radius: 4px;
		cursor: pointer;
	}

	/* Edit Form Styles (Internal) */
	.edit-question-form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.meta-fields {
		display: flex;
		gap: 1rem;
	}

	.meta-fields .field {
		flex: 1;
	}

	.options-grid {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.options-label {
		font-size: 0.85rem;
		font-weight: 600;
		color: #4b5563;
		margin-bottom: 0.5rem;
	}

	.option-row {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.option-row input[type="text"] {
		flex: 1;
		padding: 0.5rem;
		border: 1px solid #d1d5db;
		border-radius: 4px;
	}

	.form-actions {
		display: flex;
		justify-content: flex-end;
		gap: 1rem;
		margin-top: 1rem;
	}

	.save-btn {
		background: #2563eb;
		color: white;
		border: none;
		padding: 0.6rem 1.5rem;
		border-radius: 6px;
		font-weight: 600;
		cursor: pointer;
	}

	.cancel-btn {
		background: white;
		border: 1px solid #d1d5db;
		padding: 0.6rem 1.5rem;
		border-radius: 6px;
		cursor: pointer;
	}
</style>
