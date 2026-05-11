<script>
	import { enhance } from '$app/forms';
	import Card from '../Card.svelte';
	import Button from '../Button.svelte';

	let { loading = false } = $props();
</script>

<aside class="side-panel">
	<Card class="control-card">
		<section class="add-section">
			<h3>Προσθήκη Ερώτησης</h3>
			<form 
				method="POST" 
				action="?/addQuestion" 
				use:enhance={() => {
					loading = true;
					return async ({ update }) => {
						await update();
						loading = false;
					};
				}}
				class="add-form"
			>
				<div class="field">
					<input type="text" name="text" placeholder="Κείμενο ερώτησης..." required disabled={loading} />
				</div>
				<Button type="submit" {loading} variant="primary" class="btn-full" style="background: #059669; width: 100%;">
					+ Ερώτηση
				</Button>
			</form>
		</section>

		<hr class="separator" />

		<section class="add-section">
			<h3>Προσθήκη Κάρτας</h3>
			<p class="help-text">Πληροφοριακή κάρτα με τίτλο, κείμενο και media.</p>
			<form 
				method="POST" 
				action="?/addCard" 
				use:enhance={() => {
					loading = true;
					return async ({ update }) => {
						await update();
						loading = false;
					};
				}}
				class="add-form"
			>
				<div class="field">
					<input type="text" name="text" placeholder="Τίτλος κάρτας..." required disabled={loading} />
				</div>
				<Button type="submit" {loading} variant="primary" class="btn-full" style="background: #2563eb; width: 100%;">
					+ Κάρτα
				</Button>
			</form>
		</section>
	</Card>
</aside>

<style>
	.side-panel { position: sticky; top: 5rem; }
	:global(.control-card) { padding: 0 !important; }
	.add-section { padding: 1.5rem; }
	.add-section h3 { margin-top: 0; margin-bottom: 0.5rem; font-size: 1.1rem; color: #111827; }
	.help-text { font-size: 0.8rem; color: #6b7280; margin-bottom: 1rem; line-height: 1.3; }
	.separator { border: 0; border-top: 1px solid #f3f4f6; margin: 0; }
	.add-form { display: flex; flex-direction: column; gap: 0.75rem; }
	.add-form .field input { width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; box-sizing: border-box; }
</style>
