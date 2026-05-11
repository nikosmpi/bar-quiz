<script>
	import Button from '../Button.svelte';

	let { 
		activeQuiz = null, 
		activeQuizId = "", 
		onShowLeaderboard = () => {}, 
		onResetGame = () => {},
		children
	} = $props();
</script>

<main class="main-panel">
	<header class="panel-header">
		<div class="header-info">
			<h1>{activeQuiz?.name || 'Έλεγχος Παιχνιδιού'}</h1>
			<p class="quiz-id">Production Console • ID: {activeQuizId}</p>
		</div>
		<div class="header-actions">
			<Button onclick={onShowLeaderboard} variant="secondary">📊 Leaderboard</Button>
			<Button onclick={onResetGame} variant="danger">🔄 Reset</Button>
		</div>
	</header>

	<div class="control-stack">
		{@render children()}
	</div>
</main>

<style>
	.main-panel { flex: 1; display: flex; flex-direction: column; padding: 2rem 2.5rem; overflow-y: auto; background: #f8fafc; }
	.panel-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
	.panel-header h1 { margin: 0; font-size: 2rem; color: #0f172a; font-weight: 800; line-height: 1.1; }
	.quiz-id { margin: 0.5rem 0 0; color: #64748b; font-weight: 500; font-size: 0.85rem; }

	.control-stack { display: flex; flex-direction: column; gap: 1.5rem; max-width: 900px; margin: 0 auto; width: 100%; }
</style>
