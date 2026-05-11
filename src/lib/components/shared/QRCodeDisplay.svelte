<script>
	import { onMount } from 'svelte';
	import QRCode from 'qrcode';

	let { 
		url = "", 
		size = 300, 
		margin = 2,
		darkColor = '#000000',
		lightColor = '#ffffff',
		class: className = ""
	} = $props();

	let qrCodeDataUrl = $state('');

	onMount(async () => {
		if (url) {
			try {
				qrCodeDataUrl = await QRCode.toDataURL(url, {
					width: size,
					margin: margin,
					color: { dark: darkColor, light: lightColor }
				});
			} catch (err) {
				console.error('Failed to generate QR Code:', err);
			}
		}
	});
</script>

<div class="qr-code-container {className}">
	{#if qrCodeDataUrl}
		<img src={qrCodeDataUrl} alt="QR Code for {url}" />
	{:else}
		<div class="qr-placeholder" style="width: {size}px; height: {size}px;"></div>
	{/if}
</div>

<style>
	.qr-code-container {
		display: flex;
		justify-content: center;
		align-items: center;
		background: white;
		border-radius: 12px;
		overflow: hidden;
	}

	img {
		max-width: 100%;
		height: auto;
		display: block;
	}

	.qr-placeholder {
		background: #f1f5f9;
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
