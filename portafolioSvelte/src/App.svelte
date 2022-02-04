<script>
	import Contact from './components/Contact.svelte';
	
    import { Router, Route} from 'svelte-navigator';
	import Navbar from './components/Navbar.svelte';
	import Home from './components/Home.svelte';
</script>
<Router>
<header>
	<br>
	<Navbar/>
</header>
<main>
	<Route path="contact">
      <Contact />
    </Route>
	
	<Route path="">
		<Home/>
	</Route>
	
</main>

</Router>
<style>
	@import url("https://cdn.jsdelivr.net/npm/bootswatch@4.5.2/dist/litera/bootstrap.min.css");
</style>