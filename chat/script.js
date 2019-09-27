document.querySelector("#button-enviar").addEventListener("click", enviar);
document.querySelector("#textarea1").addEventListener("keyup", onEnter);

function onEnter(event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        enviar();
    }
}

function enviar() {
    let mensaje = document.querySelector("#textarea1").value; 
    let fecha = new Date().toLocaleString('es-AR', {timeStyle: 'short', dateStyle: 'short'});
    document.querySelector("#textarea1").value = "";
    let mensajehtml =  `<div class="col s6 offset-s6">
                    <div class="card-panel teal light-blue lighten-4">
                        <div class="mensaje">${mensaje}</div>
                        <div class= "estatus"> Pendiente: ${fecha}</div>
                    </div>
                </div>`;
    document.querySelector(".message-wrapper").innerHTML += mensajehtml;
}
