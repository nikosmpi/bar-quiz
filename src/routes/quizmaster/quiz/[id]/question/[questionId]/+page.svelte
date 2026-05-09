<script>
	import { enhance } from '$app/forms';
	import Button from '$lib/components/Button.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import Card from '$lib/components/Card.svelte';
	import MediaField from '$lib/components/MediaField.svelte';
	import { untrack } from 'svelte';
	
	let { data, form } = $props();

	let loading = $state(false);
	let message = $state(null);

	// Local state for all fields to ensure stability during updates
	let qText = $state(data.question.text);
	let qExplanation = $state(data.question.explanation || '');
	let qTemplate = $state(data.question.template || 'standard');
	let qPoints = $state(data.question.points);
	let qTimeLimit = $state(data.question.timeLimit);
	let mediaType = $state(data.question.mediaType || 'none');
	let mediaUrl = $state(data.question.mediaUrl || '');
	let localOptions = $state(data.options.map(o => ({ ...o })));

	let isCard = $derived(data.question.type === 'card');

	// Visibility logic based on template
	let showExplanation = $derived(
		qTemplate === 'question_standard' || 
		qTemplate === 'card_title_text' || 
		qTemplate === 'card_split_media'
	);
	
	let showMedia = $derived(
		qTemplate === 'question_standard' || 
		qTemplate === 'card_full_media' || 
		qTemplate === 'card_split_media'
	);

	// Sync local state when server data changes (after update())
	$effect(() => {
		if (loading) return;
		
		const remoteQuestion = data.question;
		const remoteOptions = data.options;

		untrack(() => {
			qText = remoteQuestion.text;
			qExplanation = remoteQuestion.explanation || '';
			qTemplate = remoteQuestion.template || 'standard';
			qPoints = remoteQuestion.points;
			qTimeLimit = remoteQuestion.timeLimit;
			mediaType = remoteQuestion.mediaType || 'none';
			mediaUrl = remoteQuestion.mediaUrl || '';
			localOptions = remoteOptions.map(o => ({ ...o }));
		});
	});

	$effect(() => {
		if (form?.success) {
			message = { type: 'success', text: 'Αλλαγές αποθηκεύτηκαν!' };
			setTimeout(() => message = null, 3000);
		}
	});

	const cardTemplates = [
		{ id: 'card_title_text', label: 'Τίτλος & Κείμενο', icon: '📝' },
		{ id: 'card_full_media', label: 'Full Screen Media', icon: '🖼️' },
		{ id: 'card_split_media', label: 'Media & Κείμενο (Split)', icon: '🌓' }
	];

	const questionTemplates = [
		{ id: 'question_standard', label: 'Standard Ερώτηση', icon: '❓' }
	];

	let availableTemplates = $derived(isCard ? cardTemplates : questionTemplates);
</script>

<div class="edit-question-page">
	<header>
		<a href="/quizmaster/quiz/{data.quiz.id}" class="back-link">← Επιστροφή στο Quiz: {data.quiz.name}</a>
		<h1>Επεξεργασία {isCard ? 'Κάρτας' : 'Ερώτησης'}</h1>
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
		<input type="hidden" name="template" value={qTemplate} />

		<section class="template-selector-section">
			<h3>Επιλογή Layout</h3>
			<div class="template-grid">
				{#each availableTemplates as t}
					<button 
						type="button" 
						class="template-btn" 
						class:active={qTemplate === t.id}
						onclick={() => qTemplate = t.id}
					>
						<span class="icon">{t.icon}</span>
						<span class="label">{t.label}</span>
					</button>
				{/each}
			</div>
		</section>

		<Card class="main-card">
			<div class="field">
				<label for="q-text">{isCard ? 'Τίτλος Κάρτας' : 'Κείμενο Ερώτησης'}</label>
				<input type="text" id="q-text" name="text" bind:value={qText} required placeholder={isCard ? 'π.χ. Καλώς ήρθατε στο Quiz' : 'π.χ. Ποια είναι η πρωτεύουσα της Γαλλίας;'} />
			</div>

			{#if showExplanation}
				<div class="field">
					<label for="q-explanation">{isCard ? 'Περιεχόμενο Κάρτας' : 'Επεξηγηματικό Κείμενο (Προαιρετικό)'}</label>
					<textarea id="q-explanation" name="explanation" rows={isCard ? 6 : 3} bind:value={qExplanation} placeholder={isCard ? 'Γράψτε εδώ το κείμενο που θα εμφανίζεται στην κάρτα...' : 'Επιπλέον πληροφορίες ή εισαγωγή για την ερώτηση...'}></textarea>
				</div>
			{/if}

			{#if !isCard}
				<div class="meta-grid">
					<div class="field">
						<label for="q-points">Πόντοι</label>
						<input type="number" id="q-points" name="points" bind:value={qPoints} min="1" />
					</div>
					<div class="field">
						<label for="q-time">Χρόνος (sec)</label>
						<input type="number" id="q-time" name="timeLimit" bind:value={qTimeLimit} min="5" />
					</div>
				</div>
			{/if}
		</Card>

		{#if showMedia}
			<Card title="Πολυμέσα (Προαιρετικό)" class="media-card">
				<MediaField 
					bind:mediaType={mediaType} 
					bind:mediaUrl={mediaUrl} 
					originalUrl={data.question.mediaUrl}
				/>
			</Card>
		{/if}

		{#if !isCard}
			<Card title="Επιλογές Απάντησης" class="options-card">
				<div class="options-list">
					{#each localOptions as opt, i (opt.id)}
						<div class="option-row" class:is-correct={opt.isCorrect}>
							<div class="radio-wrapper">
								<input 
									type="radio" 
									name="correctOption" 
									value={opt.id} 
									checked={opt.isCorrect} 
									onchange={() => {
										localOptions.forEach((o, idx) => o.isCorrect = (idx === i));
									}}
									required 
								/>
							</div>
							<div class="input-wrapper">
								<input type="hidden" name="optionId" value={opt.id} />
								<input type="text" name="optionText" bind:value={localOptions[i].text} required />
							</div>
						</div>
					{/each}
				</div>
			</Card>
		{/if}

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

	.template-selector-section { margin-bottom: 0.5rem; }
	.template-selector-section h3 { font-size: 0.9rem; color: #4b5563; margin-bottom: 0.75rem; }
	
	.template-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
		gap: 0.75rem;
	}

	.template-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 1rem;
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 12px;
		cursor: pointer;
		transition: all 0.2s;
		gap: 0.5rem;
	}

	.template-btn:hover { border-color: #2563eb; background: #eff6ff; }
	.template-btn.active { border-color: #2563eb; background: #eff6ff; box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2); }
	
	.template-btn .icon { font-size: 1.5rem; }
	.template-btn .label { font-size: 0.8rem; font-weight: 600; color: #1f2937; }

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
