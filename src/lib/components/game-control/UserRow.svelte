<script>
	import UserAvatar from '../UserAvatar.svelte';

	let { 
		user = {}, 
		totalQuestions = 0, 
		isQuestionLive = false 
	} = $props();
</script>

<div class="user-row" class:user-answered={user.answeredCurrent}>
	<UserAvatar {user} size="32px" />
	<div class="user-info-row">
		<span class="user-name">{user.username || user.name}</span>
		<div class="user-stats">
			<span class="stat-count">{user.answerCount || 0} / {totalQuestions}</span>
			<span class="stat-label">απαντήσεις</span>
		</div>
	</div>
	<div class="user-participation-status">
		{#if user.answeredCurrent}
			<span class="status-answered" title="Απάντησε">✅</span>
		{:else if isQuestionLive}
			<span class="status-thinking" title="Σκέφτεται...">⏳</span>
		{/if}
	</div>
	<span class="user-status-dot"></span>
</div>

<style>
	.user-row { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; background: #f8fafc; border-radius: 12px; border: 1px solid #f1f5f9; transition: all 0.2s; }
	.user-row:hover { background: white; border-color: #e2e8f0; transform: translateY(-1px); box-shadow: 0 4px 6px rgba(0,0,0,0.02); }
	.user-row.user-answered { border-color: #4ade80; background: #f0fdf4; }
	
	.user-info-row { flex: 1; display: flex; flex-direction: column; gap: 0.1rem; }
	.user-name { font-size: 0.9rem; font-weight: 700; color: #1e293b; }
	
	.user-stats { display: flex; align-items: center; gap: 0.35rem; }
	.stat-count { font-size: 0.75rem; font-weight: 800; color: #2563eb; background: #eff6ff; padding: 0 0.4rem; border-radius: 4px; }
	.stat-label { font-size: 0.7rem; color: #64748b; font-weight: 600; text-transform: lowercase; }

	.user-participation-status { font-size: 1.2rem; margin-right: 0.5rem; }
	.status-thinking { display: inline-block; animation: rotate 2s infinite linear; }
	@keyframes rotate { from { transform: rotate(0); } to { transform: rotate(360deg); } }

	.user-status-dot { width: 8px; height: 8px; background: #22c55e; border-radius: 50%; box-shadow: 0 0 6px rgba(34, 197, 94, 0.4); }
</style>
