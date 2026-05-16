<script>
	import { fly } from 'svelte/transition';
	import Card from '../Card.svelte';
	import UserAvatar from '../UserAvatar.svelte';

	let { mode = 'display', content = null } = $props();

	// content expected to be { revealedPlayers: [...] }
	let revealedPlayers = $derived(content?.revealedPlayers || []);
</script>

{#if mode === 'display'}
	<div class="leaderboard-view-display">
		<header class="view-header">
			<span class="view-icon">🏆</span>
			<h2>Κατάταξη Παικτών</h2>
		</header>
		
		<div class="leaderboard-container">
			{#if revealedPlayers.length === 0}
				<div class="waiting-msg" in:fly={{ y: 20, duration: 500 }}>
					<p>Ετοιμαστείτε για τα αποτελέσματα...</p>
				</div>
			{:else}
				<div class="players-list">
					{#each revealedPlayers as player, i (player.userId)}
						<div 
							class="player-item" 
							in:fly={{ x: -50, duration: 600 }}
						>
							<div class="rank-badge">
								{revealedPlayers.length - i}
							</div>
							<UserAvatar user={{ name: player.name, username: player.username }} size="md" />
							<div class="player-info">
								<span class="player-name">{player.username || player.name}</span>
							</div>
							<div class="player-score">
								<span class="score-value">{player.totalPoints}</span>
								<span class="score-label">pts</span>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
{:else}
	<div class="leaderboard-view-controller">
		<Card>
			<div class="attention-content">
				<span class="status-icon pulse">🏆</span>
				<h3>Δείτε την κεντρική οθόνη</h3>
				<p class="sub-text">Η κατάταξη εμφανίζεται στη μεγάλη οθόνη!</p>
			</div>
		</Card>
	</div>
{/if}

<style>
	/* Display Styles */
	.leaderboard-view-display { flex: 1; display: flex; flex-direction: column; align-items: center; padding: 4rem; width: 100%; height: 100%; box-sizing: border-box; background: radial-gradient(circle at center, #1e293b 0%, #0f172a 100%); }
	
	.view-header { display: flex; align-items: center; gap: 1.5rem; margin-bottom: 4rem; }
	.view-icon { font-size: 5rem; animation: float 3s ease-in-out infinite; }
	.view-header h2 { font-size: 5rem; color: #fff; margin: 0; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; text-shadow: 0 4px 12px rgba(0,0,0,0.5); }

	.leaderboard-container { width: 100%; max-width: 1000px; flex: 1; display: flex; flex-direction: column; }

	.waiting-msg { flex: 1; display: flex; align-items: center; justify-content: center; }
	.waiting-msg p { font-size: 2.5rem; color: #94a3b8; font-style: italic; animation: pulse 2s infinite; }

	.players-list { display: flex; flex-direction: column-reverse; gap: 1.5rem; }

	.player-item { display: flex; align-items: center; gap: 2rem; padding: 1.5rem 2.5rem; background: rgba(255, 255, 255, 0.1); border: 2px solid rgba(255, 255, 255, 0.1); border-radius: 32px; backdrop-filter: blur(10px); box-shadow: 0 8px 32px rgba(0,0,0,0.3); }
	
	.rank-badge { width: 60px; height: 60px; background: #2563eb; color: white; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-size: 2rem; font-weight: 900; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4); }

	.player-info { flex: 1; }
	.player-name { font-size: 2.5rem; font-weight: 700; color: #fff; }

	.player-score { text-align: right; }
	.score-value { font-size: 3rem; font-weight: 900; color: #fbbf24; display: block; line-height: 1; }
	.score-label { font-size: 1.2rem; color: #94a3b8; font-weight: 600; text-transform: uppercase; }

	@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
	@keyframes pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }

	/* Controller Styles */
	.attention-content { text-align: center; padding: 2.5rem 1rem; }
	.status-icon { font-size: 4rem; display: block; margin-bottom: 1.5rem; }
	.status-icon.pulse { animation: pulseAnim 2s infinite; }
	@keyframes pulseAnim { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.1); opacity: 0.7; } }
	h3 { color: #1e293b; margin: 0 0 1rem; font-size: 1.4rem; font-weight: 800; }
	.sub-text { color: #64748b; font-size: 1rem; }
</style>
