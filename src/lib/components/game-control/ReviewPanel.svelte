<script>
	import Card from '../Card.svelte';
	import Button from '../Button.svelte';

	let { 
		questions = [], 
		onSelectQuestion = () => {},
		onRevealAnswer = () => {},
		activeReviewId = null
	} = $props();

	let reviewQuestions = $derived(questions.filter(q => q.type === 'question'));
</script>

<section class="review-mode-panel">
	<Card class="review-card-main">
		<header class="review-header">
			<div class="title-wrap">
				<span class="review-icon">💡</span>
				<h2>Λειτουργία Ανασκόπησης Απαντήσεων</h2>
			</div>
			<p>Επιλέξτε μια ερώτηση για να την προβάλλετε στην οθόνη και να αποκαλύψετε τη σωστή απάντηση.</p>
		</header>

		<div class="questions-selector-grid">
			{#each reviewQuestions as q, i}
				<button 
					class="q-jump-btn" 
					class:active={activeReviewId === q.id}
					onclick={() => onSelectQuestion(q)}
				>
					<span class="q-num">{i + 1}</span>
					<span class="q-txt">{q.text}</span>
				</button>
			{/each}
		</div>

		<div class="review-actions">
			<Button 
				variant="success" 
				class="reveal-btn" 
				disabled={!activeReviewId}
				onclick={onRevealAnswer}
			>
				✨ ΑΠΟΚΑΛΥΨΗ ΑΠΑΝΤΗΣΗΣ
			</Button>
		</div>
	</Card>
</section>

<style>
	.review-mode-panel { width: 100%; }
	
	:global(.review-card-main) { background: #fffbeb !important; border: 2px solid #fcd34d !important; }

	.review-header { margin-bottom: 2rem; }
	.title-wrap { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem; }
	.review-icon { font-size: 1.5rem; }
	.review-header h2 { margin: 0; color: #92400e; font-size: 1.25rem; font-weight: 800; }
	.review-header p { margin: 0; color: #b45309; font-size: 0.9rem; }

	.questions-selector-grid { 
		display: grid; 
		grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); 
		gap: 0.75rem; 
		margin-bottom: 2rem;
	}

	.q-jump-btn {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 1rem;
		background: white;
		border: 2px solid #fef3c7;
		border-radius: 12px;
		cursor: pointer;
		text-align: left;
		transition: all 0.2s;
	}

	.q-jump-btn:hover { border-color: #fcd34d; background: #fffcf0; transform: translateY(-2px); }
	.q-jump-btn.active { border-color: #f59e0b; background: #fffbeb; box-shadow: 0 4px 6px rgba(146, 64, 14, 0.1); }

	.q-num { font-size: 0.7rem; font-weight: 900; color: #d97706; background: #fef3c7; padding: 2px 6px; border-radius: 4px; width: fit-content; }
	.q-txt { font-size: 0.85rem; font-weight: 600; color: #451a03; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

	.review-actions { display: flex; justify-content: center; }
	:global(.reveal-btn) { padding: 1.25rem 3rem !important; font-size: 1.1rem !important; font-weight: 800 !important; border-radius: 15px !important; width: 100%; box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.2) !important; }
</style>
