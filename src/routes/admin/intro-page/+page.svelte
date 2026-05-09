<script>
	import { enhance } from '$app/forms';
	import Card from '$lib/components/Card.svelte';
	import Button from '$lib/components/Button.svelte';

	let { data } = $props();
	let activeQuizLoading = $state(false);
</script>

<div class="intro-admin-container">
	<header>
		<a href="/admin" class="back-link">← Επιστροφή στο Dashboard</a>
		<h1>Διαχείριση Εισαγωγικής Σελίδας</h1>
	</header>
	
	<section class="active-quiz-section">
		<Card title="Ενεργό Quiz για Παίκτες">
			<form 
				method="POST" 
				action="?/setActiveQuiz" 
				use:enhance={() => {
					activeQuizLoading = true;
					return async ({ update }) => {
						await update();
						activeQuizLoading = false;
					};
				}}
				class="active-quiz-form"
			>
				<div class="input-group">
					<label for="active-quiz">Επιλέξτε το Quiz που είναι "στον αέρα":</label>
					<select name="quizId" id="active-quiz" value={data.activeQuizId || ""} disabled={activeQuizLoading}>
						<option value="">-- Κανένα (Απενεργοποίηση) --</option>
						{#each data.quizzes as q}
							<option value={q.id}>{q.name}</option>
						{/each}
					</select>
				</div>
				<Button type="submit" loading={activeQuizLoading} variant="primary">
					Ενημέρωση Ενεργού Quiz
				</Button>
			</form>
		</Card>
	</section>

	<section class="quiz-list-section">
		<h2>Όλα τα Quiz ({data.quizzes.length})</h2>
		{#if data.quizzes.length === 0}
			<p class="empty-state">Δεν υπάρχουν δημιουργημένα quiz.</p>
		{:else}
			<div class="quiz-grid">
				{#each data.quizzes as q}
					<div class="quiz-item">
						<Card class="quiz-card {data.activeQuizId === q.id ? 'is-active' : ''}">
							<div class="quiz-info">
								<div class="title-row">
									<h3>{q.name}</h3>
									{#if data.activeQuizId === q.id}
										<span class="active-badge">ΕΝΕΡΓΟ</span>
									{/if}
								</div>
								<span class="date">Δημιουργήθηκε: {new Date(q.createdAt).toLocaleDateString('el-GR')}</span>
							</div>
						</Card>
					</div>
				{/each}
			</div>
		{/if}
	</section>
</div>

<style>
	.intro-admin-container {
		max-width: 900px;
		margin: 0 auto;
		padding: 2rem 1rem;
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}
	
	.back-link {
		color: #2563eb;
		text-decoration: none;
		font-size: 0.9rem;
		display: block;
		margin-bottom: 1rem;
	}
	
	h1 {
		font-size: 2rem;
		color: #111827;
		margin-bottom: 0.5rem;
	}

	.active-quiz-section {
		margin-bottom: 1rem;
	}

	.active-quiz-form {
		display: flex;
		gap: 1rem;
		align-items: flex-end;
		flex-wrap: wrap;
	}

	.input-group {
		flex: 1;
		min-width: 250px;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	label {
		font-weight: 600;
		font-size: 0.9rem;
		color: #4b5563;
	}

	select {
		padding: 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 1rem;
		background-color: white;
		width: 100%;
	}

	h2 {
		margin-top: 0;
		margin-bottom: 1.5rem;
		font-size: 1.25rem;
		color: #1f2937;
		border-bottom: 2px solid #f3f4f6;
		padding-bottom: 0.5rem;
	}

	.quiz-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 1rem;
	}

	:global(.quiz-card) {
		height: 100%;
	}

	:global(.quiz-card.is-active) {
		border: 2px solid #059669 !important;
		background-color: #f0fdf4 !important;
	}

	.title-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
	}

	.active-badge {
		background: #059669;
		color: white;
		font-size: 0.7rem;
		font-weight: bold;
		padding: 2px 6px;
		border-radius: 4px;
	}

	.quiz-info h3 {
		margin: 0;
		color: #111827;
		font-size: 1.1rem;
	}

	.date {
		font-size: 0.8rem;
		color: #9ca3af;
	}

	.empty-state {
		text-align: center;
		color: #6b7280;
		padding: 2rem 0;
	}
</style>
