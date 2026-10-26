CALCULADORA DE MATERIALES - PARTE 3 (Backend + JSON + CRUD)

COMO ARMAR EL PROYECTO
1. En tu proyecto deja dos carpetas: "backend" y "frontend".
2. Copia TODOS tus archivos de la Parte 2 (html, css, imagenes) dentro de "frontend".
3. Reemplaza el app.js de "frontend" por el app.js de esta entrega.
4. Pon historial.html en "frontend" y agrega en menu.html un enlace:
      <a href="historial.html">Ver historial</a>

COMO CORRERLO
1. Instala Node.js (https://nodejs.org) si no lo tienes.
2. Abre una terminal dentro de la carpeta "backend" y ejecuta:
      npm install
      node server.js
3. Abre el navegador en  http://localhost:3000   (NO abras los html con doble clic).

PARA PROBAR EL ROL ADMIN
Abre backend/datos/db.json y cambia  "rol": "usuario"  por  "rol": "admin"  en un usuario.
