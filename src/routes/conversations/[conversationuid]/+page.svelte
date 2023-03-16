<script lang="ts">
	import ConversationPage from '$lib/conversation.svelte';
	import { page } from '$app/stores';
	import conversations, { ChatMessage, ChatMessageConverter } from '$lib/store/conversations';
	import { derived, writable } from 'svelte/store';
	import {
		query,
		limit,
		orderBy,
		onSnapshot,
		where,
		collection,
		endBefore,
		Timestamp
	} from 'firebase/firestore';
	import firebase from '../../../hooks.client';
	import user from '$lib/store/user';
	import * as STORE from 'store';

	let height: number;
	let selectedConversation = derived([page, conversations], (v) => {
		return v[1]?.filter((item) => item.id === v[0].data.conversationuid);
	});
	function createMessageSub(conversationuid: string) {
		let localCacheMessage: ChatMessage[] = STORE.get(conversationuid);
		const data = writable<ChatMessage[]>(localCacheMessage, (set) => {
			const q = query(
				collection(firebase.db, `conversations/${conversationuid}/messages`),
				...(localCacheMessage?.length ? [] : [limit(15)]),
				orderBy('updatetime', 'desc'),
				...(localCacheMessage?.length
					? [
							endBefore(
								localCacheMessage.length
									? Timestamp.fromMillis(
											localCacheMessage[0].updatetime.seconds * 1000 +
												localCacheMessage[0].updatetime.nanoseconds / 1000000
									  )
									: Timestamp.fromDate(new Date(1900))
							)
					  ]
					: []),
				where('userid', '==', $user?.uid || '')
			).withConverter(ChatMessageConverter);
			return onSnapshot(q, (querySnapshot) => {
				const tmp: ChatMessage[] = [];
				querySnapshot.docChanges().forEach((change) => {
					if (change.type === 'added') {
						tmp.push(change.doc.data());
					} else if (change.type === 'modified') {
						console.log('Modified city: ', change.doc.data());
					}
				});
				set([...tmp, ...(localCacheMessage ?? [])]);
			});
		});
		data.subscribe((messages) => {
			localCacheMessage = messages;
			STORE.set(conversationuid, messages);
		});
		return data;
	}
</script>

<div
	class="content u-position-relative u-flex u-flex-vertical u-stretch u-main-center"
	bind:clientHeight={height}
>
	{#if $selectedConversation && $selectedConversation.length}
		<ConversationPage
			messages={createMessageSub($selectedConversation[0].id)}
			conversation={$selectedConversation[0]}
			{height}
		/>
	{:else}
		<li class="drop-list-item">
			<div class="u-flex u-main-center">
				<div class="loader" />
			</div>
		</li>
	{/if}
</div>
