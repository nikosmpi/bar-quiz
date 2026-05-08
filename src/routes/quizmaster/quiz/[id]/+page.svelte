<script>
	import { enhance } from '$app/forms';
	import Button from '$lib/components/Button.svelte';
	import Badge from '$lib/components/Badge.svelte';
	import Card from '$lib/components/Card.svelte';
	import MediaField from '$lib/components/MediaField.svelte';
	
	let { data, form } = $props();

	let loading = $state(false);
	
	let quizName = $state("");
	let quizIntro = $state("");
	let quizMediaType = $state("image");
	let featuredImageUrl = $state("");

	$effect(() => {
		quizName = data.quiz.name;
		quizIntro = data.quiz.introText || '';
		quizMediaType = data.quiz.mediaType || 'image';
		featuredImageUrl = data.quiz.featuredImage || '';
	});
</script>

<div class="edit-quiz-container">
	<header class="main-header">
		<a href="/quizmaster" class="back-link">← Επιστροφή στο Dashboard</a>
		<h1>Επεξεργασία Quiz</h1>
	</header>

	<div class="editor-layout">
		<!-- Left Side: Quiz Settings -->
		<aside class="settings-sidebar">
			<Card title="Πληροφορίες Quiz" class="settings-card">
				<form method="POST" action="?/updateQuizInfo" use:enhance class="quiz-info-form">
					<div class="field">
						<label for="quiz-name">Όνομα Quiz</label>
						<input type="text" id="quiz-name" name="name" bind:value={quizName} required />
					</div>

					<div class="field">
						<label for="quiz-media">Πολυμέσα (Προαιρετικό)</label>
						<MediaField 
							bind:mediaType={quizMediaType} 
							bind:mediaUrl={featuredImageUrl} 
							originalUrl={data.quiz.featuredImage}
							allowYouTube={true}
							allowVideoFile={true}
						/>
						<input type="hidden" name="mediaType" value={quizMediaType} />
						<input type="hidden" name="featuredImage" value={featuredImageUrl} />
					</div>

					<div class="field">
						<label for="quiz-intro">Εισαγωγικό Κείμενο</label>
						<textarea id="quiz-intro" name="introText" rows="5" bind:value={quizIntro}></textarea>
					</div>

					<Button type="submit" loading={loading} class="btn-full">
						Αποθήκευση Πληροφοριών
					</Button>
				</form>
				
				<hr class="separator" />
				
				<div class="danger-zone">
					<h3>Επικίνδυνη Ζώνη</h3>
					<form method="POST" action="?/deleteQuiz" use:enhance={( { cancel } ) => {
						if(!confirm('Είστε σίγουροι ότι θέλετε να διαγράψετε ολόκληρο το Quiz; Αυτή η ενέργεια δεν αναιρείται.')) return cancel();
						return async ({ update }) => { await update(); };
					}}>
						<Button type="submit" variant="danger" class="btn-full">Διαγραφή Quiz</Button>
					</form>
				</div>
			</Card>
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
					<Button type="submit" {loading} variant="primary" style="background: #059669;">Προσθήκη</Button>
				</form>
			</section>

			<section class="questions-list">
				<h2>Ερωτήσεις ({data.questions.length})</h2>
				{#if data.questions.length === 0}
					<p class="empty">Δεν υπάρχουν ακόμα ερωτήσεις.</p>
				{:else}
					<div class="questions-grid">
						{#each data.questions as q, i (q.id)}
							<Card class="question-row-card">
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
										<Badge variant="primary">{q.points} pts</Badge>
										<Badge variant="default">{q.timeLimit}s</Badge>
										<Badge variant="default">{q.options.length} επιλογές</Badge>
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
							</Card>
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

	.settings-sidebar {
		position: sticky;
		top: 5rem;
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

	.questions-grid {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	:global(.question-row-card .card-body) {
		padding: 1rem 1.5rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
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
