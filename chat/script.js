document.querySelector("#button-enviar").addEventListener("click", enviar);

function enviar() {
    let mensaje = document.querySelector("#textarea1").value; 
    document.querySelector("#textarea1").value = "";
    let mensajehtml =  `<div class="col s6 offset-s6">
					<div class="card-panel teal light-blue lighten-4">${mensaje}</div>
                </div>`;
    document.querySelector(".message-wrapper").innerHTML += mensajehtml;
}
