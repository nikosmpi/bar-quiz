<script>
	import { authClient } from '$lib/auth-client';
	import UserAvatar from './UserAvatar.svelte';
	import { page } from '$app/stores';

	let isOpen = $state(false);
	const session = authClient.useSession();

	function toggleMenu() {
		isOpen = !isOpen;
	}

	async function logout() {
		await authClient.signOut();
		window.location.href = '/login';
	}

	let isDisplayPage = $derived($page.url.pathname === '/display');
</script>

{#if !isDisplayPage}
	<button class="burger" onclick={toggleMenu} aria-label="Toggle menu" class:active={isOpen}>
		<span class="line"></span>
		<span class="line"></span>
		<span class="line"></span>
	</button>

	{#if isOpen}
		<div class="menu-overlay" onclick={toggleMenu} aria-hidden="true"></div>
		<div class="menu-content" class:open={isOpen}>
			{#if $session.data}
				<div class="user-header">
					<UserAvatar user={$session.data.user} size="48px" />
					<div class="user-greeting">
						<span class="welcome">Καλώς ήρθες,</span>
						<span class="username">{$session.data.user.username || $session.data.user.name}</span>
					</div>
				</div>
				<hr />
			{/if}
			<ul class="menu-links">
				{#if $session.data}
					<li><a href="/profile" onclick={toggleMenu}>Προφίλ</a></li>
					
					{#if $session.data.user.role === 'player'}
						<li><a href="/controler" onclick={toggleMenu}>Controller</a></li>
					{/if}

					{#if $session.data.user.role === 'admin' || $session.data.user.role === 'quizmaster'}
						<li><a href="/quizmaster" onclick={toggleMenu}>Quizmaster Dashboard</a></li>
						
						{#if $page.data.activeQuizId}
							<li><a href="/game-control" onclick={toggleMenu}>Game Control</a></li>
						{/if}
						
						<li><a href="/display" onclick={toggleMenu}>Display</a></li>
					{/if}

					{#if $session.data.user.role === 'admin'}
						<li><a href="/admin" onclick={toggleMenu}>Admin Panel</a></li>
					{/if}
					
					<li><button class="logout-btn" onclick={logout}>Αποσύνδεση</button></li>
				{:else}
					<li><a href="/login" onclick={toggleMenu}>Είσοδος</a></li>
				{/if}
			</ul>
		</div>
	{/if}
{/if}

<style>
	.burger {
		display: flex;
		flex-direction: column;
		justify-content: space-around;
		width: 2rem;
		height: 2rem;
		background: transparent;
		border: none;
		cursor: pointer;
		padding: 0;
		z-index: 110;
		position: fixed;
		top: 1.5rem;
		right: 1.5rem;
	}

	.line {
		width: 2rem;
		height: 0.25rem;
		background: #333;
		border-radius: 10px;
		transition: all 0.3s linear;
		position: relative;
		transform-origin: 1px;
	}

	.burger.active .line {
		background: #333;
	}

	.burger.active .line:nth-child(1) {
		transform: rotate(45deg);
	}

	.burger.active .line:nth-child(2) {
		opacity: 0;
		transform: translateX(20px);
	}

	.burger.active .line:nth-child(3) {
		transform: rotate(-45deg);
	}

	.menu-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background: rgba(0, 0, 0, 0.5);
		z-index: 99;
	}

	.menu-content {
		position: fixed;
		top: 0;
		right: 0;
		width: 250px;
		height: 100vh;
		background: white;
		color: #333;
		box-shadow: -2px 0 5px rgba(0, 0, 0, 0.2);
		z-index: 100;
		padding: 4rem 2rem 2rem;
		transition: transform 0.3s ease-in-out;
		transform: translateX(100%);
	}

	.menu-content.open {
		transform: translateX(0);
	}

	.user-greeting {
		display: flex;
		flex-direction: column;
	}

	.user-header {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.welcome {
		font-size: 0.85rem;
		color: #6b7280;
	}

	.username {
		font-size: 1.25rem;
		font-weight: bold;
		color: #111827;
	}

	hr {
		border: 0;
		border-top: 1px solid #f3f4f6;
		margin: 1rem 0;
	}

	.menu-links {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.menu-links li {
		margin-bottom: 1.5rem;
	}

	.menu-links a {
		color: #333;
		text-decoration: none;
		font-size: 1.2rem;
		transition: color 0.2s;
	}

	.menu-links a:hover {
		color: #007bff;
	}

	.logout-btn {
		background: none;
		border: none;
		color: #dc3545;
		font-size: 1.2rem;
		padding: 0;
		cursor: pointer;
		font-family: inherit;
	}

	.logout-btn:hover {
		text-decoration: underline;
	}
</style>
