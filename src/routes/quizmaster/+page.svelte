<script>
	import { enhance } from '$app/forms';
	let { data, form } = $props();

	let loading = $state(false);
</script>

<div class="quizmaster-container">
	<header>
		<h1>Quizmaster Dashboard</h1>
		<p class="welcome">Καλώς ήρθες, <strong>{data.user.name}</strong>!</p>
	</header>

	<section class="create-quiz-section">
		<h2>Δημιουργία Νέου Quiz</h2>
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
			<button type="submit" disabled={loading}>
				{loading ? 'Δημιουργία...' : 'Δημιουργία Quiz'}
			</button>
		</form>
		{#if form?.message}
			<p class="message {form.success ? 'success' : 'error'}">{form.message}</p>
		{/if}
	</section>

	<section class="quiz-list-section">
		<h2>Τα Quiz σου</h2>
		{#if data.quizzes.length === 0}
			<p class="empty-state">Δεν έχεις δημιουργήσει ακόμα κάποιο quiz. Ξεκίνα από την παραπάνω φόρμα!</p>
		{:else}
			<div class="quiz-grid">
				{#each data.quizzes as q}
					<a href="/quizmaster/quiz/{q.id}" class="quiz-card">
						<div class="quiz-info">
							<h3>{q.name}</h3>
							<span class="date">Δημιουργήθηκε: {new Date(q.createdAt).toLocaleDateString('el-GR')}</span>
						</div>
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
	}

	header {
		margin-bottom: 2rem;
		text-align: center;
	}

	h1 {
		color: #111827;
		margin-bottom: 0.5rem;
	}

	.welcome {
		color: #6b7280;
	}

	section {
		background: white;
		padding: 2rem;
		border-radius: 12px;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
		margin-bottom: 2rem;
		border: 1px solid #e5e7eb;
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
		ring: 2px solid #bfdbfe;
	}

	button {
		padding: 0.75rem 1.5rem;
		background: #2563eb;
		color: white;
		border: none;
		border-radius: 6px;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.2s;
		height: 48px;
	}

	button:hover:not(:disabled) {
		background: #1d4ed8;
	}

	button:disabled {
		background: #9ca3af;
		cursor: not-allowed;
	}

	.message {
		margin-top: 1rem;
		padding: 0.75rem;
		border-radius: 6px;
		font-size: 0.9rem;
	}

	.message.success { background: #d1fae5; color: #065f46; }
	.message.error { background: #fee2e2; color: #991b1b; }

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

	.quiz-card {
		padding: 1.5rem;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		text-decoration: none;
		color: inherit;
		background: white;
		transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
	}

	.quiz-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
		border-color: #2563eb;
	}

	.quiz-card h3 {
		margin: 0 0 0.5rem 0;
		color: #111827;
		font-size: 1.1rem;
		transition: color 0.2s;
	}

	.quiz-card:hover h3 {
		color: #2563eb;
	}

	.date {
		font-size: 0.8rem;
		color: #9ca3af;
	}
</style>
