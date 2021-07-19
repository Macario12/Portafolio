<script>
	import Footer from './Footer.svelte'
	import Projects from './Projects.svelte'
</script>

<div>
    <br>
		<br>
		<h1 class="display-5 text-center p-5">Desarrollador Front-end y Desarrollador Brack-end.</h1>
		
		<h4 class="text-center lead">Desarrollo aplicaciones, amo lo que hago, me encantan los animales.</h4>
		<img src="./images/avtarMacario.png" alt="AvatarMac" class="rounded mx-auto d-block img-fluid" width="250px"height= "210px">
		<br>
		<br>
		<img src="./images/imageAbstract.png" alt="Dia a Dia" class="rounded mx-auto d-block img-fluid">
		<div style="position: relative;">
			<div class="p-3 mb-2 bg-warning" >
				<br>
				<br>
				<h3 class="display-5 text-center p-5 text-white font-weight-bold">Hola, Soy Ariel, Un gusto.</h3>
				<div class="text-wrap mx-auto" >
					<p class="lead text-white text-center">Lorem ipsum dolor sit amet consectetur adipisicing elit. Rem voluptatibus voluptates voluptate quos corporis odit temporibus sapiente fugiat cum ut. Laudantium cupiditate dignissimos optio esse animi incidunt corporis tenetur ullam.</p>
				</div>
				<br>
				<br>
				<br>
			</div>
			<div class="container bg-white mx-auto">
				<div class="row">
				<div class="col-sm">
					<br>
					<img src="./images/frontend.png" alt="front-end" class="rounded mx-auto d-block img-fluid">
					<h3 class="display-5 text-center p-5 font-weight-bold">Front-end.</h3>
					<p class="text-center lead">Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos, facilis dignissimos natus recusandae amet enim delectus sequi assumenda, libero nihil molestiae magnam! Obcaecati sed necessitatibus cum eum consequuntur tempore blanditiis.</p>
					<h6 class="text-center text-warning">Things I enjoy designing:</h6>
					<p class="text-center lead">Html, CSS</p>
					<h6 class="text-center text-warning">Dev Tools:</h6>
					<p class="text-center lead">Angular</p>
					<p class="text-center lead">React Js</p>
					<p class="text-center lead">Svelte Js</p>
				</div>
				<div class="col-sm">
					<br>
					<img src="./images/backend.png" alt="back-end" class="rounded mx-auto d-block img-fluid">
					<h3 class="display-5 text-center p-5 font-weight-bold">Back-end.</h3>
					<p class="text-center lead">Lorem ipsum dolor sit amet consectetur adipisicing elit. Natus laudantium possimus quaerat! Laborum impedit dignissimos quod quaerat corrupti quia autem provident, quos assumenda harum possimus animi ratione beatae fugiat unde?</p>
					<h6 class="text-center text-warning">Languages I speak:</h6>
					<p class="text-center lead">Html, CSS</p>
					<h6 class="text-center text-warning">Dev Tools:</h6>
					<p class="text-center lead">Angular</p>
					<p class="text-center lead">React Js</p>
					<p class="text-center lead">Svelte Js</p>
				</div>
				</div>
			</div>
		</div>
		
		<Projects/>

		<Footer/>
</div>

<style>
	@import url("https://cdn.jsdelivr.net/npm/bootswatch@4.5.2/dist/litera/bootstrap.min.css");
	@media (min-width: 992px) {
  .navbar-expand-lg {
    padding-right: 10rem;
    padding-left: 10rem;
  }

}

</style>