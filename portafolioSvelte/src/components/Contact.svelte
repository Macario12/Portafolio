<script>
    /* const sendmail = require('sendmail')(); */
    /* import sendmail from 'sendmail'; */
    let mensaje = {
        nombre: "",
        email: "",
        mensaje: ""
    }

    const sumbitMenssage = e =>{
        e.preventDefault();
        /* sendmail({
        from: mensaje.email,
        to: 'arielmacario.11@gmail.com',
        subject: mensaje.nombre,
        html: mensaje.mensaje,
        }, function(err, reply) {
            console.log(err && err.stack);
            console.dir(reply);
        }); */
        console.log(mensaje)
    };

    
</script>
   <div class="p-5">
       <br>
        <h1 class="text-center">Contactame</h1>

        <br>

        <form class="p-5" on:submit={sumbitMenssage}>
            <div class="form-row">
                <div class="form-group col-md-6">
                  <label for="inputEmail4">Nombre</label>
                  <input bind:value={mensaje.nombre} type="text" class="form-control" id="inputEmail4" placeholder="nombre" >
                </div>
                <div class="form-group col-md-6">
                  <label for="inputPassword4">Correo electronico</label>
                  <input bind:value={mensaje.email} type="email" class="form-control" id="inputPassword4" placeholder="correo eletronico" >
                </div>
              </div>
              <div class="form-group">
                <label for="inputAddress">Mensaje</label>
                
                <textarea  bind:value={mensaje.mensaje} name="message" class="form-control" id="" cols="30" rows="10"></textarea>
              </div>
              
              <div class="text-center">
                  <br>
                <button type="submit" class="btn btn-outline-warning btn-lg">Enviar</button>
              </div>
          </form>
   </div>
<style>
    @import url("https://cdn.jsdelivr.net/npm/bootswatch@4.5.2/dist/litera/bootstrap.min.css");
</style>