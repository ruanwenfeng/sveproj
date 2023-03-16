<script lang="ts">
	import { goto } from '$app/navigation';
	import { FirebaseError } from 'firebase/app';
	import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
	import { Notify } from 'notiflix';
	import { Block } from 'notiflix/build/notiflix-block-aio';
	import firebase from '../../hooks.client';

	let email = '';
	let password = '';
	let confirm = '';
	let passwordType: 'text' | 'password' = 'password';
	let dialogType: 'login' | 'register' = 'login';
	const onLogin = async () => {
		Block.pulse('.modal-form');
		try {
			await signInWithEmailAndPassword(firebase.auth, email, password);
			goto('/conversations');
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
			Block.remove('.modal-form');
		}
	};

	const onRegister = async () => {
		Block.pulse('.modal-form');
		try {
			await createUserWithEmailAndPassword(firebase.auth, email, password);
			goto('/conversations');
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
			Block.remove('.modal-form');
		}
	};
</script>

{#if dialogType === 'login'}
	<dialog open={dialogType === 'login'} class="modal" id="dialog">
		<form class="modal-form" on:submit|preventDefault={onLogin}>
			<header class="modal-header">
				<img style="width: 60px;" src="logo.png" alt="" />
				<h4 class="modal-title heading-level-5">Login with Emai & Password</h4>
			</header>
			<div class="modal-content u-small">
				<ul class="form-list">
					<li class="form-item">
						<label for="email" class="label">Email</label>
						<div class="input-text-wrapper" style="--amount-of-buttons:2">
							<input
								bind:value={email}
								autocomplete="username"
								id="email"
								name="email"
								type="email"
								placeholder="email"
							/>
						</div>
					</li>
					<li class="form-item">
						<label for="password" class="label">Password</label>
						<div class="input-text-wrapper" style="--amount-of-buttons:1">
							{#if passwordType === 'password'}
								<input
									bind:value={password}
									id="password"
									name="password"
									type="password"
									class="input-text"
									placeholder="password"
									autocomplete="current-password"
								/>
							{:else}
								<input
									bind:value={password}
									id="password"
									name="password"
									type="text"
									class="input-text"
									placeholder="password"
								/>
							{/if}
							<button
								on:click={() =>
									passwordType === 'password'
										? (passwordType = 'text')
										: (passwordType = 'password')}
								class="show-password-button"
								aria-label="show password"
								type="button"
							>
								<span
									class:icon-eye={passwordType === 'text'}
									class:icon-eye-off={passwordType === 'password'}
									aria-hidden="true"
								/>
							</button>
						</div>
					</li>
				</ul>
			</div>
			<div class="modal-footer">
				<div class="u-flex u-main-end u-gap-16">
					<button disabled={!(email.length && password.length)} type="submit" class="button "
						><span class="text">登陆</span></button
					>
					<button
						on:click={() =>
							dialogType === 'login' ? (dialogType = 'register') : (dialogType = 'login')}
						type="button"
						class="register tooltip is-not-mobile is-text"
					>
						<span class="text u-color-text-info">没有账号</span>
						<span class="tooltip-popup is-bottom  " role="tooltip"
							>Register with email address and password</span
						>
					</button>

					<button
						on:click={() =>
							dialogType === 'login' ? (dialogType = 'register') : (dialogType = 'login')}
						type="button"
						class="register is-text is-only-mobile"
					>
						<span class="text u-color-text-info">没有账号</span>
					</button>
				</div>
			</div>
		</form>
	</dialog>
{/if}
{#if dialogType === 'register'}
	<dialog open={dialogType === 'register'} class="modal" id="dialog">
		<form class="modal-form" on:submit|preventDefault={onRegister}>
			<header class="modal-header">
				<img style="width: 60px;" src="/logo.png" alt="" />
				<h4 class="modal-title heading-level-5">Register with Emai & Password</h4>
			</header>
			<div class="modal-content u-small">
				<ul class="form-list">
					<li class="form-item">
						<label for="email" class="label">Email</label>
						<div class="input-text-wrapper" style="--amount-of-buttons:2">
							<input
								bind:value={email}
								autocomplete="username"
								id="email"
								name="email"
								type="email"
								placeholder="email"
							/>
						</div>
					</li>
					<li class="form-item">
						<label for="password" class="label">Password</label>
						<div class="input-text-wrapper" style="--amount-of-buttons:1">
							{#if passwordType === 'password'}
								<input
									bind:value={password}
									id="password"
									name="password"
									type="password"
									class="input-text"
									placeholder="password"
									autocomplete="new-password"
								/>
							{:else}
								<input
									bind:value={password}
									id="password"
									name="password"
									type="text"
									class="input-text"
									placeholder="password"
								/>
							{/if}
							<button
								on:click={() =>
									passwordType === 'password'
										? (passwordType = 'text')
										: (passwordType = 'password')}
								class="show-password-button"
								aria-label="show password"
								type="button"
							>
								<span
									class:icon-eye={passwordType === 'text'}
									class:icon-eye-off={passwordType === 'password'}
									aria-hidden="true"
								/>
							</button>
						</div>
					</li>
					<li class="form-item">
						<label for="confirm" class="label">Confirm</label>
						<div class="input-text-wrapper" style="--amount-of-buttons:2">
							<input
								bind:value={confirm}
								id="confirm"
								name="confirm"
								type="password"
								class="input-text"
								placeholder="confirm password"
								autocomplete="new-password"
							/>
						</div>
						{#if confirm.length && confirm !== password}
							<p class="helper u-color-text-danger u-margin-block-start-8">
								<span class="icon-x-circle" aria-hidden="true" />
								<span class="text">Confirm password</span>
							</p>
						{/if}
					</li>
				</ul>
			</div>
			<div class="modal-footer">
				<div class="u-flex u-main-end u-gap-16">
					<button
						disabled={!(email.length && password.length && confirm === password)}
						type="submit"
						class="button "><span class="text">注册</span></button
					>
					<button
						on:click={() =>
							dialogType === 'login' ? (dialogType = 'register') : (dialogType = 'login')}
						type="button"
						class="register tooltip is-text is-not-mobile"
					>
						<span class="text u-color-text-info">已有账号</span>
						<span class="tooltip-popup is-bottom" role="tooltip">Login with email and pasowrd</span>
					</button>

					<button
						on:click={() =>
							dialogType === 'login' ? (dialogType = 'register') : (dialogType = 'login')}
						type="button"
						class="register is-text is-only-mobile"
					>
						<span class="text u-color-text-info">已有账号</span>
					</button>
				</div>
			</div>
		</form>
	</dialog>
{/if}
