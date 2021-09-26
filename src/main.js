import App from './App.svelte';

const app = new App({
	props: { name: 'world' },
	target: document.body
});

export default app;