// Alejandro Rojas
// PARTE 3: ahora los datos se guardan en el backend (server.js) usando fetch
// y ya no en localStorage. Solo la sesion queda en localStorage.

// direccion del backend (como el servidor tambien muestra la pagina, basta con "/api")
const API = "/api";


// ------------------ USUARIOS ------------------

// registrarse
async function registrar() {
    let nombre = document.getElementById("nombre").value;
    let usuario = document.getElementById("usuario").value;
    let contrasena = document.getElementById("contrasena").value;
    let mensaje = document.getElementById("mensaje");

    if (nombre == "" || usuario == "" || contrasena == "") {
        mensaje.innerHTML = "Llena todos los campos";
        mensaje.style.color = "red";
        return;
    }

    if (contrasena.length < 6) {
        mensaje.innerHTML = "La contraseña debe tener minimo 6 caracteres";
        mensaje.style.color = "red";
        return;
    }

    try {
        // mandamos los datos al servidor
        let respuesta = await fetch(API + "/registro", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre: nombre, usuario: usuario, contrasena: contrasena })
        });
        let datos = await respuesta.json();

        if (datos.ok) {
            alert("Cuenta creada, ahora inicia sesion");
            window.location.href = "login.html";
        } else {
            mensaje.innerHTML = datos.mensaje;
            mensaje.style.color = "red";
        }
    } catch (error) {
        mensaje.innerHTML = "No se pudo conectar con el servidor";
        mensaje.style.color = "red";
    }
}

// iniciar sesion
async function ingresar() {
    let usuario = document.getElementById("usuario").value;
    let contrasena = document.getElementById("contrasena").value;
    let mensaje = document.getElementById("mensaje");

    if (usuario == "" || contrasena == "") {
        mensaje.innerHTML = "Llena todos los campos";
        mensaje.style.color = "red";
        return;
    }

    try {
        let respuesta = await fetch(API + "/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ usuario: usuario, contrasena: contrasena })
        });
        let datos = await respuesta.json();

        if (datos.ok) {
            // guardamos la sesion en el navegador
            localStorage.setItem("sesion", datos.nombre);
            localStorage.setItem("usuarioActual", datos.usuario);
            localStorage.setItem("rol", datos.rol);
            window.location.href = "menu.html";
        } else {
            mensaje.innerHTML = datos.mensaje;
            mensaje.style.color = "red";
        }
    } catch (error) {
        mensaje.innerHTML = "No se pudo conectar con el servidor";
        mensaje.style.color = "red";
    }
}

// recuperar contraseña
async function recuperar() {
    let usuario = document.getElementById("usuario").value;
    let nueva = document.getElementById("nueva").value;
    let confirmar = document.getElementById("confirmar").value;
    let mensaje = document.getElementById("mensaje");

    if (usuario == "" || nueva == "" || confirmar == "") {
        mensaje.innerHTML = "Llena todos los campos";
        mensaje.style.color = "red";
        return;
    }

    if (nueva != confirmar) {
        mensaje.innerHTML = "Las contraseñas no son iguales";
        mensaje.style.color = "red";
        return;
    }

    if (nueva.length < 6) {
        mensaje.innerHTML = "La contraseña debe tener minimo 6 caracteres";
        mensaje.style.color = "red";
        return;
    }

    try {
        let respuesta = await fetch(API + "/usuarios/" + usuario + "/contrasena", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nueva: nueva })
        });
        let datos = await respuesta.json();

        if (datos.ok) {
            alert("Contraseña cambiada");
            window.location.href = "login.html";
        } else {
            mensaje.innerHTML = datos.mensaje;
            mensaje.style.color = "red";
        }
    } catch (error) {
        mensaje.innerHTML = "No se pudo conectar con el servidor";
        mensaje.style.color = "red";
    }
}

// si no ha iniciado sesion lo manda al login
function verificarSesion() {
    if (localStorage.getItem("sesion") == null) {
        window.location.href = "login.html";
    }
}

// para el menu
function saludar() {
    document.getElementById("saludo").innerHTML = "Hola, " + localStorage.getItem("sesion");
}

