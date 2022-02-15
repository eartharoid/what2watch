<script>
	import { fade } from "svelte/transition";
	import Connecting from "./components/Connecting.svelte";
	import Home from "./components/Home.svelte";
	const socket = io("http://localhost:8080");

	import { writable } from "svelte/store";
	const connected = writable(socket.connected);

	socket.on("connect", () => {
		connected.set(true);
		console.log(socket.id);
	});

	socket.on("disconnect", () => {
		connected.set(false);
	});
</script>

<main id="root" class="h-full w-full text-white">
	<div class="max-w-screen-sm mx-auto text-center p-4">
		{#key $connected}
			<div transition:fade>
				{#if !socket.connected}
					<Connecting />
				{:else}
					<Home {socket} />
				{/if}
			</div>
		{/key}
	
		</div>
</main>

<style>
</style>
