<script>
	import { onMount } from 'svelte';
	import { joinRoom, sendCommand } from '$lib/socket-client';
	import Button from '$lib/components/Button.svelte';
	import Card from '$lib/components/Card.svelte';

	let { data } = $props();

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
</script>

<div class="game-control-container">
	<header>
		<h1>Game Control</h1>
		<p class="status">Ενεργό Quiz ID: <strong>{data.activeQuizId || 'Κανένα'}</strong></p>
	</header>

	{#if data.activeQuizId}
		<div class="control-sections">
			<Card title="Ροή Παιχνιδιού" class="flow-card">
				<div class="button-list">
					<Button onclick={() => handleCommand('SHOW_INTRO')} variant="primary" class="full-width-btn">
						Αρχική Σελίδα (Intro)
					</Button>
					
					<div class="questions-grid">
						{#each data.questions as q, i}
							<Button onclick={() => handleCommand('SHOW_QUESTION', { questionId: q.id, index: i })} variant="secondary">
								Ερώτηση {i + 1}
							</Button>
						{/each}
					</div>
				</div>
			</Card>

			<Card title="Άλλες Ενέργειες">
				<div class="button-group">
					<Button onclick={() => handleCommand('SHOW_LEADERBOARD')} variant="secondary">
						Εμφάνιση Κατάταξης
					</Button>
					<Button onclick={() => handleCommand('RESET_GAME')} variant="danger">
						Επαναφορά Παιχνιδιού
					</Button>
				</div>
			</Card>
		</div>
	{:else}
		<Card class="warning-card">
			<p>Δεν υπάρχει ενεργό quiz. Επιλέξτε ένα από τη <a href="/admin/intro-page">Διαχείριση Εισαγωγικής Σελίδας</a>.</p>
		</Card>
	{/if}
</div>

<style>
	.game-control-container {
		max-width: 1000px;
		margin: 0 auto;
		padding: 2rem 1rem;
	}

	header {
		text-align: center;
		margin-bottom: 2rem;
	}

	h1 {
		color: #111827;
		font-size: 2.5rem;
		margin-bottom: 0.5rem;
	}

	.status {
		color: #6b7280;
	}

	.control-sections {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.button-list {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.questions-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
		gap: 0.75rem;
	}

	.button-group {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	:global(.full-width-btn) {
		width: 100% !important;
		padding: 1.25rem !important;
		font-size: 1.1rem !important;
	}

	.warning-card {
		text-align: center;
		padding: 3rem;
		border: 2px dashed #f59e0b !important;
	}
</style>
