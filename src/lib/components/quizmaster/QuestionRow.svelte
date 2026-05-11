<script>
	import { enhance } from '$app/forms';
	import Card from '../Card.svelte';
	import Badge from '../Badge.svelte';

	let { 
		q = {}, 
		index = 0, 
		totalQuestions = 0, 
		quizId = "" 
	} = $props();
</script>

<Card class="question-row-card {q.type === 'card' ? 'is-card' : ''}">
	<div class="reorder-actions">
		<form method="POST" action="?/reorderQuestion" use:enhance>
			<input type="hidden" name="questionId" value={q.id} />
			<input type="hidden" name="direction" value="up" />
			<button type="submit" class="order-btn" disabled={index === 0} title="Μετακίνηση πάνω">▲</button>
		</form>
		<form method="POST" action="?/reorderQuestion" use:enhance>
			<input type="hidden" name="questionId" value={q.id} />
			<input type="hidden" name="direction" value="down" />
			<button type="submit" class="order-btn" disabled={index === totalQuestions - 1} title="Μετακίνηση κάτω">▼</button>
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
		<a href="/quizmaster/quiz/{quizId}/question/{q.id}" class="edit-link-btn">Επεξεργασία</a>
		<form method="POST" action="?/deleteQuestion" use:enhance>
			<input type="hidden" name="questionId" value={q.id} />
			<button type="submit" class="delete-icon-btn" onclick={(e) => { if(!confirm('Διαγραφή;')) e.preventDefault(); }} title="Διαγραφή">
				✕
			</button>
		</form>
	</div>
</Card>

<style>
	:global(.question-row-card .card-body) {
		padding: 1rem 1.5rem !important;
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
	}

	:global(.question-row-card.is-card) {
		border-left: 4px solid #2563eb !important;
	}

	.type-badge-row { margin-bottom: 0.4rem; }

	.reorder-actions { display: flex; flex-direction: column; gap: 0.25rem; }

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

	.order-btn:hover:not(:disabled) { background: #e5e7eb; color: #111827; }
	.order-btn:disabled { opacity: 0.3; cursor: not-allowed; }

	.q-info { flex: 1; }
	.q-text { font-weight: 600; color: #111827; display: block; margin-bottom: 0.25rem; }
	.q-meta { display: flex; gap: 0.5rem; margin-top: 0.5rem; }

	.q-actions { display: flex; gap: 1rem; align-items: center; }

	.edit-link-btn { color: #2563eb; text-decoration: none; font-weight: 600; font-size: 0.9rem; }
	.edit-link-btn:hover { text-decoration: underline; }

	.delete-icon-btn {
		background: none;
		border: none;
		color: #9ca3af;
		cursor: pointer;
		font-size: 1.2rem;
		padding: 0.2rem;
		transition: color 0.2s;
	}
	.delete-icon-btn:hover { color: #ef4444; }
</style>
