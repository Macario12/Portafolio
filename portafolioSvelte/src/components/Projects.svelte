<script>
    let proyectos = [
        {Nombre:"Estructuras de Datos", Descripcion:"Soy la descripcion", img:'https://i.pinimg.com/originals/1d/df/d9/1ddfd9ffad8497a5e3ef291d55c8668a.jpg'},
        {Nombre:"Estructuras de Datos", Descripcion:"Soy la descripcion", img:'https://lolwp.com/wp-content/uploads/2014/07/Mecha-Malphite-Wallpaper.jpg'},
        {Nombre:"Estructuras de Datos", Descripcion:"Soy la descripcion", img:'https://i.pinimg.com/originals/2e/f8/5b/2ef85bfa937d9fa05e572a5c32d9ff8e.jpg'},
        {Nombre:"Estructuras de Datos", Descripcion:"Soy la descripcion", img:'https://depor.com/resizer/inTx7wRIT19JZWrWNiLVXB8qwk8=/980x0/smart/filters:format(jpeg):quality(75)/arc-anglerfish-arc2-prod-elcomercio.s3.amazonaws.com/public/P5QEE7NZDJGSPOTUM3UJ3SAMFE.jpg'}
    ]
</script>

<h3 class="display-5 text-center p-5 font-weight-bold">Mis Proyectos</h3>

	<div class="container mx-auto">
		<div class="row">
        {#each proyectos as proyecto }

            <div class="col-md-2 col-md-4 col-xs-6 separtion">
                <div class="card mx-auto text-center" style="width: 20rem;">
                    <img class="card-img-top" src="{proyecto.img}" alt="{proyecto.Nombre}">
                    <div class="card-body">
                    <h5 class="card-title text-warning">{proyecto.Nombre}</h5>
                    <p class="card-text lead">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                    <a href="#" class="btn btn-warning">Go somewhere</a>
                    </div>
                </div>
		    </div>
		
        {/each}    
        </div>
	  </div>

<style>
	@import url("https://cdn.jsdelivr.net/npm/bootswatch@4.5.2/dist/litera/bootstrap.min.css");
  div[class^='col-']{
  border: 20px solid white;
  }

</style>