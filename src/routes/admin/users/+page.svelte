<script>
	import { enhance } from '$app/forms';
	import UserAvatar from '$lib/components/UserAvatar.svelte';
	let { data, form } = $props();
	
	let users = $state(data.users);
	let loadingId = $state(null);

	$effect(() => {
		users = data.users;
	});
</script>

<div class="admin-container">
	<h1>Διαχείριση Χρηστών</h1>

	<div class="registration-toggle">
		<div class="toggle-info">
			<h3>Εγγραφή Νέων Χρηστών</h3>
			<p>Όταν είναι απενεργοποιημένη, μόνο οι υπάρχοντες χρήστες μπορούν να συνδεθούν.</p>
		</div>
		<form method="POST" action="?/toggleRegistration" use:enhance>
			<input type="hidden" name="enabled" value={data.registrationEnabled ? 'false' : 'true'} />
			<button type="submit" class="toggle-btn" class:enabled={data.registrationEnabled}>
				{data.registrationEnabled ? 'ΕΝΕΡΓΟΠΟΙΗΜΕΝΗ' : 'ΑΠΕΝΕΡΓΟΠΟΙΗΜΕΝΗ'}
			</button>
		</form>
	</div>

	{#if form?.message}
		<p class="message {form.success ? 'success' : 'error'}">{form.message || (form.success ? 'Η αλλαγή ολοκληρώθηκε!' : '')}</p>
	{/if}

	<div class="table-container">
		<table>
			<thead>
				<tr>
					<th>Avatar</th>
					<th>Email / Username</th>
					<th>Τρέχων Ρόλος</th>
					<th>Αλλαγή Ρόλου</th>
					<th>Ενέργειες</th>
				</tr>
			</thead>
			<tbody>
				{#each users as u}
					<tr>
						<td>
							<UserAvatar user={u} size="40px" />
						</td>
						<td>
							<div class="user-info">
								<span class="email">{u.email}</span>
								{#if u.username}
									<span class="username">(@{u.username})</span>
								{/if}
							</div>
						</td>
						<td>
							<span class="badge {u.role}">{u.role}</span>
						</td>
						<td>
							<form 
								method="POST" 
								action="?/updateRole" 
								use:enhance={() => {
									loadingId = u.id;
									return async ({ update }) => {
										await update();
										loadingId = null;
									};
								}}
								class="role-form"
							>
								<input type="hidden" name="userId" value={u.id} />
								<select name="role" value={u.role}>
									<option value="player">Player</option>
									<option value="gamemaster">Gamemaster</option>
									<option value="admin">Admin</option>
									<option value="ban">Ban</option>
								</select>
								<button type="submit" disabled={loadingId === u.id}>
									{loadingId === u.id ? '...' : 'Αλλαγή'}
								</button>
							</form>
						</td>
						<td>
							<form 
								method="POST" 
								action="?/deleteUser" 
								use:enhance={() => {
									if (!confirm(`Είστε σίγουροι ότι θέλετε να διαγράψετε τον χρήστη ${u.email};`)) return;
									loadingId = u.id;
									return async ({ update }) => {
										await update();
										loadingId = null;
									};
								}}
							>
								<input type="hidden" name="userId" value={u.id} />
								<button 
									type="submit" 
									class="delete-btn" 
									disabled={u.role === 'admin' || loadingId === u.id}
								>
									Διαγραφή
								</button>
							</form>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<style>
	.admin-container {
		max-width: 1000px;
		margin: 0 auto;
		padding: 2rem 1rem;
	}

	h1 {
		color: #111827;
		margin-bottom: 2rem;
		text-align: center;
	}

	.registration-toggle {
		background: white;
		padding: 1.5rem;
		border-radius: 8px;
		box-shadow: 0 4px 6px rgba(0,0,0,0.05);
		border: 1px solid #e5e7eb;
		margin-bottom: 2rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.toggle-info h3 {
		margin: 0 0 0.25rem 0;
		color: #111827;
	}

	.toggle-info p {
		margin: 0;
		color: #6b7280;
		font-size: 0.9rem;
	}

	.toggle-btn {
		min-width: 180px;
		padding: 0.75rem 1.5rem;
		border-radius: 6px;
		font-weight: 700;
		background: #ef4444;
		color: white;
		border: none;
		cursor: pointer;
		transition: all 0.2s;
	}

	.toggle-btn.enabled {
		background: #10b981;
	}

	.toggle-btn:hover {
		filter: brightness(0.9);
	}

	.table-container {
		background: white;
		border-radius: 8px;
		box-shadow: 0 4px 6px rgba(0,0,0,0.05);
		overflow-x: auto;
		border: 1px solid #e5e7eb;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		text-align: left;
	}

	th {
		background: #f9fafb;
		padding: 1rem;
		font-weight: 600;
		color: #4b5563;
		border-bottom: 2px solid #f3f4f6;
	}

	td {
		padding: 1rem;
		border-bottom: 1px solid #f3f4f6;
		vertical-align: middle;
	}

	.user-info {
		display: flex;
		flex-direction: column;
	}

	.email {
		font-weight: 500;
		color: #111827;
	}

	.username {
		font-size: 0.85rem;
		color: #6b7280;
	}

	.badge {
		padding: 0.25rem 0.75rem;
		border-radius: 9999px;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
	}

	.badge.admin { background: #fee2e2; color: #dc2626; }
	.badge.quizmaster { background: #fef3c7; color: #d97706; }
	.badge.player { background: #dcfce7; color: #16a34a; }
	.badge.ban { background: #111827; color: white; }

	.role-form {
		display: flex;
		gap: 0.5rem;
	}

	select {
		padding: 0.4rem;
		border: 1px solid #d1d5db;
		border-radius: 4px;
		background: white;
		font-size: 0.9rem;
	}

	button {
		padding: 0.4rem 0.8rem;
		background: #007bff;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-size: 0.85rem;
		font-weight: 600;
		transition: background 0.2s;
	}

	button:hover:not(:disabled) {
		background: #0056b3;
	}

	button:disabled {
		background: #9ca3af;
		cursor: not-allowed;
	}

	.delete-btn {
		padding: 0.4rem 0.8rem;
		background: #ef4444;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-size: 0.85rem;
		font-weight: 600;
		transition: background 0.2s;
	}

	.delete-btn:hover:not(:disabled) {
		background: #dc2626;
	}

	.delete-btn:disabled {
		background: #f3f4f6;
		color: #9ca3af;
		border: 1px solid #e5e7eb;
		cursor: not-allowed;
	}

	.message {
		padding: 1rem;
		border-radius: 6px;
		margin-bottom: 1.5rem;
		text-align: center;
	}

	.message.success { background: #d1fae5; color: #065f46; }
	.message.error { background: #fee2e2; color: #991b1b; }
</style>
