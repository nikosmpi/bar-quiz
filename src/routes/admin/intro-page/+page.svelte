<script>
	import { enhance } from '$app/forms';
	import Card from '$lib/components/Card.svelte';
	import Button from '$lib/components/Button.svelte';
	import MediaField from '$lib/components/MediaField.svelte';
	import { untrack } from 'svelte';

	let { data } = $props();
	let activeQuizLoading = $state(false);
	let homeContentLoading = $state(false);

	let selectedQuizId = $state(data.activeQuizId || "");
	let coverImageUrl = $state(data.activeQuiz?.coverImage || "");

	let homeTitle = $state(data.homeTitle);
	let homeSubtitle = $state(data.homeSubtitle);

	// Keep coverImageUrl in sync when the user selects a different quiz
	function handleQuizChange() {
		const quiz = data.quizzes.find(q => q.id === selectedQuizId);
		coverImageUrl = quiz?.coverImage || "";
	}

	// Update local state when server data changes
	$effect(() => {
		if (activeQuizLoading || homeContentLoading) return;

		const remoteId = data.activeQuizId || "";
		const remoteCover = data.activeQuiz?.coverImage || "";
		const remoteTitle = data.homeTitle;
		const remoteSubtitle = data.homeSubtitle;
		
		untrack(() => {
			selectedQuizId = remoteId;
			coverImageUrl = remoteCover;
			homeTitle = remoteTitle;
			homeSubtitle = remoteSubtitle;
		});
	});
</script>

<div class="intro-admin-container">
	<header>
		<a href="/admin" class="back-link">← Επιστροφή στο Dashboard</a>
		<h1>Διαχείριση Εισαγωγικής Σελίδας</h1>
	</header>

	<section class="home-content-section">
		<Card title="Περιεχόμενο Αρχικής Σελίδας">
			<form 
				method="POST" 
				action="?/updateHomeContent" 
				use:enhance={() => {
					homeContentLoading = true;
					return async ({ update }) => {
						await update();
						homeContentLoading = false;
					};
				}}
				class="home-content-form"
			>
				<div class="field">
					<label for="home-title">Κεντρικός Τίτλος</label>
					<input type="text" id="home-title" name="homeTitle" bind:value={homeTitle} disabled={homeContentLoading} />
				</div>
				<div class="field">
					<label for="home-subtitle">Υπότιτλος</label>
					<input type="text" id="home-subtitle" name="homeSubtitle" bind:value={homeSubtitle} disabled={homeContentLoading} />
				</div>
				<Button type="submit" loading={homeContentLoading}>
					Αποθήκευση Περιεχομένου
				</Button>
			</form>
		</Card>
	</section>
	
	<section class="active-quiz-section">
		<Card title="Ενεργό Quiz για Παίκτες">
			<form 
				method="POST" 
				action="?/setActiveQuiz" 
				use:enhance={() => {
					activeQuizLoading = true;
					return async ({ update }) => {
						await update();
						activeQuizLoading = false;
					};
				}}
				class="active-quiz-form"
			>
				<div class="input-group">
					<label for="active-quiz">Επιλέξτε το Quiz που είναι "στον αέρα":</label>
					<select 
						name="quizId" 
						id="active-quiz" 
						bind:value={selectedQuizId} 
						onchange={handleQuizChange}
						disabled={activeQuizLoading}
					>
						<option value="">-- Κανένα (Απενεργοποίηση) --</option>
						{#each data.quizzes as q}
							<option value={q.id}>{q.name}</option>
						{/each}
					</select>
				</div>

				{#if selectedQuizId}
					<div class="field">
						<label for="quiz-cover">Εξώφυλλο Quiz</label>
						<MediaField 
							mediaType="image" 
							bind:mediaUrl={coverImageUrl} 
							originalUrl={data.quizzes.find(q => q.id === selectedQuizId)?.coverImage || ""}
							allowYouTube={false}
							allowVideoFile={false}
						/>
						<input type="hidden" name="coverImage" value={coverImageUrl} />
					</div>
				{/if}

				<Button type="submit" loading={activeQuizLoading} variant="primary">
					Ενημέρωση Ενεργού Quiz
				</Button>
			</form>
		</Card>
	</section>
</div>

<style>
	.intro-admin-container {
		max-width: 900px;
		margin: 0 auto;
		padding: 2rem 1rem;
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}
	
	.back-link {
		color: #2563eb;
		text-decoration: none;
		font-size: 0.9rem;
		display: block;
		margin-bottom: 1rem;
	}
	
	h1 {
		font-size: 2rem;
		color: #111827;
		margin-bottom: 0.5rem;
	}

	.home-content-form, .active-quiz-form {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.field, .input-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	label {
		font-weight: 600;
		font-size: 0.9rem;
		color: #4b5563;
	}

	input, select {
		padding: 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 1rem;
		background-color: white;
		width: 100%;
		max-width: 100%;
	}

	select {
		max-width: 400px;
	}
</style>
