<script>
	import { authClient } from '$lib/auth-client';
	import UserAvatar from '$lib/components/UserAvatar.svelte';
	import Button from '$lib/components/Button.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import Badge from '$lib/components/Badge.svelte';
	import Card from '$lib/components/Card.svelte';
	
	let { data } = $props();
	
	let username = $state("");
	let image = $state("");
	let loading = $state(false);
	let message = $state({ type: '', text: '' });
	let fileInput;

	$effect(() => {
		username = data.user.username || '';
		image = data.user.image || '';
	});

	async function deleteFile(url) {
		if (!url || !url.startsWith('/uploads/')) return;
		try {
			await fetch('/api/upload', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ url })
			});
		} catch (err) {
			console.error('Failed to delete old file:', err);
		}
	}

	async function updateProfile() {
		loading = true;
		message = { type: '', text: '' };
		
		const oldImage = data.user.image;
		const { error } = await authClient.updateUser({
			username: username,
			image: image
		});

		if (error) {
			message = { type: 'error', text: error.message || 'Αποτυχία ενημέρωσης προφίλ.' };
		} else {
			message = { type: 'success', text: 'Το προφίλ ενημερώθηκε επιτυχώς!' };
			if (oldImage && oldImage !== image) {
				await deleteFile(oldImage);
			}
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
				throw new Error(err.error || err.message || 'Αποτυχία ανεβάσματος εικόνας');
			}

			const result = await response.json();
			
			if (image && image !== data.user.image) {
				await deleteFile(image);
			}

			image = result.url;
			message = { type: 'success', text: 'Η εικόνα ανέβηκε! Πατήστε "Αποθήκευση" για οριστικοποίηση.' };
		} catch (err) {
			message = { type: 'error', text: err.message };
		} finally {
			loading = false;
		}
	}

	function removeImage() {
		if (image && image !== data.user.image) {
			deleteFile(image);
		}
		image = '';
		message = { type: 'success', text: 'Η εικόνα αφαιρέθηκε. Πατήστε "Αποθήκευση" για οριστικοποίηση.' };
	}
</script>

<div class="profile-container">
	<Card class="profile-card">
		<div class="header">
			<div class="avatar-section">
				<div class="avatar-container" onclick={() => fileInput.click()} aria-hidden="true">
					<UserAvatar user={data.user} imageUrl={image} size="120px" />
					<div class="avatar-overlay">
						<span>Αλλαγή</span>
					</div>
				</div>
				{#if image}
					<button type="button" class="remove-image-btn" onclick={removeImage} title="Διαγραφή εικόνας">
						✕
					</button>
				{/if}
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
			<Alert type={message.type} message={message.text} />
		{/if}

		<div class="info-grid">
			<form onsubmit={(e) => { e.preventDefault(); updateProfile(); }} class="update-form">
				<div class="info-item">
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
					<span class="value">{data.user.email}</span>
				</div>
				
				<div class="info-item">
					<span class="label">Ρόλος:</span>
					<Badge variant={data.user.role}>{data.user.role}</Badge>
				</div>

				<div class="button-container">
					<Button type="submit" {loading} class="btn-full">
						Αποθήκευση Αλλαγών
					</Button>
				</div>
			</form>
		</div>
	</Card>
</div>

<style>
	.profile-container {
		display: flex;
		justify-content: center;
		padding: 2rem 1rem;
	}

	:global(.profile-card) {
		max-width: 500px !important;
	}

	.header {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 2rem;
		text-align: center;
	}

	.avatar-section {
		position: relative;
		margin-bottom: 1rem;
	}

	.avatar-container {
		position: relative;
		width: 120px;
		height: 120px;
		cursor: pointer;
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

	.remove-image-btn {
		position: absolute;
		top: -5px;
		right: -5px;
		background: #ef4444;
		color: white;
		border: 2px solid white;
		border-radius: 50%;
		width: 28px;
		height: 28px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		font-size: 0.8rem;
		font-weight: bold;
		box-shadow: 0 2px 4px rgba(0,0,0,0.2);
		transition: transform 0.2s, background 0.2s;
		z-index: 10;
	}

	.remove-image-btn:hover {
		background: #dc2626;
		transform: scale(1.1);
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
		outline: 2px solid #2563eb;
		border-color: transparent;
	}

	.button-container {
		margin-top: 2rem;
		display: flex;
		justify-content: center;
	}
</style>
