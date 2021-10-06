<script>
	import { Router, Link, Route } from "svelte-routing";
	import Home from "./routes/Home.svelte";
	import Login from "./routes/Login.svelte";
	import { initializeApp } from "firebase/app";

	const firebase = initializeApp({
		apiKey: "AIzaSyBiIDRNDjp-D0N9N-tFhCOJliMvJHvPNcg",
		authDomain: "what2watch-app.firebaseapp.com",
		databaseURL:
			"https://what2watch-app-default-rtdb.europe-west1.firebasedatabase.app",
		projectId: "what2watch-app",
		storageBucket: "what2watch-app.appspot.com",
		messagingSenderId: "966783988395",
		appId: "1:966783988395:web:61c59b422d7a91a9ee7dee",
	});

	export let url = "";
</script>

<main
	class="p-5 fixed h-full w-full bg-cover bg-gradient-to-br from-green-600 to-blue-800 text-white"
>
	<Router {url}>
		<!-- <nav>
			<Link to='/'>Home</Link>
			<Link to='about'>About</Link>
			<Link to='blog'>Blog</Link>
		</nav> -->
		<div>
			<Route path="/"><Home /></Route>
		</div>
	</Router>
</main>

<style>
</style>
