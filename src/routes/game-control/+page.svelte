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
		<div class="control-grid">
			<Card title="Ροή Παιχνιδιού">
				<div class="button-group">
					<Button onclick={() => handleCommand('START_QUIZ')} variant="primary">
						Έναρξη Quiz
					</Button>
					<Button onclick={() => handleCommand('NEXT_QUESTION')} variant="secondary">
						Επόμενη Ερώτηση
					</Button>
					<Button onclick={() => handleCommand('SHOW_LEADERBOARD')} variant="secondary">
						Εμφάνιση Κατάταξης
					</Button>
				</div>
			</Card>

			<Card title="Σύστημα">
				<Button onclick={() => handleCommand('RESET_GAME')} variant="danger">
					Επαναφορά Παιχνιδιού
				</Button>
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

	.control-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 2rem;
	}

	.button-group {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.warning-card {
		text-align: center;
		padding: 3rem;
		border: 2px dashed #f59e0b !important;
	}
</style>
