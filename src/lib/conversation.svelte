<script lang="ts">
	import Message from '$lib/message.svelte';
	import { afterUpdate, beforeUpdate } from 'svelte';
	import { ChatMessage, ChatMessageConverter, Conversation } from './store/conversations';
	import { v4 as uuidv4 } from 'uuid';
	import {
		collection,
		query,
		getDocs,
		limit,
		addDoc,
		orderBy,
		Timestamp,
		startAfter
	} from 'firebase/firestore';
	import firebase from '../hooks.client';
	import { FirebaseError } from 'firebase/app';
	import { Notify } from 'notiflix/build/notiflix-notify-aio';
	import { Block } from 'notiflix/build/notiflix-block-aio';
	import user from './store/user';
	import type { Writable } from 'svelte/store';
	import { httpsCallable } from 'firebase/functions';
	import html2canvas from 'html2canvas';

	export let conversation: Conversation;
	export let messages: Writable<ChatMessage[]>;
	let messagesBox: HTMLDivElement;
	let messageList: HTMLDivElement;
	let titleElement: HTMLHeadingElement;
	let inputTextArea: HTMLTextAreaElement;
	let textVal: string;
	let autoscroll: boolean;
	export let height: number;
	let width: number;
	beforeUpdate(() => {
		autoscroll =
			messagesBox &&
			messagesBox.offsetHeight + messagesBox.scrollTop > messagesBox.scrollHeight - 20;
	});

	afterUpdate(() => {
		if (autoscroll && messagesBox) {
			messagesBox.scrollTo(0, messagesBox.scrollHeight);
		}
	});

	const sendMessage = async (message: ChatMessage) => {
		Block.pulse('.send-message-btn');
		try {
			const res = await addDoc(
				collection(firebase.db, `conversations/${message.conversationUID}/messages`),
				ChatMessageConverter.toFirestore(message)
			);
			message.id = res.id;
			if (message.role === 'user') {
				const addMessage = httpsCallable<
					ChatMessage,
					{
						data: {
							conversationId: string;
							id: string;
							parentMessageId: string;
							role: 'user' | 'assistant';
							text: string;
						};
						status: 'success' | 'error';
					}
				>(firebase.functions, 'addMessage', { timeout: 600000 });
				const response = await addMessage(message);
				// const { data } = response.data;
				// console.log('response1', response1);
				// const response: {
				// 	conversationId: string;
				// 	id: string;
				// 	parentMessageId: string;
				// 	role: 'user' | 'assistant';
				// 	text: string;
				// } = await (
				// 	await fetch('/api/message', {
				// 		method: 'POST',
				// 		headers: {
				// 			'Content-Type': 'application/json'
				// 		},
				// 		body: JSON.stringify(message)
				// 	})
				// ).json();
				if (response.data.status === 'success') {
					// await sendMessage(
					// 	new ChatMessage({
					// 		text: data.text,
					// 		role: data.role,
					// 		parentMessageId: data.parentMessageId,
					// 		conversationId: data.conversationId,
					// 		conversationUID: message.conversationUID,
					// 		id: '',
					// 		messageId: data.id,
					// 		createtime: Timestamp.now(),
					// 		updatetime: Timestamp.now(),
					// 		userid: $user?.uid || ''
					// 	})
					// );
				} else {
					Notify.failure('Failed to generate answer', undefined, {
						position: 'center-top'
					});
				}
				textVal = '';
			}
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
		} finally {
			Block.remove('.send-message-btn');
		}
	};

	function getNewChatMessage() {
		if ($messages?.length) {
			return new ChatMessage({
				text: textVal,
				role: 'user',
				parentMessageId: $messages[0].messageId,
				conversationId: conversation.conversationId,
				conversationUID: conversation.id,
				id: '',
				messageId: uuidv4(),
				createtime: Timestamp.now(),
				updatetime: Timestamp.now(),
				userid: $user?.uid || ''
			});
		}
		return new ChatMessage({
			text: textVal,
			role: 'user',
			parentMessageId: '',
			conversationId: conversation.conversationId,
			conversationUID: conversation.id,
			id: '',
			messageId: uuidv4(),
			createtime: Timestamp.now(),
			updatetime: Timestamp.now(),
			userid: $user?.uid || ''
		});
	}
	const onScroll = async (
		e: UIEvent & {
			currentTarget: EventTarget & HTMLDivElement;
		}
	) => {
		if (e.currentTarget.scrollTop === 0) {
			if ($messages) {
				const q = query(
					collection(firebase.db, `conversations/${conversation.id}/messages`),
					limit(15),
					orderBy('updatetime', 'desc'),
					startAfter(
						$messages && $messages.length
							? Timestamp.fromMillis(
									$messages[$messages.length - 1].updatetime.seconds * 1000 +
										$messages[$messages.length - 1].updatetime.nanoseconds / 1000000
							  )
							: Timestamp.now()
					)
				).withConverter(ChatMessageConverter);
				const tmp: ChatMessage[] = [];
				const querySnapshot = await getDocs(q);
				querySnapshot.forEach((doc) => {
					tmp.push(doc.data());
				});
				if (tmp.length) {
					messagesBox.scrollTo(0, 10);
					$messages = [...$messages, ...tmp];
				}
			}
		}
	};