// opcion 8 salir
function salir() {
    localStorage.removeItem("sesion");
    localStorage.removeItem("usuarioActual");
    localStorage.removeItem("rol");
    window.location.href = "index.html";
}


// ------------------ GUARDAR CALCULOS EN EL BACKEND ------------------

// la usan todas las calculadoras despues de calcular
async function guardarCalculo(tipo, datos, resultados) {
    try {
        await fetch(API + "/calculos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                usuario: localStorage.getItem("usuarioActual"),
                tipo: tipo,
                datos: datos,
                resultados: resultados
            })
        });
    } catch (error) {
        // si falla el guardado igual se muestra el resultado en pantalla
        console.log("No se pudo guardar el calculo");
    }
}


// ------------------ HISTORIAL (historial.html) ------------------

// trae los calculos del usuario y los pinta en una tabla
async function cargarHistorial() {
    let cuerpo = document.getElementById("cuerpoTabla");
    let mensaje = document.getElementById("mensaje");
    let usuario = localStorage.getItem("usuarioActual");

    try {
        let respuesta = await fetch(API + "/calculos/" + usuario);
        let datos = await respuesta.json();

        if (!datos.ok) {
            mensaje.innerHTML = datos.mensaje;
            mensaje.style.color = "red";
            return;
        }

        cuerpo.innerHTML = "";

        if (datos.calculos.length == 0) {
            mensaje.innerHTML = "Todavia no has hecho calculos";
            return;
        }
        mensaje.innerHTML = "";

        for (let i = 0; i < datos.calculos.length; i++) {
            let c = datos.calculos[i];
            cuerpo.innerHTML += "<tr>" +
                "<td>" + c.id + "</td>" +
                "<td>" + c.fecha + "</td>" +
                "<td>" + c.usuario + "</td>" +
                "<td>" + c.tipo + "</td>" +
                "<td>" + textoDe(c.datos) + "</td>" +
                "<td>" + textoDe(c.resultados) + "</td>" +
                "<td><button onclick='borrarCalculo(" + c.id + ")'>Borrar</button></td>" +
                "</tr>";
        }
    } catch (error) {
        mensaje.innerHTML = "No se pudo conectar con el servidor";
        mensaje.style.color = "red";
    }
}

// convierte un objeto {a: 1, b: 2} en el texto "a: 1, b: 2"
function textoDe(objeto) {
    let texto = "";
    for (let clave in objeto) {
        texto += clave + ": " + objeto[clave] + "<br>";
    }
    return texto;
}

// borrar un calculo del historial
async function borrarCalculo(id) {
    if (!confirm("¿Seguro que quieres borrar este calculo?")) {
        return;
    }

    let usuario = localStorage.getItem("usuarioActual");

    try {
        await fetch(API + "/calculos/" + id + "?usuario=" + usuario, {
            method: "DELETE"
        });
        cargarHistorial(); // volvemos a pintar la tabla
    } catch (error) {
        alert("No se pudo borrar");
    }
}


// ------------------ SUPERFICIE Y VOLUMEN (los usan las calculadoras) ------------------

function calcularSuperficie(ancho, largo) {
    return ancho * largo;
}

function calcularVolumen(espesor, ancho, largo) {
    return espesor * ancho * largo;
}


// ------------------ CALCULADORAS ------------------
// Todas hacen lo mismo que en la Parte 2 y al final llaman guardarCalculo()

