<script>
	import { enhance } from '$app/forms';
	import Button from '$lib/components/Button.svelte';
	import Badge from '$lib/components/Badge.svelte';
	import Card from '$lib/components/Card.svelte';
	
	let { data } = $props();

	let loading = $state(false);
	let quizName = $state("");

	$effect(() => {
		quizName = data.quiz.name;
	});
</script>

<div class="edit-quiz-container">
	<header class="main-header">
		<div class="header-top">
			<a href="/quizmaster" class="back-link">← Dashboard</a>
			<form method="POST" action="?/deleteQuiz" use:enhance={( { cancel } ) => {
				if(!confirm('Διαγραφή ολόκληρου του Quiz; Αυτή η ενέργεια δεν αναιρείται.')) return cancel();
				return async ({ update }) => { await update(); };
			}}>
				<Button type="submit" variant="danger" size="small" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;">Διαγραφή Quiz</Button>
			</form>
		</div>
		
		<div class="header-main">
			<h1>Επεξεργασία</h1>
			<form method="POST" action="?/updateQuizInfo" use:enhance={() => {
				loading = true;
				return async ({ update }) => {
					await update();
					loading = false;
				};
			}} class="quiz-name-form">
				<input type="text" name="name" bind:value={quizName} required placeholder="Όνομα Quiz" />
				<Button type="submit" {loading} variant="primary" style="padding: 0.5rem 1rem;">Αποθήκευση</Button>
			</form>
		</div>
	</header>

	<div class="editor-layout">
		<!-- Left Side: Controls -->
		<aside class="side-panel">
			<Card class="control-card">
				<section class="add-section">
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
						<div class="field">
							<input type="text" name="text" placeholder="Κείμενο ερώτησης..." required />
						</div>
						<Button type="submit" {loading} variant="primary" class="btn-full" style="background: #059669;">
							+ Ερώτηση
						</Button>
					</form>
				</section>

				<hr class="separator" />

				<section class="add-section">
					<h3>Προσθήκη Κάρτας</h3>
					<p class="help-text">Πληροφοριακή κάρτα με τίτλο, κείμενο και media.</p>
					<form 
						method="POST" 
						action="?/addCard" 
						use:enhance={() => {
							loading = true;
							return async ({ update }) => {
								await update();
								loading = false;
							};
						}}
						class="add-form"
					>
						<div class="field">
							<input type="text" name="text" placeholder="Τίτλος κάρτας..." required />
						</div>
						<Button type="submit" {loading} variant="primary" class="btn-full" style="background: #2563eb;">
							+ Κάρτα
						</Button>
					</form>
				</section>
			</Card>
		</aside>

		<!-- Right Side: Content List -->
		<main class="questions-main">
			<section class="questions-list">
				<div class="list-header">
					<h2>Περιεχόμενο Quiz ({data.questions.length})</h2>
				</div>

				{#if data.questions.length === 0}
					<p class="empty">Δεν υπάρχει ακόμα περιεχόμενο. Ξεκινήστε από τα αριστερά!</p>
				{:else}
					<div class="questions-grid">
						{#each data.questions as q, i (q.id)}
							<Card class="question-row-card {q.type === 'card' ? 'is-card' : ''}">
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
									<div class="type-badge-row">
										{#if q.type === 'card'}
											<Badge variant="default" style="background: #dbeafe; color: #1e40af; border: none;">ΚΑΡΤΑ</Badge>
										{:else}
											<Badge variant="default" style="background: #d1fae5; color: #065f46; border: none;">ΕΡΩΤΗΣΗ</Badge>
										{/if}
									</div>
									<span class="q-text">{q.text}</span>
									{#if q.type === 'question'}
										<div class="q-meta">
											<Badge variant="primary">{q.points} pts</Badge>
											<Badge variant="default">{q.timeLimit}s</Badge>
											<Badge variant="default">{q.options.length} επιλογές</Badge>
										</div>
									{/if}
								</div>
								<div class="q-actions">
									<a href="/quizmaster/quiz/{data.quiz.id}/question/{q.id}" class="edit-link-btn">Επεξεργασία</a>
									<form method="POST" action="?/deleteQuestion" use:enhance>
										<input type="hidden" name="questionId" value={q.id} />
										<button type="submit" class="delete-icon-btn" onclick={(e) => { if(!confirm('Διαγραφή;')) e.preventDefault(); }} title="Διαγραφή">
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
		padding-bottom: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.header-top {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.header-main {
		display: flex;
		align-items: center;
		gap: 1.5rem;
		flex-wrap: wrap;
	}

	.header-main h1 {
		margin: 0;
		font-size: 1.8rem;
		color: #111827;
		white-space: nowrap;
	}

	.quiz-name-form {
		display: flex;
		gap: 0.75rem;
		flex: 1;
		min-width: 300px;
	}

	.quiz-name-form input {
		flex: 1;
		padding: 0.6rem 1rem;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 1.1rem;
		font-weight: 600;
	}

	.back-link {
		color: #2563eb;
		text-decoration: none;
		font-size: 0.9rem;
		font-weight: 500;
	}

	.editor-layout {
		display: grid;
		grid-template-columns: 320px 1fr;
		gap: 2.5rem;
		align-items: start;
	}

	.side-panel {
		position: sticky;
		top: 5rem;
	}

	:global(.control-card) {
		padding: 0 !important;
	}

	.add-section {
		padding: 1.5rem;
	}

	.add-section h3 {
		margin-top: 0;
		margin-bottom: 0.5rem;
		font-size: 1.1rem;
		color: #111827;
	}

	.help-text {
		font-size: 0.8rem;
		color: #6b7280;
		margin-bottom: 1rem;
		line-height: 1.3;
	}

	.separator {
		border: 0;
		border-top: 1px solid #f3f4f6;
		margin: 0;
	}

	.add-form {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.add-form .field input {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		box-sizing: border-box;
	}

	.list-header {
		margin-bottom: 1.5rem;
	}

	.list-header h2 {
		margin: 0;
		font-size: 1.25rem;
		color: #111827;
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

	:global(.question-row-card.is-card) {
		border-left: 4px solid #2563eb !important;
	}

	.type-badge-row {
		margin-bottom: 0.4rem;
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

	@media (max-width: 900px) {
		.editor-layout {
			grid-template-columns: 1fr;
		}
		.side-panel {
			position: static;
		}
	}

	@media (max-width: 600px) {
		.header-main {
			flex-direction: column;
			align-items: flex-start;
			gap: 1rem;
		}
		.quiz-name-form {
			width: 100%;
		}
	}
</style>
