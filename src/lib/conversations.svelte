<script lang="ts">
	import { Conversation, ConversationConverter } from '$lib/store/conversations';
	import { collection, addDoc, Timestamp, doc, deleteField, updateDoc } from 'firebase/firestore';
	import { v4 as uuidv4 } from 'uuid';
	import { Block, Notify } from 'notiflix';
	import firebase from '../hooks.client';
	import user from '$lib/store/user';
	import { FirebaseError } from 'firebase/app';
	import Nav from './nav.svelte';

	export let conversationuid: string;

	let menuShow = false;
	let selectConversation: Conversation;
	let height: number;
	let width: number;

	let editHide = true;
	const onCreateConversation = async (chatTitle: string) => {
		if (chatTitle !== undefined && chatTitle.length > 0) {
			try {
				const conversation = new Conversation({
					conversationId: uuidv4(),
					createtime: Timestamp.now(),
					title: chatTitle,
					updatetime: Timestamp.now(),
					userid: $user?.uid || '',
					id: ''
				});
				await addDoc(
					collection(firebase.db, 'conversations'),
					ConversationConverter.toFirestore(conversation)
				);
				Notify.success('Create new chat successed', undefined, {
					zindex: 999,
					position: 'center-top'
				});
				editHide = true;
			} catch (error) {
				if (error instanceof FirebaseError) {
					Notify.failure((error as FirebaseError).message, undefined, {
						position: 'center-top'
					});
				} else {
					Notify.failure(error as string, undefined, {
						position: 'center-top'
					});
				}
			}
		} else {
			Notify.failure('Chat title can not empty', undefined, {
				position: 'center-top'
			});
		}
	};
	async function onEdit() {
		if (selectConversation) {
			try {
				Block.pulse('.edit-dialog');
				await updateDoc(doc(firebase.db, `conversations/${selectConversation.id}`), {
					title: selectConversation.title,
					userLabel: selectConversation.userLabel ?? deleteField(),
					assistantLabel: selectConversation.assistantLabel ?? deleteField(),
					promptPrefix: selectConversation.promptPrefix ?? deleteField(),
					promptSuffix: selectConversation.promptSuffix ?? deleteField()
				});
				editHide = true;
			} catch (error) {
				if (error instanceof FirebaseError) {
					Notify.failure((error as FirebaseError).message, undefined, {
						position: 'center-top',
						zindex: 99999
					});
				} else {
					Notify.failure(error as string, undefined, {
						position: 'center-top',
						zindex: 99999
					});
				}
			} finally {
				Block.remove('.edit-dialog');
			}
		}
	}
</script>

<svelte:window bind:innerHeight={height} bind:innerWidth={width} />

