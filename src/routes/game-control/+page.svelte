<script>
	import { onMount } from 'svelte';
	import { joinRoom, sendCommand } from '$lib/socket-client';
	import Button from '$lib/components/Button.svelte';
	import Card from '$lib/components/Card.svelte';
	import Badge from '$lib/components/Badge.svelte';

	let { data } = $props();

	let selectedIndex = $state(-1); // -1 for Intro, 0+ for questions/cards
	let selectedItem = $derived(selectedIndex === -1 ? { type: 'intro', text: 'Αρχική Σελίδα' } : data.questions[selectedIndex]);

	onMount(() => {
		if (data.activeQuizId) {
			joinRoom(data.activeQuizId);
		}
	});

	function handleCommand(command, payload = {}) {
		if (data.activeQuizId) {
			sendCommand(data.activeQuizId, command, payload);
		}
	}

	function goLive() {
		if (selectedIndex === -1) {
			handleCommand('SHOW_INTRO');
		} else {
			handleCommand('SHOW_CONTENT', { 
				id: selectedItem.id, 
				type: selectedItem.type,
				index: selectedIndex 
			});
		}
	}
</script>

<div class="game-control-dashboard">
	{#if data.activeQuizId}
		<aside class="sidebar">
			<header class="sidebar-header">
				<h2>Quiz Flow</h2>
			</header>
			<nav class="flow-nav">
				<button 
					class="nav-item intro-item" 
					class:active={selectedIndex === -1}
					onclick={() => selectedIndex = -1}
				>
					<span class="icon">🏠</span>
					<span class="label">Εισαγωγή (Intro)</span>
				</button>

				<div class="nav-divider">Περιεχόμενο</div>

				{#each data.questions as item, i}
					<button 
						class="nav-item" 
						class:active={selectedIndex === i}
						class:is-card={item.type === 'card'}
						onclick={() => selectedIndex = i}
					>
						<span class="index">{i + 1}</span>
						<div class="item-meta">
							<span class="label">{item.text}</span>
							<span class="type-tag">{item.type === 'card' ? 'ΚΑΡΤΑ' : 'ΕΡΩΤΗΣΗ'}</span>
						</div>
					</button>
				{/each}
			</nav>
		</aside>

		<main class="main-panel">
			<header class="panel-header">
				<div class="header-info">
					<h1>Έλεγχος Παιχνιδιού</h1>
					<p>Ενεργό Quiz: <strong>{data.activeQuizId}</strong></p>
				</div>
				<div class="header-actions">
					<Button onclick={() => handleCommand('SHOW_LEADERBOARD')} variant="secondary">Κατάταξη</Button>
					<Button onclick={() => handleCommand('RESET_GAME')} variant="danger">Reset</Button>
				</div>
			</header>

			<section class="control-area">
				<Card class="preview-card">
					<div class="preview-header">
						<Badge variant={selectedItem.type === 'intro' ? 'default' : (selectedItem.type === 'card' ? 'primary' : 'success')}>
							{selectedItem.type.toUpperCase()}
						</Badge>
						<h3>Προεπισκόπηση: {selectedItem.text}</h3>
					</div>

					<div class="content-preview">
						{#if selectedItem.type === 'intro'}
							<div class="intro-preview">
								<p>Η αρχική οθόνη του Quiz με τον τίτλο και τον υπότιτλο που έχει ορίσει ο Admin.</p>
							</div>
						{:else if selectedItem.type === 'card'}
							<div class="card-details">
								<p><strong>Template:</strong> {selectedItem.template}</p>
								{#if selectedItem.explanation}
									<p class="explanation-text">{selectedItem.explanation}</p>
								{/if}
								{#if selectedItem.mediaUrl}
									<p class="media-info">Συνημμένο: {selectedItem.mediaType}</p>
								{/if}
							</div>
						{:else if selectedItem.type === 'question'}
							<div class="question-details">
								<p class="points-time">Πόντοι: {selectedItem.points} | Χρόνος: {selectedItem.timeLimit}s</p>
								{#if selectedItem.explanation}
									<p class="explanation-text">{selectedItem.explanation}</p>
								{/if}
								<div class="options-preview">
									<strong>Επιλογές:</strong>
									<ul>
										{#each selectedItem.options as opt}
											<li class:correct={opt.isCorrect}>{opt.text}</li>
										{/each}
									</ul>
								</div>
							</div>
						{/if}
					</div>

					<div class="live-action">
						<Button onclick={goLive} variant="primary" class="go-live-btn">
							GO LIVE ⚡
						</Button>
					</div>
				</Card>
			</section>
		</main>
	{:else}
		<div class="no-quiz-state">
			<Card class="warning-card">
				<p>Δεν υπάρχει ενεργό quiz. Επιλέξτε ένα από τη <a href="/admin/intro-page">Διαχείριση Εισαγωγικής Σελίδας</a>.</p>
			</Card>
		</div>
	{/if}
</div>

<style>
	.game-control-dashboard {
		display: flex;
		height: calc(100vh - 6rem);
		margin: -1rem; /* Offset layout padding */
		background: #f9fafb;
	}

	/* Sidebar Styling */
	.sidebar {
		width: 300px;
		background: white;
		border-right: 1px solid #e5e7eb;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.sidebar-header {
		padding: 1.5rem;
		border-bottom: 1px solid #f3f4f6;
	}

	.sidebar-header h2 { margin: 0; font-size: 1.1rem; color: #111827; }

	.flow-nav {
		flex: 1;
		overflow-y: auto;
		padding: 0.75rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.nav-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		border: 1px solid transparent;
		border-radius: 8px;
		background: transparent;
		cursor: pointer;
		text-align: left;
		transition: all 0.2s;
	}

	.nav-item:hover { background: #f3f4f6; }
	.nav-item.active { background: #eff6ff; border-color: #2563eb; }

	.nav-item.is-card { border-left: 4px solid #2563eb; }

	.nav-item .index {
		width: 24px;
		height: 24px;
		background: #f3f4f6;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.75rem;
		font-weight: bold;
		color: #6b7280;
	}

	.nav-item.active .index { background: #2563eb; color: white; }

	.item-meta { display: flex; flex-direction: column; flex: 1; overflow: hidden; }
	.item-meta .label { font-size: 0.85rem; font-weight: 600; color: #374151; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
	.item-meta .type-tag { font-size: 0.65rem; color: #9ca3af; font-weight: bold; }

	.nav-divider { padding: 1rem 1rem 0.5rem; font-size: 0.7rem; font-weight: bold; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; }

	/* Main Panel Styling */
	.main-panel {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow-y: auto;
		padding: 2rem;
	}

	.panel-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 2.5rem;
	}

	.panel-header h1 { margin: 0; font-size: 1.75rem; color: #111827; }
	.panel-header p { margin: 0.25rem 0 0; color: #6b7280; }

	.header-actions { display: flex; gap: 0.75rem; }

	.control-area { max-width: 800px; }

	:global(.preview-card) { padding: 2rem !important; }

	.preview-header { margin-bottom: 2rem; }
	.preview-header h3 { margin: 0.75rem 0 0; font-size: 1.5rem; color: #111827; }

	.content-preview {
		min-height: 200px;
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: 12px;
		padding: 1.5rem;
		margin-bottom: 2rem;
	}

	.explanation-text { color: #4b5563; line-height: 1.5; margin: 1rem 0; }

	.options-preview ul { list-style: none; padding: 0; margin: 1rem 0 0; display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
	.options-preview li { padding: 0.75rem; background: white; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.9rem; }
	.options-preview li.correct { border-color: #10b981; background: #f0fdf4; color: #065f46; font-weight: bold; }

	.live-action { display: flex; justify-content: flex-end; }
	:global(.go-live-btn) { padding: 1rem 3rem !important; font-size: 1.2rem !important; font-weight: 800 !important; letter-spacing: 1px; }

	.no-quiz-state { flex: 1; display: flex; align-items: center; justify-content: center; }
</style>
