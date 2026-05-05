<script>
	const adminModules = [
		{
			title: 'Διαχείριση Χρηστών',
			description: 'Αλλαγή ρόλων, προβολή στοιχείων και διαχείριση χρηστών.',
			icon: '👥',
			href: '/admin/users'
		},
		// Εδώ μπορούν να προστεθούν μελλοντικά κουμπιά
		/*
		{
			title: 'Διαχείριση Κουίζ',
			description: 'Δημιουργία, επεξεργασία και διαγραφή ερωτήσεων.',
			icon: '📝',
			href: '/admin/quizzes'
		}
		*/
	];
</script>

<div class="admin-dashboard">
	<header>
		<h1>Admin Dashboard</h1>
		<p>Καλώς ήρθατε στο κέντρο ελέγχου. Επιλέξτε μια ενότητα για να ξεκινήσετε.</p>
	</header>

	<div class="grid">
		{#each adminModules as module}
			<a href={module.href} class="module-card">
				<div class="icon">{module.icon}</div>
				<div class="content">
					<h2>{module.title}</h2>
					<p>{module.description}</p>
				</div>
				<div class="arrow">→</div>
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

	.module-card {
		display: flex;
		align-items: center;
		padding: 1.5rem;
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 12px;
		text-decoration: none;
		color: inherit;
		transition: all 0.2s ease-in-out;
		box-shadow: 0 1px 3px rgba(0,0,0,0.05);
		position: relative;
	}

	.module-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
		border-color: #007bff;
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

	.content h2 {
		margin: 0 0 0.25rem 0;
		font-size: 1.25rem;
		color: #111827;
	}

	.content p {
		margin: 0;
		font-size: 0.95rem;
		color: #6b7280;
		line-height: 1.4;
	}

	.arrow {
		position: absolute;
		right: 1.5rem;
		font-size: 1.5rem;
		color: #d1d5db;
		transition: transform 0.2s;
	}

	.module-card:hover .arrow {
		transform: translateX(5px);
		color: #007bff;
	}
</style>