</script>

<svelte:window bind:innerWidth={width} />

{#if $messages && conversation}
	<h5 style="text-align:center;" bind:this={titleElement} class="message-title heading-level-4">
		{width < 767.99
			? `${conversation?.title?.slice(0, 9)}${conversation?.title?.length > 9 ? '...' : ''}`
			: `${conversation?.title?.slice(0, 15)}${conversation?.title?.length > 15 ? '...' : ''}`}
		<div class="download-message-btn u-flex u-main-center u-cross-center u-position-absolute">
			<button
				on:click={() => {
					html2canvas(messageList).then((canvas) => {
						const link = document.createElement('a');
						link.download = `${conversation.title}.png`;
						link.href = canvas.toDataURL();
						link.click();
					});
				}}
				class="button is-only-icon is-text"
				aria-label="Download message"
			>
				<span class="icon-download" aria-hidden="true" />
			</button>
		</div>
	</h5>
	<div class="message-box u-flex u-flex-vertical u-stretch">
		<div
			bind:this={messagesBox}
			on:scroll={onScroll}
			class="u-margin-0 u-stretch messages"
			style="flex-basis:{height -
				titleElement?.clientHeight -
				inputTextArea?.clientHeight -
				32 -
				16}px"
		>
			<div
				bind:this={messageList}
				style="grid-auto-rows: min-content;"
				class="boxes-wrapper u-padding-block-12 messages-list u-gap-16"
			>
				{#each [...$messages].reverse() as message (message.id)}
					<Message {message} />
				{/each}
			</div>
		</div>
		<div class="input-text">
			<textarea
				bind:value={textVal}
				bind:this={inputTextArea}
				placeholder="Type question here..."
			/>
		</div>

		<div
			class="send-message-btn u-flex u-main-center u-cross-center u-z-index-1 u-position-absolute"
		>
			<button
				class="button is-only-icon"
				on:click={() => sendMessage(getNewChatMessage())}
				disabled={textVal === undefined || textVal?.length <= 0}
				aria-label="Send message"
			>
				<span class="icon-plus" aria-hidden="true" />
			</button>
		</div>
	</div>
{:else}
	<div class="u-flex u-main-center">
		<div class="loader" />
	</div>
{/if}

<style>
	.message-box {
		background-color: hsl(var(--color-neutral-10));
		border-radius: var(--border-radius-medium);
	}
	.input-text,
	.input-text > textarea {
		outline: none;
		border: none;
		border-radius: var(--border-radius-medium);
	}
	.send-message-btn {
		bottom: 0;
		right: 0;
		min-height: 96px;
		min-width: 96px;
	}
	.messages {
		overflow: auto;
	}
	.messages::-webkit-scrollbar {
		opacity: 0;
		width: 0.5rem;
		height: 0.5rem;
	}
	.messages::-webkit-scrollbar-corner {
		background: hsl(var(--scroll-color));
		border-radius: 0.375rem;
	}
	.messages::-webkit-scrollbar-thumb {
		border-radius: 0.25rem;
		background: hsl(var(--scroll-color));
	}
	.messages::-webkit-scrollbar-track {
		border-radius: 0.25rem;
		margin-right: 0.5rem;
	}
	.download-message-btn {
		top: 0;
		right: 0;
	}

	@media (max-width: 767.99px) {
		.message-title {
			margin-top: 8px;
			margin-bottom: 8px;
		}

		.download-message-btn {
			top: 4px;
		}
		.message-box {
			margin-bottom: 12px;
		}
	}
	@media (min-width: 768px) {
		.message-title {
			margin-bottom: 0.8rem;
		}
		.download-message-btn {
			top: -4px;
		}
	}
</style>
