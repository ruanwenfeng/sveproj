import { collection, query, where, onSnapshot, Timestamp, orderBy } from 'firebase/firestore';
import type { FirestoreDataConverter } from 'firebase/firestore';
import { get, writable } from 'svelte/store';
import firebase from '../../hooks.client';
import user from '$lib/store/user';

export class ChatMessage {
	public id: string;
	public text: string;
	public role: 'user' | 'assistant';
	public parentMessageId: string;
	public messageId: string;
	public conversationId: string;
	public conversationUID: string;
	public createtime: Timestamp;
	public updatetime: Timestamp;
	public userid: string;
	constructor(param: {
		text: string;
		role: 'user' | 'assistant';
		messageId: string;
		parentMessageId: string;
		conversationId: string;
		conversationUID: string;
		createtime: Timestamp;
		updatetime: Timestamp;
		userid: string;
		id: string;
	}) {
		this.id = param.id;
		this.text = param.text;
		this.role = param.role;
		this.messageId = param.messageId;
		this.parentMessageId = param.parentMessageId;
		this.conversationId = param.conversationId;
		this.conversationUID = param.conversationUID;
		this.createtime = param.createtime;
		this.updatetime = param.updatetime;
		this.userid = param.userid;
	}
}
export const ChatMessageConverter: FirestoreDataConverter<ChatMessage> = {
	toFirestore: (data) => {
		return {
			text: data.text,
			role: data.role,
			parentMessageId: data.parentMessageId,
			messageId: data.messageId,
			conversationId: data.conversationId,
			conversationUID: data.conversationUID,
			createtime: data.createtime,
			updatetime: data.updatetime,
			userid: data.userid
		};
	},
	fromFirestore: (snapshot, options) => {
		const message = snapshot.data(options);
		return new ChatMessage({
			text: message.text,
			role: message.role,
			messageId: message.messageId,
			parentMessageId: message.parentMessageId,
			conversationId: message.conversationId,
			conversationUID: message.conversationUID,
			createtime: message.createtime,
			updatetime: message.updatetime,
			userid: message.userid,
			id: snapshot.id
		});
	}
};
export class Conversation {
	public id: string;
	public conversationId: string;
	public title: string;
	public createtime: Timestamp;
	public updatetime: Timestamp;
	public userid: string;

	// config
	public userLabel?: string;
	public assistantLabel?: string;
	public promptPrefix?: string;
	public promptSuffix?: string;

	constructor(param: {
		conversationId: string;
		createtime: Timestamp;
		title: string;
		updatetime: Timestamp;
		userid: string;
		id: string;

		userLabel?: string;
		assistantLabel?: string;
		promptPrefix?: string;
		promptSuffix?: string;
	}) {
		this.id = param.id;
		this.conversationId = param.conversationId;
		this.createtime = param.createtime;
		this.title = param.title;
		this.updatetime = param.updatetime;
		this.userid = param.userid;

		this.userLabel = param.userLabel;
		this.assistantLabel = param.assistantLabel;
		this.promptPrefix = param.promptPrefix;
		this.promptSuffix = param.promptSuffix;
	}
}

export const ConversationConverter: FirestoreDataConverter<Conversation> = {
	toFirestore: (data) => {
		return {
			conversationId: data.conversationId,
			title: data.title,
			createtime: data.createtime,
			updatetime: data.updatetime,
			userid: data.userid
		};
	},
	fromFirestore: (snapshot, options) => {
		const data = snapshot.data(options);
		return new Conversation({
			conversationId: data.conversationId,
			createtime: data.createtime,
			title: data.title,
			updatetime: data.updatetime,
			userid: data.userid,
			id: snapshot.id,

			userLabel: data.userLabel,
			assistantLabel: data.assistantLabel,
			promptPrefix: data.promptPrefix,
			promptSuffix: data.promptSuffix
		});
	}
};

const conversations = writable<Conversation[]>(undefined, function start(set) {
	const q = query(
		collection(firebase.db, 'conversations'),
		where('userid', '==', get(user)?.uid || ''),
		orderBy('updatetime')
	).withConverter(ConversationConverter);

	const unsubscribe = onSnapshot(q, (querySnapshot) => {
		const conversationsData: Conversation[] = [];
		querySnapshot.forEach((doc) => {
			conversationsData.push(doc.data());
		});
		set(conversationsData);
	});
	return unsubscribe;
});

export default conversations;
