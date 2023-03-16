<script lang="ts">
	import '@appwrite.io/pink';
	import '@appwrite.io/pink-icons';
	import { onMount } from 'svelte';
	import { onAuthStateChanged } from 'firebase/auth';
	import firebase from '../hooks.client';
	import { goto } from '$app/navigation';
	import user from '$lib/store/user';
	import { Loading } from 'notiflix';
	onMount(() => {
		Loading.pulse();
		if (!$user) {
			return onAuthStateChanged(firebase.auth, (loginUser) => {
				if (loginUser) {
					$user = loginUser;
					goto('/conversations');
				} else {
					$user = undefined;
					goto('/user');
					console.log('User is signed out');
				}
				Loading.remove();
			});
		}
	});

	let height: number;
	let width: number;
</script>

<svelte:window bind:innerHeight={height} bind:innerWidth={width} />

<div class="app">
	<main>
		{#if width < 767.99}
			<div class="root u-flex u-main-center u-cross-center" style="height: {height}px;">
				{#if $user}
					<div class="container u-flex u-gap-16" style="height: 100%;">
						<slot />
					</div>
				{:else}
					<slot />
				{/if}
			</div>
		{:else}
			<div class="root u-flex u-main-center u-cross-center">
				{#if $user}
					<div class="container u-flex u-gap-16">
						<slot />
					</div>
				{:else}
					<slot />
				{/if}
			</div>
		{/if}
	</main>
</div>

<style>
	@media (min-width: 768px) {
		.root {
			height: 100vh;
		}
		.container {
			max-height: 960px;
			height: 85%;
		}
	}
	@media (max-width: 767.99px) {
		.container {
			padding: 0 16px;
		}
	}
</style>
