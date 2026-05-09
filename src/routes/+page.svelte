<script>
	let { data } = $props();
</script>

<div class="home-container">
	<section class="hero">
		<h1>{data.homeTitle}</h1>
		<p class="subtitle">{data.homeSubtitle}</p>
	</section>

	{#if data.activeQuizId && !data.user}
		<div class="cta-section">
			<Button href="/login" variant="primary" size="large">
				Συνδεθείτε για να παίξετε!
			</Button>
		</div>
	{/if}

	{#if data.user && (data.user.role === 'admin' || data.user.role === 'quizmaster')}
		<div class="admin-quick-links">
			<a href="/quizmaster" class="quick-link">Dashboard</a>
			<a href="/display" class="quick-link">Display</a>
		</div>
	{/if}
</div>

<style>
	.home-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 4rem 1rem;
		min-height: 80vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 2rem;
	}

	.hero {
		text-align: center;
	}

	h1 {
		font-size: 3.5rem;
		color: #111827;
		margin: 0 0 1rem;
		font-weight: 800;
		line-height: 1.2;
	}

	.subtitle {
		font-size: 1.5rem;
		color: #4b5563;
		max-width: 600px;
		margin: 0 auto;
	}

	.cta-section {
		margin-top: 1rem;
	}

	.admin-quick-links {
		position: fixed;
		bottom: 2rem;
		left: 2rem;
		display: flex;
		gap: 1rem;
	}

	.quick-link {
		background: rgba(255, 255, 255, 0.9);
		padding: 0.5rem 1rem;
		border-radius: 8px;
		text-decoration: none;
		color: #374151;
		font-size: 0.8rem;
		font-weight: 600;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
		border: 1px solid #e5e7eb;
		transition: all 0.2s;
	}

	.quick-link:hover {
		background: white;
		transform: translateY(-2px);
		box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
	}

	@media (max-width: 768px) {
		h1 {
			font-size: 2.5rem;
		}
		
		.subtitle {
			font-size: 1.2rem;
		}
	}
</style>
