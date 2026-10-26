// BACKEND - Calculadora de materiales de construccion
// Servidor con Node.js + Express. Guarda todo en un archivo JSON (datos/db.json)

const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PUERTO = 3000;
const ARCHIVO_DB = path.join(__dirname, "datos", "db.json");

// Para poder leer el JSON que manda el frontend con fetch
app.use(express.json());

// El servidor tambien muestra el frontend (carpeta ../frontend)
app.use(express.static(path.join(__dirname, "..", "frontend")));


// ------------------ FUNCIONES PARA LA "BASE DE DATOS" JSON ------------------

// lee el archivo y lo convierte en objeto de JavaScript
function leerDB() {
    let texto = fs.readFileSync(ARCHIVO_DB, "utf8");
    return JSON.parse(texto);
}

// guarda el objeto de vuelta en el archivo
function guardarDB(db) {
    fs.writeFileSync(ARCHIVO_DB, JSON.stringify(db, null, 2));
}

// la contraseña no se guarda tal cual, se guarda "revuelta" (hash)
function encriptar(contrasena) {
    return crypto.createHash("sha256").update(contrasena).digest("hex");
}

// busca un usuario por su nombre de usuario
function buscarUsuario(db, usuario) {
    return db.usuarios.find(function (u) {
        return u.usuario == usuario;
    });
}


// ------------------ USUARIOS ------------------

// CREAR usuario (registro)
app.post("/api/registro", function (req, res) {
    let nombre = req.body.nombre;
    let usuario = req.body.usuario;
    let contrasena = req.body.contrasena;

    if (!nombre || !usuario || !contrasena) {
        return res.status(400).json({ ok: false, mensaje: "Llena todos los campos" });
    }
    if (contrasena.length < 6) {
        return res.status(400).json({ ok: false, mensaje: "La contraseña debe tener minimo 6 caracteres" });
    }

    let db = leerDB();

    if (buscarUsuario(db, usuario)) {
        return res.status(400).json({ ok: false, mensaje: "Ese usuario ya existe, escoge otro" });
    }

    db.usuarios.push({
        usuario: usuario,
        nombre: nombre,
        contrasena: encriptar(contrasena),
        rol: "usuario" // para volver admin a alguien se cambia a mano en db.json
    });
    guardarDB(db);

    res.json({ ok: true, mensaje: "Cuenta creada" });
});

// LEER usuario (login)
app.post("/api/login", function (req, res) {
    let usuario = req.body.usuario;
    let contrasena = req.body.contrasena;

    if (!usuario || !contrasena) {
        return res.status(400).json({ ok: false, mensaje: "Llena todos los campos" });
    }

    let db = leerDB();
    let encontrado = buscarUsuario(db, usuario);

    if (!encontrado || encontrado.contrasena != encriptar(contrasena)) {
        return res.status(401).json({ ok: false, mensaje: "Usuario o contraseña incorrectos" });
    }

    res.json({
        ok: true,
        usuario: encontrado.usuario,
        nombre: encontrado.nombre,
        rol: encontrado.rol
    });
});

// ACTUALIZAR usuario (recuperar / cambiar contraseña)
app.put("/api/usuarios/:usuario/contrasena", function (req, res) {
    let usuario = req.params.usuario;
    let nueva = req.body.nueva;

    if (!nueva || nueva.length < 6) {
        return res.status(400).json({ ok: false, mensaje: "La contraseña debe tener minimo 6 caracteres" });
    }

    let db = leerDB();
    let encontrado = buscarUsuario(db, usuario);

    if (!encontrado) {
        return res.status(404).json({ ok: false, mensaje: "Ese usuario no existe" });
    }

    encontrado.contrasena = encriptar(nueva);
    guardarDB(db);

    res.json({ ok: true, mensaje: "Contraseña cambiada" });
});


// ------------------ CALCULOS ------------------

// CREAR calculo (se llama cada vez que el usuario calcula algo)
app.post("/api/calculos", function (req, res) {
    let usuario = req.body.usuario;
    let tipo = req.body.tipo;           // "muro", "viga", etc.
    let datos = req.body.datos;         // lo que escribio el usuario
    let resultados = req.body.resultados; // lo que dio la calculadora

    let db = leerDB();

    if (!buscarUsuario(db, usuario)) {
        return res.status(404).json({ ok: false, mensaje: "Ese usuario no existe" });
    }
    if (!tipo || !datos || !resultados) {
        return res.status(400).json({ ok: false, mensaje: "Faltan datos del calculo" });
    }

    // el id nuevo es el ultimo id + 1
    let nuevoId = 1;
    if (db.calculos.length > 0) {
        nuevoId = db.calculos[db.calculos.length - 1].id + 1;
    }

    db.calculos.push({
        id: nuevoId,
        usuario: usuario,
        tipo: tipo,
        datos: datos,
        resultados: resultados,
        fecha: new Date().toLocaleString("es-CO")
    });
    guardarDB(db);

    res.json({ ok: true, id: nuevoId });
});

// LEER calculos de un usuario (historial)
// si el usuario es admin ve los de todos
app.get("/api/calculos/:usuario", function (req, res) {
    let usuario = req.params.usuario;
    let db = leerDB();
    let encontrado = buscarUsuario(db, usuario);

    if (!encontrado) {
        return res.status(404).json({ ok: false, mensaje: "Ese usuario no existe" });
    }

    let lista;
    if (encontrado.rol == "admin") {
        lista = db.calculos;
    } else {
        lista = db.calculos.filter(function (c) {
            return c.usuario == usuario;
        });
    }

    res.json({ ok: true, calculos: lista });
});

// BORRAR un calculo
app.delete("/api/calculos/:id", function (req, res) {
    let id = parseInt(req.params.id);
    let usuario = req.query.usuario; // quien pide borrar

    let db = leerDB();
    let quien = buscarUsuario(db, usuario);
    let calculo = db.calculos.find(function (c) {
        return c.id == id;
    });

    if (!quien || !calculo) {
        return res.status(404).json({ ok: false, mensaje: "No se encontro el calculo" });
    }

    // solo el dueño o un admin puede borrarlo
    if (calculo.usuario != usuario && quien.rol != "admin") {
        return res.status(403).json({ ok: false, mensaje: "No puedes borrar este calculo" });
    }

    db.calculos = db.calculos.filter(function (c) {
        return c.id != id;
    });
    guardarDB(db);

    res.json({ ok: true, mensaje: "Calculo borrado" });
});


// ------------------ ARRANCAR EL SERVIDOR ------------------
app.listen(PUERTO, function () {
    console.log("Servidor listo en http://localhost:" + PUERTO);
});
