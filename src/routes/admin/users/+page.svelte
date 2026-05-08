<script>
	import { enhance } from '$app/forms';
	import UserAvatar from '$lib/components/UserAvatar.svelte';
	import Button from '$lib/components/Button.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import Badge from '$lib/components/Badge.svelte';
	import Card from '$lib/components/Card.svelte';
	
	let { data, form } = $props();
	
	let users = $derived(data.users);
	let loadingId = $state(null);
</script>

<div class="admin-container">
	<h1>Διαχείριση Χρηστών</h1>

	<Card class="registration-toggle">
		<div class="toggle-info">
			<h3>Εγγραφή Νέων Χρηστών</h3>
			<p>Όταν είναι απενεργοποιημένη, μόνο οι υπάρχοντες χρήστες μπορούν να συνδεθούν.</p>
		</div>
		<form method="POST" action="?/toggleRegistration" use:enhance>
			<input type="hidden" name="enabled" value={data.registrationEnabled ? 'false' : 'true'} />
			<Button 
				type="submit" 
				variant={data.registrationEnabled ? 'primary' : 'danger'} 
				style="min-width: 180px; background: {data.registrationEnabled ? '#10b981' : '#ef4444'};"
			>
				{data.registrationEnabled ? 'ΕΝΕΡΓΟΠΟΙΗΜΕΝΗ' : 'ΑΠΕΝΕΡΓΟΠΟΙΗΜΕΝΗ'}
			</Button>
		</form>
	</Card>

	{#if form?.message}
		<Alert type={form.success ? 'success' : 'error'} message={form.message} />
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
							<Badge variant={u.role}>{u.role}</Badge>
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
								<Button type="submit" loading={loadingId === u.id} style="padding: 0.4rem 0.8rem; font-size: 0.85rem;">
									Αλλαγή
								</Button>
							</form>
						</td>
						<td>
							<form 
								method="POST" 
								action="?/deleteUser" 
								use:enhance={() => {
									if (!confirm("Είστε σίγουροι ότι θέλετε να διαγράψετε τον χρήστη " + u.email + "?")) return;
									loadingId = u.id;
									return async ({ update }) => {
										await update();
										loadingId = null;
									};
								}}
							>
								<input type="hidden" name="userId" value={u.id} />
								<Button 
									type="submit" 
									variant="danger" 
									disabled={u.role === 'admin' || loadingId === u.id}
									style="padding: 0.4rem 0.8rem; font-size: 0.85rem;"
								>
									Διαγραφή
								</Button>
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

	:global(.registration-toggle) {
		margin-bottom: 2rem;
	}

	:global(.registration-toggle .card-body) {
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
</style>
