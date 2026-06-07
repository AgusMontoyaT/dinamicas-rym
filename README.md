# DINAMICAS RICK Y MORTY
Agustina Montoya Tortosa - CFGS DAW - Curso 25/26

# Un juego web, exportable a .exe y .apk, perfecto para cuando te apetece jugar un poco ¡y competir contra tu mejor marca!

# TECNOLOGÍAS
- Frontend: Angular 21 (TypeScript, Bootstrap 5)
- Backend / Autenticación: Firebase
- Base de datos: Cloud Firestore (NoSQL)
- API externa: Rick and Morty API (pública, sin autenticación)
- Despliegue: Vercel

# BDD
- Firestore es NoSQL, no hay esquema relacional.
- puntuaciones.json: exportación de la colección "puntuaciones",
  donde cada documento representa una partida ganada por un usuario.
- firestore.rules: reglas de seguridad de lectura y escritura.
- Los datos de usuario (correo, contraseña) los gestiona Firebase Authentication, no se exportan en esta carpeta.


# INSTRUCCIONES DE DESPLIEGUE DE LA APLICACIÓN

# ACCESO PÚBLICO SIN INSTALAR NADA
La aplicación está completamente funcional y accesible en línea en:
https://dinamicas-ry-m.vercel.app

- Pueden crear una nueva cuenta con su correo electrónico
- O usar las credenciales de demostración:
  • Email: prueba@prueba.com
  • Contraseña: prueba123!

# EJECUTAR EN LOCAL
Requisitos previos:
1. Node.js v20 LTS o superior
2. npm v11 o superior
3. Git (para clonar el repositorio)
4. Angular CLI 21

Nota importante sobre Firebase:
La configuración de Firebase ya está incluida en el proyecto. NO es necesario crear una cuenta de Firebase ni configurar nada en la consola de Firebase para ejecutar la aplicación en local. Las credenciales necesarias ya están en el archivo src/app/firebase.config.ts.


# Pasos:
1. Abrir una terminal
2. Clonar el repositorio:
   git clone https://github.com/AgusMontoyaT/dinamicas-rym.git
3. Entrar en la carpeta del proyecto:
   cd nombre-de-la-carpeta
4. Instalar las dependencias del proyecto:
   npm install --legacy-peer-deps
      (El flag --legacy-peer-deps es OBLIGATORIO. Sin él, npm dará errores. Esto ocurre porque el proyecto usa @angular/fire en versión que tiene conflictos de compatibilidad. Este es un problema porque Angular 21 todavía es muy reciente.)
5. Iniciar el servidor de desarrollo:
   ng serve
7. Abrir el navegador en http://localhost:4200

# SOLUCIÓN DE PROBLEMAS COMUNES

Si aparece el error "npm ERR! code ERESOLVE":
- Usar el flag --legacy-peer-deps: npm install --legacy-peer-deps
Si el puerto 4200 está en uso:
- Usar otro puerto: ng serve --port 4300
Si git no reconoce https://localhost:4200:
- Escribir la URL sin https: http://localhost:4200
Si falta Angular CLI:
- Instalar globalmente: npm install -g @angular/cli@21
- O usar npx: npx ng serve