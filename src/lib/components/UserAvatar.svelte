<script>
	let { user, size = '48px', imageUrl = null } = $props();
	let imageError = $state(false);
	
	const currentImage = $derived(imageUrl !== null ? imageUrl : user?.image);

	$effect(() => {
		// Reset error if user or imageUrl changes
		const key = user?.id || imageUrl;
		if (key) {
			imageError = false;
		}
	});
</script>

{#if currentImage && !imageError}
	<img
		src={currentImage}
		alt={user?.name || 'User'}
		class="avatar"
		style="width: {size}; height: {size};"
		onerror={() => (imageError = true)}
	/>
{:else}
	<div class="avatar-placeholder" style="width: {size}; height: {size}; font-size: calc({size} * 0.4);">
		{(user?.name || user?.username || 'U').charAt(0).toUpperCase()}
	</div>
{/if}

<style>
	.avatar, .avatar-placeholder {
		border-radius: 50%;
		object-fit: cover;
		background: #007bff;
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: bold;
		flex-shrink: 0;
	}
</style>
