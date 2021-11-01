<script>
	import { Router, Link, Route } from "svelte-routing";
	import Home from "./routes/Home.svelte";
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
