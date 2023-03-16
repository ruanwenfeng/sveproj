<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { Loading } from 'notiflix/build/notiflix-loading-aio';
	import conversations from '$lib/store/conversations';

	onMount(() => {
		Loading.pulse({ backgroundColor: 'hsl(var(--color-neutral-0))' });
		if (!$page.data.conversationuid) {
			return conversations.subscribe((value) => {
				if (value && value.length) {
					goto(`/conversations/${value[0].id}`);
				}
				Loading.remove();
			});
		}
		Loading.remove();
	});
</script>
