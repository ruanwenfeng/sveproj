<script lang="ts">
	import Conversations from '$lib/conversations.svelte';
	import { page } from '$app/stores';
	import user from '$lib/store/user';
</script>

{#if $user}
	<Conversations conversationuid={$page.data.conversationuid}><slot /></Conversations>
{/if}
