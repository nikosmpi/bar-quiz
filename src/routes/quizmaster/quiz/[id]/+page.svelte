<script>
	import { enhance } from '$app/forms';
	import Button from '$lib/components/Button.svelte';
	
	import AddContentSidebar from '$lib/components/quizmaster/AddContentSidebar.svelte';
	import QuestionList from '$lib/components/quizmaster/QuestionList.svelte';
	
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
		<AddContentSidebar bind:loading />
		<QuestionList questions={data.questions} quizId={data.quiz.id} />
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

	@media (max-width: 900px) {
		.editor-layout {
			grid-template-columns: 1fr;
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

