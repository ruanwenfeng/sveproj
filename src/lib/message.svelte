<script lang="ts">
	import type { ChatMessage } from './store/conversations';
	import Markdown from 'svelte-exmarkdown';
	export let message: ChatMessage;
</script>

<div class="u-padding-inline-12 u-flex" class:u-main-end={message.role === 'user'}>
	<div id={message.messageId} class="message {message.role}">
		<Markdown md={message.text} />
	</div>
</div>

<style>
	.message {
		background-color: hsl(var(--color-neutral-0));
		padding: 16px;
		border-radius: var(--border-radius-medium);
		max-width: fit-content;
		word-break: break-all;
	}
	.message.user {
		border-bottom-right-radius: 0;
		background-color: hsl(var(--color-information-100));
		color: hsl(var(--color-neutral-0));
	}
	.message.assistant {
		border-bottom-left-radius: 0;
	}
</style>
