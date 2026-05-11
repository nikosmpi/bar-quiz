<script>
	import QuestionRow from './QuestionRow.svelte';

	let { 
		questions = [], 
		quizId = "" 
	} = $props();
</script>

<section class="questions-list">
	<div class="list-header">
		<h2>Περιεχόμενο Quiz ({questions.length})</h2>
	</div>

	{#if questions.length === 0}
		<p class="empty">Δεν υπάρχει ακόμα περιεχόμενο. Ξεκινήστε από τα αριστερά!</p>
	{:else}
		<div class="questions-grid">
			{#each questions as q, i (q.id)}
				<QuestionRow {q} index={i} totalQuestions={questions.length} {quizId} />
			{/each}
		</div>
	{/if}
</section>

<style>
	.questions-list { flex: 1; }
	.list-header { margin-bottom: 1.5rem; }
	.list-header h2 { margin: 0; font-size: 1.25rem; color: #111827; }

	.questions-grid { display: flex; flex-direction: column; gap: 0.75rem; }
	.empty { text-align: center; color: #6b7280; padding: 2rem 0; }
</style>
