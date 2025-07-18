
//Función para dar feedback al usuario
document.getElementById("btn-descargar-cv").addEventListener("click", function() {
    alert("Gracias por descargar mi CV");
});

//Retroalimentación al usuario
document.querySelector("h1").addEventListener("click", function() {
    alert("Gracias por visitar mi portafolio");
});

//contador de me gusta 
let contador = 0;
document.getElementById("btn-like").addEventListener("click", function() {
    contador++;
    document.getElementById("contador").textContent = "❤️ " + contador;
})

$(document).ready(function() {
    //Mostrar el boton cuando haces scroll hacia abajo
    $(window).scroll(function() {
        if ($(this).scrollTop() > 300) {
            $("#btn-volver-arriba").fadeIn();
         } else {
            $("#btn-volver-arriba").fadeOut();
        }
    });
    //Mostrar el boton cuando haces scroll hacia arriba
    $("#btn-volver-arriba").click(function() {
        $("html, body").animate({
            scrollTop: 0
        }, 800);
        return false;
    });
});