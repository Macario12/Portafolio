<script>
    /* import Contact from "./Contact.svelte"; */

    import { Router, Route, Link } from 'svelte-navigator';
</script>
<nav class="navbar navbar-expand-lg navbar-light">
    <a class="navbar-brand" href="/Portafolio/portafolioSvelte/public/">
        <img src="./images/logoMacario.png" alt="" height="40">
    </a>
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
    </button>

    <div class="collapse navbar-collapse" id="navbarSupportedContent">
            <ul class="navbar-nav mr-auto">
                <li class="nav-item mx-auto">
                    <a class="nav-link text-warning lead mr-auto" href="#">Tutoria</a>
                </li>
            </ul>

        <form class="form-inline my-2 my-lg-0">
            <Link class="btn btn-outline-warning my-2 my-sm-0 mx-auto" to="/Portafolio/portafolioSvelte/public/contact">Contactame</Link>
          </form>
          
    </div>
</nav>

<style>
	@import url("https://cdn.jsdelivr.net/npm/bootswatch@4.5.2/dist/litera/bootstrap.min.css");
</style>