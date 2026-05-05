<script>
	import { authClient } from '$lib/auth-client';
	import UserAvatar from '$lib/components/UserAvatar.svelte';
	
	let { data } = $props();
	const user = data.user;
	
	let username = $state(user.username || '');
	let image = $state(user.image || '');
	let loading = $state(false);
	let message = $state({ type: '', text: '' });
	let fileInput;

	async function updateProfile() {
		loading = true;
		message = { type: '', text: '' };
		
		const { error } = await authClient.updateUser({
			username: username,
			image: image
		});

		if (error) {
			message = { type: 'error', text: error.message || 'Αποτυχία ενημέρωσης προφίλ.' };
		} else {
			message = { type: 'success', text: 'Το προφίλ ενημερώθηκε επιτυχώς!' };
		}
		loading = false;
	}

	async function handleImageUpload(e) {
		const file = e.target.files[0];
		if (!file) return;

		loading = true;
		const formData = new FormData();
		formData.append('image', file);

		try {
			const response = await fetch('/api/upload', {
				method: 'POST',
				body: formData
			});

			if (!response.ok) {
				const err = await response.json();
				throw new Error(err.message || 'Αποτυχία ανεβάσματος εικόνας');
			}

			const result = await response.json();
			image = result.url;
			message = { type: 'success', text: 'Η εικόνα ανέβηκε! Πατήστε "Αποθήκευση" για οριστικοποίηση.' };
		} catch (err) {
			message = { type: 'error', text: err.message };
		} finally {
			loading = false;
		}
	}
</script>

<div class="profile-container">
	<div class="profile-card">
		<div class="header">
			<div class="avatar-container" onclick={() => fileInput.click()} aria-hidden="true">
				<UserAvatar user={user} imageUrl={image} size="120px" />
				<div class="avatar-overlay">
					<span>Αλλαγή</span>
				</div>
			</div>
			<input 
				type="file" 
				accept="image/*" 
				bind:this={fileInput} 
				onchange={handleImageUpload} 
				style="display: none;" 
			/>
			<h1>Το Προφίλ μου</h1>
		</div>

		{#if message.text}
			<p class="message {message.type}">{message.text}</p>
		{/if}

		<div class="info-grid">
			<form onsubmit={(e) => { e.preventDefault(); updateProfile(); }} class="update-form">
				<div class="info-item no-border">
					<span class="label">Username:</span>
					<input 
						type="text" 
						id="username" 
						bind:value={username} 
						placeholder="Ορίστε ένα username" 
						class="inline-input"
					/>
				</div>
				
				<div class="info-item">
					<span class="label">Email:</span>
					<span class="value">{user.email}</span>
				</div>
				
				<div class="info-item">
					<span class="label">Ρόλος:</span>
					<span class="value badge">{user.role}</span>
				</div>

				<div class="button-container">
					<button type="submit" class="submit-btn" disabled={loading}>
						{loading ? 'Ενημέρωση...' : 'Αποθήκευση Αλλαγών'}
					</button>
				</div>
			</form>
		</div>
	</div>
</div>

<style>
	.profile-container {
		display: flex;
		justify-content: center;
		padding: 2rem 1rem;
	}

	.profile-card {
		background: white;
		padding: 2.5rem;
		border-radius: 12px;
		box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
		width: 100%;
		max-width: 500px;
		border: 1px solid #e5e7eb;
	}

	.header {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 2rem;
		text-align: center;
	}

	.avatar-container {
		position: relative;
		width: 120px;
		height: 120px;
		cursor: pointer;
		margin-bottom: 1rem;
	}

	.avatar-overlay {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.4);
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		opacity: 0;
		transition: opacity 0.3s;
		font-weight: 600;
	}

	.avatar-container:hover .avatar-overlay {
		opacity: 1;
	}

	h1 {
		margin: 0;
		font-size: 1.75rem;
		color: #111827;
	}

	.info-grid {
		display: flex;
		flex-direction: column;
	}

	.info-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 0;
		border-bottom: 1px solid #f3f4f6;
	}

	.info-item.no-border {
		border-bottom: 1px solid #f3f4f6;
	}

	.label {
		font-weight: 600;
		color: #4b5563;
		min-width: 100px;
	}

	.value {
		color: #111827;
		text-align: right;
	}

	.inline-input {
		border: 1px solid #d1d5db;
		border-radius: 4px;
		padding: 0.4rem 0.6rem;
		font-size: 0.95rem;
		color: #111827;
		text-align: right;
		width: 100%;
		max-width: 200px;
	}

	.inline-input:focus {
		outline: 2px solid #007bff;
		border-color: transparent;
	}

	.button-container {
		margin-top: 2rem;
		display: flex;
		justify-content: center;
	}

	.submit-btn {
		width: 100%;
		padding: 0.75rem;
		background: #007bff;
		color: white;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		font-weight: 600;
		font-size: 1rem;
		transition: background 0.2s;
	}

	.submit-btn:hover:not(:disabled) {
		background: #0056b3;
	}

	.submit-btn:disabled {
		background: #9ca3af;
		cursor: not-allowed;
	}

	.badge {
		background: #ebf5ff;
		color: #007bff;
		padding: 0.25rem 0.75rem;
		border-radius: 9999px;
		font-size: 0.875rem;
		font-weight: 600;
		text-transform: capitalize;
	}

	.message {
		padding: 0.75rem;
		border-radius: 6px;
		margin-bottom: 1.5rem;
		font-size: 0.9rem;
		text-align: center;
	}

	.message.success {
		background: #d1fae5;
		color: #065f46;
	}

	.message.error {
		background: #fee2e2;
		color: #991b1b;
	}
</style>