// 1 muro
function calcularMuro() {
    let largo = parseFloat(document.getElementById("largo").value);
    let alto = parseFloat(document.getElementById("alto").value);
    let mensaje = document.getElementById("mensaje");

    if (isNaN(largo) || isNaN(alto) || largo <= 0 || alto <= 0) {
        mensaje.innerHTML = "Pon numeros mayores a 0";
        mensaje.style.color = "red";
        return;
    }
    mensaje.innerHTML = "";

    let superficie = calcularSuperficie(largo, alto);
    let cemento;
    let arena;
    let ladrillos;
    let espesor;

    if (document.getElementById("espesor30").checked) {
        espesor = "30 cm";
        cemento = superficie * 15.2;
        arena = superficie * 0.115;
        ladrillos = superficie * 120;
    } else {
        espesor = "20 cm";
        cemento = superficie * 10.9;
        arena = superficie * 0.09;
        ladrillos = superficie * 90;
    }

    document.getElementById("resSuperficie").innerHTML = superficie.toFixed(2);
    document.getElementById("resCemento").innerHTML = cemento.toFixed(2);
    document.getElementById("resArena").innerHTML = arena.toFixed(2);
    document.getElementById("resLadrillos").innerHTML = Math.ceil(ladrillos);

    guardarCalculo("muro",
        { espesor: espesor, largo: largo, alto: alto },
        {
            superficie_m2: superficie.toFixed(2),
            cemento_kg: cemento.toFixed(2),
            arena_m3: arena.toFixed(2),
            ladrillos: Math.ceil(ladrillos)
        });
}

// 2 viga
function calcularViga() {
    let largo = parseFloat(document.getElementById("largo").value);
    let mensaje = document.getElementById("mensaje");

    if (isNaN(largo) || largo <= 0) {
        mensaje.innerHTML = "Pon un numero mayor a 0";
        mensaje.style.color = "red";
        return;
    }
    mensaje.innerHTML = "";

    let cemento = largo * 9;
    let arena = largo * 0.02;
    let piedra = largo * 0.02;
    let hierro8 = largo * 4;
    let hierro4 = largo * 3;

    document.getElementById("resCemento").innerHTML = cemento.toFixed(2);
    document.getElementById("resArena").innerHTML = arena.toFixed(2);
    document.getElementById("resPiedra").innerHTML = piedra.toFixed(2);
    document.getElementById("resHierro8").innerHTML = hierro8.toFixed(2);
    document.getElementById("resHierro4").innerHTML = hierro4.toFixed(2);

    guardarCalculo("viga",
        { largo: largo },
        {
            cemento_kg: cemento.toFixed(2),
            arena_m3: arena.toFixed(2),
            piedra_m2: piedra.toFixed(2),
            hierro_8_m: hierro8.toFixed(2),
            hierro_4_m: hierro4.toFixed(2)
        });
}

// 3 columna
function calcularColumna() {
    let largo = parseFloat(document.getElementById("largo").value);
    let mensaje = document.getElementById("mensaje");

    if (isNaN(largo) || largo <= 0) {
        mensaje.innerHTML = "Pon un numero mayor a 0";
        mensaje.style.color = "red";
        return;
    }
    mensaje.innerHTML = "";

    let cemento = largo * 7.5;
    let arena = largo * 0.016;
    let piedra = largo * 0.016;
    let hierro10 = largo * 6;
    let hierro4 = largo * 3;

    document.getElementById("resCemento").innerHTML = cemento.toFixed(2);
    document.getElementById("resArena").innerHTML = arena.toFixed(2);
    document.getElementById("resPiedra").innerHTML = piedra.toFixed(2);
    document.getElementById("resHierro10").innerHTML = hierro10.toFixed(2);
    document.getElementById("resHierro4").innerHTML = hierro4.toFixed(2);

    guardarCalculo("columna",
        { largo: largo },
        {
            cemento_kg: cemento.toFixed(2),
            arena_m3: arena.toFixed(2),
            piedra_m2: piedra.toFixed(2),
            hierro_10_m: hierro10.toFixed(2),
            hierro_4_m: hierro4.toFixed(2)
        });
}

