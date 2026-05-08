<script>
	import { enhance } from '$app/forms';
	import Button from '$lib/components/Button.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import Card from '$lib/components/Card.svelte';
	import MediaField from '$lib/components/MediaField.svelte';
	
	let { data, form } = $props();

	let loading = $state(false);
	let message = $state(null);

	// Local state for media
	let mediaType = $state('none');
	let mediaUrl = $state('');

	$effect(() => {
		mediaType = data.question.mediaType || 'none';
		mediaUrl = data.question.mediaUrl || '';
	});

	$effect(() => {
		if (form?.success) {
			message = { type: 'success', text: 'Αλλαγές αποθηκεύτηκαν!' };
			setTimeout(() => message = null, 3000);
		}
	});
</script>

<div class="edit-question-page">
	<header>
		<a href="/quizmaster/quiz/{data.quiz.id}" class="back-link">← Επιστροφή στο Quiz: {data.quiz.name}</a>
		<h1>Επεξεργασία Ερώτησης</h1>
	</header>

	<form method="POST" action="?/updateQuestion" use:enhance={() => {
		loading = true;
		return async ({ update }) => {
			await update();
			loading = false;
		};
	}} class="edit-form">
		<input type="hidden" name="mediaType" value={mediaType} />
		<input type="hidden" name="mediaUrl" value={mediaUrl} />

		<Card class="main-card">
			<div class="field">
				<label for="q-text">Κείμενο Ερώτησης</label>
				<textarea id="q-text" name="text" rows="3" value={data.question.text} required></textarea>
			</div>

			<div class="meta-grid">
				<div class="field">
					<label for="q-points">Πόντοι</label>
					<input type="number" id="q-points" name="points" value={data.question.points} min="1" />
				</div>
				<div class="field">
					<label for="q-time">Χρόνος (sec)</label>
					<input type="number" id="q-time" name="timeLimit" value={data.question.timeLimit} min="5" />
				</div>
			</div>
		</Card>

		<Card title="Πολυμέσα (Προαιρετικό)" class="media-card">
			<MediaField 
				bind:mediaType={mediaType} 
				bind:mediaUrl={mediaUrl} 
				originalUrl={data.question.mediaUrl}
			/>
		</Card>

		<Card title="Επιλογές Απάντησης" class="options-card">
			<div class="options-list">
				{#each data.options as opt}
					<div class="option-row" class:is-correct={opt.isCorrect}>
						<div class="radio-wrapper">
							<input type="radio" name="correctOption" value={opt.id} checked={opt.isCorrect} required />
						</div>
						<div class="input-wrapper">
							<input type="hidden" name="optionId" value={opt.id} />
							<input type="text" name="optionText" value={opt.text} required />
						</div>
					</div>
				{/each}
			</div>
		</Card>

		<div class="sticky-actions">
			{#if message}
				<span class="status-msg {message.type}">{message.text}</span>
			{/if}
			<Button type="submit" loading={loading} style="border-radius: 9999px; padding-left: 2rem; padding-right: 2rem;">
				Αποθήκευση Αλλαγών
			</Button>
		</div>
	</form>
</div>

<style>
	.edit-question-page {
		max-width: 700px;
		margin: 0 auto;
		padding: 1rem;
	}

	header { margin-bottom: 2rem; }
	.back-link { color: #2563eb; text-decoration: none; font-size: 0.9rem; display: inline-block; margin-bottom: 0.5rem; }
	h1 { margin: 0; font-size: 1.8rem; color: #111827; }

	.edit-form { display: flex; flex-direction: column; gap: 1.5rem; padding-bottom: 6rem; }

	.field { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem; }
	.field label { font-weight: 600; font-size: 0.9rem; color: #4b5563; }
	textarea, input[type="text"], input[type="number"] { padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; font-family: inherit; font-size: 1rem; }

	.meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

	.options-list { display: flex; flex-direction: column; gap: 0.75rem; }
	.option-row { display: flex; gap: 1rem; align-items: center; padding: 0.75rem; border: 1px solid #e5e7eb; border-radius: 8px; }
	.option-row.is-correct { border-color: #10b981; background: #f0fdf4; }
	.input-wrapper { flex: 1; }
	.input-wrapper input { width: 100%; border: 1px solid #d1d5db; padding: 0.5rem; border-radius: 4px; }

	.sticky-actions {
		position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%);
		background: white; padding: 0.5rem 1.5rem; border-radius: 9999px;
		box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
		display: flex; align-items: center; gap: 1.5rem; border: 1px solid #e5e7eb; z-index: 100;
	}

	.status-msg { font-size: 0.9rem; font-weight: 600; }
	.status-msg.success { color: #059669; }
</style>
