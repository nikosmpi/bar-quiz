<script>
	import { onMount } from 'svelte';
	import Button from '../Button.svelte';
	import Card from '../Card.svelte';
	import UserAvatar from '../UserAvatar.svelte';

	let { 
		quizId = "", 
		onCommand = () => {} 
	} = $props();

	let leaderboard = $state([]);
	let loading = $state(true);
	let revealedIndex = $state(-1); // -1 means nothing revealed yet

	onMount(async () => {
		try {
			const res = await fetch(`/api/game/leaderboard?quizId=${quizId}`);
			if (res.ok) {
				leaderboard = await res.json();
			}
		} catch (err) {
			console.error('Failed to fetch leaderboard:', err);
		} finally {
			loading = false;
		}
	});

	function goLive() {
		revealedIndex = -1;
		onCommand('SHOW_LEADERBOARD', { revealedPlayers: [] });
	}

	function revealNext() {
		if (revealedIndex < leaderboard.length - 1) {
			revealedIndex += 1;
			const revealedPlayers = leaderboard.slice(0, revealedIndex + 1);
			onCommand('SHOW_LEADERBOARD', { revealedPlayers });
		}
	}

	function revealAll() {
		revealedIndex = leaderboard.length - 1;
		onCommand('SHOW_LEADERBOARD', { revealedPlayers: leaderboard });
	}
</script>

<div class="leaderboard-panel">
	<Card>
		<div class="panel-header">
			<div class="header-main">
				<span class="icon">📊</span>
				<div class="title-group">
					<h3>Διαχείριση Κατάταξης</h3>
					<p>Εμφανίστε τα αποτελέσματα σταδιακά (από τον τελευταίο στον πρώτο).</p>
				</div>
			</div>
			<div class="actions">
				<Button onclick={goLive} variant="secondary">Προετοιμασία Οθόνης</Button>
				<Button 
					onclick={revealNext} 
					variant="primary" 
					disabled={loading || revealedIndex >= leaderboard.length - 1}
				>
					Επόμενος Παίκτης ({revealedIndex + 2}/{leaderboard.length})
				</Button>
				<Button onclick={revealAll} variant="outline" disabled={loading}>Αποκάλυψη Όλων</Button>
			</div>
		</div>

		{#if loading}
			<div class="loading-state">Φόρτωση βαθμολογίας...</div>
		{:else if leaderboard.length === 0}
			<div class="empty-state">Δεν υπάρχουν ακόμα αποτελέσματα για αυτό το quiz.</div>
		{:else}
			<div class="players-list">
				{#each leaderboard as player, i}
					<div class="player-row" class:revealed={i <= revealedIndex}>
						<span class="rank">{leaderboard.length - i}ος</span>
						<UserAvatar user={{ name: player.name, username: player.username }} size="sm" />
						<div class="player-info">
							<span class="name">{player.username || player.name}</span>
						</div>
						<div class="score">{player.totalPoints} <span class="pts">pts</span></div>
						{#if i <= revealedIndex}
							<span class="status-tag">LIVE</span>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</Card>
</div>

<style>
	.panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; gap: 1.5rem; }
	.header-main { display: flex; align-items: center; gap: 1rem; }
	.icon { font-size: 2rem; }
	.title-group h3 { margin: 0; font-size: 1.25rem; color: #0f172a; }
	.title-group p { margin: 0.25rem 0 0; font-size: 0.9rem; color: #64748b; }
	
	.actions { display: flex; gap: 0.75rem; }

	.loading-state, .empty-state { padding: 3rem; text-align: center; color: #64748b; font-style: italic; }

	.players-list { display: flex; flex-direction: column; gap: 0.5rem; }
	.player-row { display: flex; align-items: center; gap: 1rem; padding: 0.75rem 1rem; background: #f1f5f9; border-radius: 12px; opacity: 0.5; transition: all 0.3s; }
	.player-row.revealed { background: #dcfce7; opacity: 1; border: 1px solid #86efac; }
	
	.rank { font-weight: 800; color: #64748b; width: 40px; }
	.player-info { flex: 1; }
	.name { font-weight: 600; color: #1e293b; }
	.score { font-weight: 800; color: #2563eb; font-size: 1.1rem; }
	.pts { font-size: 0.75rem; color: #64748b; font-weight: 500; }
	
	.status-tag { font-size: 0.65rem; background: #22c55e; color: white; padding: 2px 6px; border-radius: 4px; font-weight: 900; }
</style>