// 4 contrapiso
function calcularContrapiso() {
    let espesor = parseFloat(document.getElementById("espesor").value);
    let ancho = parseFloat(document.getElementById("ancho").value);
    let largo = parseFloat(document.getElementById("largo").value);
    let mensaje = document.getElementById("mensaje");

    if (isNaN(espesor) || isNaN(ancho) || isNaN(largo) || espesor <= 0 || ancho <= 0 || largo <= 0) {
        mensaje.innerHTML = "Pon numeros mayores a 0";
        mensaje.style.color = "red";
        return;
    }
    mensaje.innerHTML = "";

    let volumen = calcularVolumen(espesor, ancho, largo);
    let cemento = volumen * 105;
    let arena = volumen * 0.45;
    let piedra = volumen * 0.9;

    document.getElementById("resCemento").innerHTML = cemento.toFixed(2);
    document.getElementById("resArena").innerHTML = arena.toFixed(2);
    document.getElementById("resPiedra").innerHTML = piedra.toFixed(2);

    guardarCalculo("contrapiso",
        { espesor: espesor, ancho: ancho, largo: largo },
        {
            volumen_m3: volumen.toFixed(2),
            cemento_kg: cemento.toFixed(2),
            arena_m3: arena.toFixed(2),
            piedra_m3: piedra.toFixed(2)
        });
}

// 5 techo
function calcularTecho() {
    let espesor = parseFloat(document.getElementById("espesor").value);
    let ancho = parseFloat(document.getElementById("ancho").value);
    let largo = parseFloat(document.getElementById("largo").value);
    let mensaje = document.getElementById("mensaje");

    if (isNaN(espesor) || isNaN(ancho) || isNaN(largo) || espesor <= 0 || ancho <= 0 || largo <= 0) {
        mensaje.innerHTML = "Pon numeros mayores a 0";
        mensaje.style.color = "red";
        return;
    }
    mensaje.innerHTML = "";

    // el pdf lo da por m2
    let superficie = calcularSuperficie(ancho, largo);
    let cemento = superficie * 33;
    let arena = superficie * 0.072;
    let piedra = superficie * 0.072;
    let hierro8 = superficie * 7;
    let hierro6 = superficie * 4;

    document.getElementById("resCemento").innerHTML = cemento.toFixed(2);
    document.getElementById("resArena").innerHTML = arena.toFixed(2);
    document.getElementById("resPiedra").innerHTML = piedra.toFixed(2);
    document.getElementById("resHierro8").innerHTML = hierro8.toFixed(2);
    document.getElementById("resHierro6").innerHTML = hierro6.toFixed(2);

    guardarCalculo("techo",
        { espesor: espesor, ancho: ancho, largo: largo },
        {
            superficie_m2: superficie.toFixed(2),
            cemento_kg: cemento.toFixed(2),
            arena_m3: arena.toFixed(2),
            piedra_m3: piedra.toFixed(2),
            hierro_8_m: hierro8.toFixed(2),
            hierro_6_m: hierro6.toFixed(2)
        });
}

// 6 piso
function calcularPiso() {
    let ancho = parseFloat(document.getElementById("ancho").value);
    let largo = parseFloat(document.getElementById("largo").value);
    let mensaje = document.getElementById("mensaje");

    if (isNaN(ancho) || isNaN(largo) || ancho <= 0 || largo <= 0) {
        mensaje.innerHTML = "Pon numeros mayores a 0";
        mensaje.style.color = "red";
        return;
    }
    mensaje.innerHTML = "";

    let superficie = calcularSuperficie(ancho, largo);
    // mas el 10% por los recortes
    let total = superficie + superficie * 0.10;

    document.getElementById("resPiso").innerHTML = total.toFixed(2);

    guardarCalculo("piso",
        { ancho: ancho, largo: largo },
        {
            superficie_m2: superficie.toFixed(2),
            total_con_10_por_ciento_m2: total.toFixed(2)
        });
}

// 7 pintura
function calcularPintura() {
    let superficie = parseFloat(document.getElementById("superficie").value);
    let mensaje = document.getElementById("mensaje");

    if (isNaN(superficie) || superficie <= 0) {
        mensaje.innerHTML = "Pon un numero mayor a 0";
        mensaje.style.color = "red";
        return;
    }
    mensaje.innerHTML = "";

    // 1 litro rinde 6 m2
    let litros = superficie / 6;

    document.getElementById("resPintura").innerHTML = litros.toFixed(2);

    guardarCalculo("pintura",
        { superficie_m2: superficie },
        { pintura_litros: litros.toFixed(2) });
}
