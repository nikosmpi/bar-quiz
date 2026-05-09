<script>
	let { url, type, class: className = "" } = $props();

	function getYoutubeId(url) {
		if (!url) return null;
		const regExp = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/|live\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;
		const match = url.match(regExp);
		return (match && match[1].length === 11) ? match[1] : null;
	}

	let youtubeId = $derived(getYoutubeId(url));
	
	// Get current origin for YouTube API security
	let origin = "";
	if (typeof window !== 'undefined') {
		origin = window.location.origin;
	}
</script>

<div class="media-preview {className}">
	{#if type === 'image'}
		<img src={url} alt="Media Preview" />
	{:else if type === 'video' && youtubeId}
		<div class="youtube-container">
			<iframe 
				id="yt-player"
				width="100%" 
				height="100%" 
				src="https://www.youtube.com/embed/{youtubeId}?controls=0&enablejsapi=1&origin={encodeURIComponent(origin)}&widget_referrer={encodeURIComponent(origin)}" 
				title="YouTube video player" 
				frameborder="0" 
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
				allowfullscreen
			></iframe>
		</div>
	{:else if type === 'video_file' || (type === 'video' && url && url.endsWith('.mp4'))}
		<video width="100%" playsinline>
			<source src={url} type="video/mp4" />
			<track kind="captions" />
			Το πρόγραμμα περιήγησής σας δεν υποστηρίζει το βίντεο.
		</video>
	{:else}
		<div class="no-media">Δεν υπάρχει περιεχόμενο</div>
	{/if}
</div>

<style>
	.media-preview {
		width: 100%;
		border-radius: 8px;
		overflow: hidden;
		background: #f3f4f6;
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100px;
	}

	img {
		max-width: 100%;
		display: block;
	}

	.youtube-container {
		position: relative;
		width: 100%;
		padding-bottom: 56.25%; /* 16:9 */
		height: 0;
	}

	.youtube-container iframe {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}

	.no-media {
		color: #6b7280;
		font-style: italic;
		padding: 2rem;
	}
</style>
