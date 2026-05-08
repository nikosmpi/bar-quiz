<script>
	import { authClient } from '$lib/auth-client';
	import { goto } from '$app/navigation';
	import Button from '$lib/components/Button.svelte';
	import Alert from '$lib/components/Alert.svelte';

	let email = $state('');
	let otp = $state('');
	let step = $state('email'); // 'email' or 'otp'
	let loading = $state(false);
	let error = $state('');
	let message = $state('');

	async function sendOTP() {
		loading = true;
		error = '';
		message = '';
		
		const { error: authError } = await authClient.emailOtp.sendVerificationOtp({
			email,
			type: 'sign-in'
		});

		if (authError) {
			error = authError.message || 'Αποτυχία αποστολής OTP. Βεβαιωθείτε ότι το email είναι σωστό.';
		} else {
			message = 'Ο κωδικός στάλθηκε στο email σας.';
			step = 'otp';
		}
		loading = false;
	}

	async function verifyOTP() {
		loading = true;
		error = '';
		
		const { error: authError } = await authClient.signIn.emailOtp({
			email,
			otp,
			callbackURL: '/'
		});

		if (authError) {
			error = authError.message || 'Λάθος κωδικός ή το OTP έληξε.';
		} else {
			goto('/');
		}
		loading = false;
	}
</script>

<div class="login-container">
	<div class="login-card">
		<h1>Είσοδος</h1>
		
		{#if error}
			<Alert type="error" message={error} />
		{/if}
		
		{#if message}
			<Alert type="success" message={message} />
		{/if}

		{#if step === 'email'}
			<form onsubmit={(e) => { e.preventDefault(); sendOTP(); }}>
				<div class="form-group">
					<label for="email">Email</label>
					<input 
						type="email" 
						id="email" 
						bind:value={email} 
						placeholder="π.χ. user@example.com" 
						required 
					/>
				</div>
				<Button type="submit" {loading} class="btn-full">
					Αποστολή Κωδικού
				</Button>
			</form>
		{:else}
			<form onsubmit={(e) => { e.preventDefault(); verifyOTP(); }}>
				<div class="form-group">
					<p>Εισάγετε τον κωδικό που λάβατε στο <strong>{email}</strong></p>
					<label for="otp">Κωδικός OTP</label>
					<input 
						type="text" 
						id="otp" 
						bind:value={otp} 
						placeholder="6-ψήφιος κωδικός" 
						required 
					/>
				</div>
				<Button type="submit" {loading} class="btn-full">
					Είσοδος
				</Button>
				<Button variant="link" onclick={() => step = 'email'} class="btn-full" style="margin-top: 1rem;">
					Αλλαγή Email
				</Button>
			</form>
		{/if}
	</div>
</div>

<style>
	.login-container {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 80vh;
		padding: 1rem;
	}

	.login-card {
		background: white;
		padding: 2rem;
		border-radius: 8px;
		box-shadow: 0 4px 6px rgba(0,0,0,0.1);
		width: 100%;
		max-width: 400px;
		border: 1px solid #ddd;
	}

	h1 {
		margin-top: 0;
		text-align: center;
		color: #333;
	}

	.form-group {
		margin-bottom: 1.5rem;
	}

	label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: bold;
		color: #555;
	}

	input {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #ccc;
		border-radius: 4px;
		box-sizing: border-box;
	}
</style>
