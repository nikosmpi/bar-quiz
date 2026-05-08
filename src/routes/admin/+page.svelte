<script>
	import Card from '$lib/components/Card.svelte';

	const adminModules = [
		{
			title: 'Διαχείριση Χρηστών',
			description: 'Αλλαγή ρόλων, προβολή στοιχείων και διαχείριση χρηστών.',
			icon: '👥',
			href: '/admin/users'
		},
		{
			title: 'Εισαγωγική Σελίδα',
			description: 'Διαχείριση του περιεχομένου και των ρυθμίσεων της αρχικής σελίδας.',
			icon: '🏠',
			href: '/admin/intro-page'
		}
	];
</script>

<div class="admin-dashboard">
	<header>
		<h1>Admin Dashboard</h1>
		<p>Καλώς ήρθατε στο κέντρο ελέγχου. Επιλέξτε μια ενότητα για να ξεκινήσετε.</p>
	</header>

	<div class="grid">
		{#each adminModules as module}
			<a href={module.href} class="module-link">
				<Card class="module-card">
					<div class="card-content">
						<div class="icon">{module.icon}</div>
						<div class="text-content">
							<h2>{module.title}</h2>
							<p>{module.description}</p>
						</div>
						<div class="arrow">→</div>
					</div>
				</Card>
			</a>
		{/each}
	</div>
</div>

<style>
	.admin-dashboard {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem 1rem;
	}

	header {
		text-align: center;
		margin-bottom: 3rem;
	}

	h1 {
		font-size: 2.5rem;
		color: #111827;
		margin-bottom: 0.5rem;
	}

	header p {
		color: #6b7280;
		font-size: 1.1rem;
	}

	.grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1.5rem;
	}

	@media (min-width: 640px) {
		.grid {
			grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		}
	}

	.module-link {
		text-decoration: none;
		color: inherit;
	}

	:global(.module-card) {
		transition: all 0.2s ease-in-out !important;
		cursor: pointer;
	}

	:global(.module-card:hover) {
		transform: translateY(-4px);
		box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1) !important;
		border-color: #2563eb !important;
	}

	:global(.module-card .card-body) {
		padding: 1.5rem !important;
	}

	.card-content {
		display: flex;
		align-items: center;
		position: relative;
	}

	.icon {
		font-size: 2.5rem;
		margin-right: 1.5rem;
		background: #f3f4f6;
		width: 64px;
		height: 64px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 10px;
	}

	.text-content h2 {
		margin: 0 0 0.25rem 0;
		font-size: 1.25rem;
		color: #111827;
	}

	.text-content p {
		margin: 0;
		font-size: 0.95rem;
		color: #6b7280;
		line-height: 1.4;
	}

	.arrow {
		position: absolute;
		right: 0;
		font-size: 1.5rem;
		color: #d1d5db;
		transition: transform 0.2s;
	}

	.module-link:hover .arrow {
		transform: translateX(5px);
		color: #2563eb;
	}
</style>
