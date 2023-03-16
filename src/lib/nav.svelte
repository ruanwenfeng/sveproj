<script lang="ts">
	import conversations, { Conversation } from '$lib/store/conversations';
	import { createEventDispatcher } from 'svelte';
	import firebase from '../hooks.client';
	import { Confirm } from 'notiflix';

	export let conversationuid: string;
	export let onCreateConversation: (chatTitle: string) => Promise<void>;
	const dispatch = createEventDispatcher<{
		editconversation: Conversation;
		selectconversation: Conversation;
	}>();
</script>

<div class="side-nav">
	<div class="side-nav-main">
		<section class="drop-section">
			<ul class="drop-list">
				<li class="drop-list-item">
					<!-- svelte-ignore a11y-invalid-attribute -->
					<a
						on:click={() => {
							Confirm.prompt(
								'Create new chat',
								'Please input the new chat title',
								'',
								'Ok',
								'Cancel',
								onCreateConversation,
								undefined,
								{ width: '420px' }
							);
						}}
						class="drop-button"
						href=""
					>
						<span class="icon-plus-circle" aria-hidden="true" />
						<span class="text">Create new chat</span>
					</a>
				</li>

				{#if $conversations}
					{#each $conversations as conversation (conversation.id)}
						<li class="drop-list-item">
							<a
								class="drop-button menu-item"
								class:is-selected={conversationuid === conversation.id}
								href="/conversations/{conversation.id}"
								on:click={() => dispatch('selectconversation', conversation)}
							>
								<span class="text">{conversation.title}</span>
								<span
									hidden={!(conversation.id === conversationuid)}
									on:click={() => dispatch('editconversation', conversation)}
									class="icon-pencil edit"
									aria-hidden="true"
								/>
							</a>
						</li>
					{/each}
				{:else}
					<li class="drop-list-item">
						<div class="u-flex u-main-center">
							<div class="loader" />
						</div>
					</li>
				{/if}
			</ul>
		</section>
	</div>

	<div class="side-nav-bottom">
		<section class="drop-section">
			<!-- svelte-ignore a11y-invalid-attribute -->
			<a
				on:click={() => {
					firebase.auth.signOut();
				}}
				class="drop-button"
				href=""
			>
				<span class="icon-logout-left" aria-hidden="true" />
				<span class="text">Logout</span>
			</a>
		</section>
	</div>
</div>

<style>
	@media (max-width: 767.99px) {
		.side-nav {
			max-height: 600px;
		}
		.side-nav-main .drop-section {
			padding-bottom: 0;
		}
	}
	.side-nav {
		border: none;
		border-radius: var(--border-radius-small);
	}
	.side-nav-main {
		border-top-left-radius: var(--border-radius-small);
		border-top-right-radius: var(--border-radius-small);
	}
	.side-nav-bottom {
		border-bottom-left-radius: var(--border-radius-small);
		border-bottom-right-radius: var(--border-radius-small);
	}
	.drop-section {
		inline-size: 16.5rem;
	}
	.menu-item .edit:hover {
		color: hsl(var(--color-primary-100));
	}
</style>