{#if width < 767.99}
	<div class="drop-menu drop-wrapper u-position-absolute u-z-index-10">
		<button
			on:click={() => (menuShow = !menuShow)}
			class="button is-only-icon"
			aria-label="Add new item"
		>
			<span class="icon-menu" aria-hidden="true" />
		</button>
		<div
			class="side-nav-wrap drop u-margin-inline-start-16 is-no-arrow is-block-end"
			data-hidden={menuShow ? 'show' : 'hide'}
		>
			<Nav
				{conversationuid}
				on:editconversation={(conversation) => {
					selectConversation = { ...conversation.detail };
					editHide = false;
				}}
				on:selectconversation={() => (menuShow = false)}
				{onCreateConversation}
			/>
		</div>
	</div>
	<div
		on:touchstart={() => (menuShow = false)}
		class="mask u-z-index-5"
		style="height: {height}px;"
		data-hidden={menuShow ? 'show' : 'hide'}
	/>
{:else}
	<Nav
		{conversationuid}
		on:editconversation={(conversation) => {
			selectConversation = { ...conversation.detail };
			editHide = false;
		}}
		{onCreateConversation}
	/>
{/if}

{#if selectConversation}
	<div
		data-hidden={editHide ? 'hide' : 'show'}
		style="height: {height}px;"
		class="edit-modal u-flex u-main-center u-cross-center"
	>
		<dialog open class="modal is-big edit-dialog" id="dialog">
			<form class="modal-form">
				<header class="modal-header">
					<img style="width: 60px;" src="/logo.png" alt="" />
					<h4 class="modal-title heading-level-5">Configure conversation parameters</h4>
					<button
						type="button"
						on:click={() => (editHide = true)}
						class="button is-text is-small is-only-icon"
						aria-label="Close modal"
					>
						<span class="icon-x" aria-hidden="true" />
					</button>
				</header>
				<div class="modal-content u-small">
					<li class="form-item">
						<label for="title" class="label">Title</label>
						<div class="input-text-wrapper" style="--amount-of-buttons:2">
							<input
								bind:value={selectConversation.title}
								id="title"
								name="Title"
								type="text"
								placeholder="please enter conversation title"
							/>
						</div>
					</li>

					<li class="form-item">
						<label for="userlabel" class="label"
							>User Label {selectConversation.userLabel !== undefined ? '' : '(not set)'}</label
						>
						<div class="input-text-wrapper" style="--amount-of-buttons:2">
							<input
								bind:value={selectConversation.userLabel}
								id="userlabel"
								name="UserLabel"
								type="text"
								placeholder="please enter user label"
							/>
							<button
								type="button"
								on:click={() =>
									(selectConversation = { ...selectConversation, userLabel: undefined })}
								class="clear button is-text is-only-icon"
								style="--button-size:1.5rem;"
							>
								<span class="icon-x" aria-hidden="true" />
							</button>
						</div>
					</li>

					<li class="form-item">
						<label for="assistantlabel" class="label"
							>Assistant Label {selectConversation.assistantLabel !== undefined
								? ''
								: '(not set)'}</label
						>
						<div class="input-text-wrapper" style="--amount-of-buttons:2">
							<input
								bind:value={selectConversation.assistantLabel}
								id="assistantlabel"
								name="AssistantLabel"
								type="text"
								placeholder="please enter assistant label"
							/>
							<button
								type="button"
								on:click={() =>
									(selectConversation = { ...selectConversation, assistantLabel: undefined })}
								class="clear button is-text is-only-icon"
								style="--button-size:1.5rem;"
							>
								<span class="icon-x" aria-hidden="true" />
							</button>
						</div>
					</li>

					<li class="form-item">
						<label for="promptprefix" class="label"
							>Prompt Prefix {selectConversation.promptPrefix !== undefined
								? ''
								: '(not set)'}</label
						>
						<div class="input-text-wrapper" style="--amount-of-buttons:2">
							<textarea
								bind:value={selectConversation.promptPrefix}
								id="promptprefix"
								name="PromptPrefix"
								rows={5}
								style="height: auto;"
								placeholder="please enter prompt prefix"
							/>
							<button
								type="button"
								on:click={() =>
									(selectConversation = { ...selectConversation, promptPrefix: undefined })}
								class="clear button is-text is-only-icon"
								style="--button-size:1.5rem;"
							>
								<span class="icon-x" aria-hidden="true" />
							</button>
						</div>
					</li>

					<li class="form-item">
						<label for="promptsuffix" class="label"
							>Prompt Suffix {selectConversation.promptSuffix !== undefined
								? ''
								: '(not set)'}</label
						>
						<div class="input-text-wrapper" style="--amount-of-buttons:2">
							<textarea
								bind:value={selectConversation.promptSuffix}
								id="promptsuffix"
								name="PromptSuffix"
								rows={5}
								style="height: auto;"
								placeholder="please enter prompt suffix"
							/>
							<button
								type="button"
								style="--button-size:1.5rem;"
								on:click={() =>
									(selectConversation = { ...selectConversation, promptSuffix: undefined })}
								class="clear button  is-text is-only-icon"
							>
								<span class="icon-x" aria-hidden="true" />
							</button>
						</div>
					</li>
				</div>
				<div class="modal-footer">
					<div class="u-flex u-main-end u-gap-16">
						<button
							disabled={!selectConversation.title?.length}
							type="button"
							on:click={onEdit}
							class="button "><span class="text">Save</span></button
						>
						<button type="button" on:click={() => (editHide = true)} class="button is-secondary">
							<span class="text">Cancel</span>
						</button>
					</div>
				</div>
			</form>
		</dialog>
	</div>
{/if}

<slot />

<style>
	.edit-modal[data-hidden='hide'] {
		display: none;
	}
	.edit-modal {
		width: 100vw;
		position: fixed;
		background-color: rgba(0, 0, 0, 0.6);
		z-index: 9999;
		top: 0;
		left: 0;
	}
	.clear {
		color: hsl(var(--color-neutral-50));
	}
	.drop-menu {
		top: 6px;
		left: 6px;
	}
	.side-nav-wrap[data-hidden='hide'] {
		display: none;
	}
	.mask {
		position: absolute;
		width: 100vw;
		background-color: rgba(0, 0, 0, 0.6);
		top: 0px;
		left: 0px;
	}
	.mask[data-hidden='hide'] {
		display: none;
	}

	textarea {
		overflow: auto;
	}
	textarea::-webkit-scrollbar {
		opacity: 0;
		width: 0.5rem;
		height: 0.5rem;
	}
	textarea::-webkit-scrollbar-corner {
		background: hsl(var(--scroll-color));
		border-radius: 0.375rem;
	}
	textarea::-webkit-scrollbar-thumb {
		border-radius: 0.25rem;
		background: hsl(var(--scroll-color));
	}
	textarea::-webkit-scrollbar-track {
		border-radius: 0.25rem;
		margin-right: 0.5rem;
	}
	.side-nav-wrap {
		border: none;
	}
</style>
