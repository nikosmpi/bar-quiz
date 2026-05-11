<script>
	import UserRow from './UserRow.svelte';

	let { 
		connectedUsers = [], 
		totalQuestions = 0, 
		isQuestionLive = false 
	} = $props();
</script>

<aside class="sidebar users-sidebar">
	<div class="sidebar-header">
		<h2>Συνδεδεμένοι ({connectedUsers.length})</h2>
	</div>
	<div class="users-list">
		{#if connectedUsers.length === 0}
			<p class="empty-users">Αναμονή για παίκτες...</p>
		{:else}
			{#each connectedUsers as user}
				<UserRow {user} {totalQuestions} {isQuestionLive} />
			{/each}
		{/if}
	</div>
</aside>

<style>
	.sidebar { width: 300px; background: white; color: #1e293b; display: flex; flex-direction: column; border-left: 1px solid #e2e8f0; }
	.sidebar-header { padding: 1.25rem; background: #fff; border-bottom: 1px solid #f1f5f9; }
	.sidebar-header h2 { margin: 0; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: 800; }

	.users-list { flex: 1; overflow-y: auto; padding: 1rem; display: flex; flex-direction: column; gap: 0.75rem; }
	.empty-users { text-align: center; color: #94a3b8; font-size: 0.8rem; margin-top: 2rem; }

	@media (max-width: 1400px) {
		.sidebar { width: 260px; }
	}
</style>
