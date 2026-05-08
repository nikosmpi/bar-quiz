<script>
	import { enhance } from '$app/forms';
	import Card from '$lib/components/Card.svelte';
	import Button from '$lib/components/Button.svelte';
	import Alert from '$lib/components/Alert.svelte';
	
	let { data, form } = $props();

	let loading = $state(false);
	let activeQuizLoading = $state(false);
</script>

<div class="quizmaster-container">
	<header>
		<h1>Quizmaster Dashboard</h1>
		<p class="welcome">Καλώς ήρθες, <strong>{data.user.name}</strong>!</p>
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

	<Card title="Δημιουργία Νέου Quiz" class="create-quiz-card">
		<form 
			method="POST" 
			action="?/createQuiz" 
			use:enhance={() => {
				loading = true;
				return async ({ update }) => {
					await update();
					loading = false;
				};
			}}
			class="create-form"
		>
			<div class="input-group">
				<label for="name">Όνομα Quiz</label>
				<input 
					type="text" 
					id="name" 
					name="name" 
					placeholder="π.χ. Ιστορία της Τέχνης" 
					required 
					disabled={loading}
				/>
			</div>
			<Button type="submit" {loading}>
				Δημιουργία Quiz
			</Button>
		</form>
		{#if form?.message && !form?.success && !data.activeQuizId} <!-- Only show error for create quiz if it fails -->
			<Alert type="error" message={form.message} style="margin-top: 1.5rem; margin-bottom: 0;" />
		{/if}
	</Card>

	<section class="quiz-list-section">
		<h2>Τα Quiz σου ({data.quizzes.length})</h2>
		{#if data.quizzes.length === 0}
			<p class="empty-state">Δεν έχεις δημιουργήσει ακόμα κάποιο quiz. Ξεκίνα από την παραπάνω φόρμα!</p>
		{:else}
			<div class="quiz-grid">
				{#each data.quizzes as q}
					<a href="/quizmaster/quiz/{q.id}" class="quiz-link">
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
					</a>
				{/each}
			</div>
		{/if}
	</section>
</div>

<style>
	.quizmaster-container {
		max-width: 900px;
		margin: 0 auto;
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	header {
		text-align: center;
		margin-bottom: 1rem;
	}

	h1 {
		color: #111827;
		margin-bottom: 0.5rem;
	}

	.welcome {
		color: #6b7280;
	}

	.active-quiz-form {
		display: flex;
		gap: 1rem;
		align-items: flex-end;
		flex-wrap: wrap;
	}

	select {
		padding: 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 1rem;
		background-color: white;
		width: 100%;
		max-width: 400px;
	}

	.active-badge {
		background: #059669;
		color: white;
		font-size: 0.7rem;
		font-weight: bold;
		padding: 2px 6px;
		border-radius: 4px;
	}

	.title-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
	}

	:global(.quiz-card.is-active) {
		border: 2px solid #059669 !important;
		background-color: #f0fdf4 !important;
	}

	h2 {
		margin-top: 0;
		margin-bottom: 1.5rem;
		font-size: 1.25rem;
		color: #1f2937;
		border-bottom: 2px solid #f3f4f6;
		padding-bottom: 0.5rem;
	}

	.create-form {
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

	input {
		padding: 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 1rem;
		transition: border-color 0.2s;
	}

	input:focus {
		outline: none;
		border-color: #2563eb;
	}

	.empty-state {
		text-align: center;
		color: #6b7280;
		padding: 2rem 0;
	}

	.quiz-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 1rem;
	}

	.quiz-link {
		text-decoration: none;
		color: inherit;
	}

	:global(.quiz-card) {
		transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s !important;
		height: 100%;
	}

	:global(.quiz-card:hover) {
		transform: translateY(-4px);
		box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
		border-color: #2563eb !important;
	}

	:global(.quiz-card .card-body) {
		padding: 1.5rem !important;
	}

	.quiz-info h3 {
		margin: 0;
		color: #111827;
		font-size: 1.1rem;
		transition: color 0.2s;
	}

	.quiz-link:hover h3 {
		color: #2563eb;
	}

	.date {
		font-size: 0.8rem;
		color: #9ca3af;
	}
</style>
