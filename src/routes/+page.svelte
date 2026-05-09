<script>
	let { data } = $props();
</script>

<div class="home-container">
	<section class="hero">
		<h1>{data.homeTitle}</h1>
		<p class="subtitle">{data.homeSubtitle}</p>
	</section>
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
	}

	.hero {
		text-align: center;
		margin-bottom: 3rem;
	}

	h1 {
		font-size: 3.5rem;
		color: #111827;
		margin-bottom: 1rem;
		font-weight: 800;
		line-height: 1.2;
	}

	.subtitle {
		font-size: 1.5rem;
		color: #4b5563;
		max-width: 600px;
		margin: 0 auto;
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
