# INSTRUCCIONES DE INSTALACIÓN - VendSave

## ⚠️ IMPORTANTE: Node.js no está instalado en este sistema

Para poder ejecutar este proyecto, necesitas instalar Node.js primero.

### PASO 1: Instalar Node.js

1. Descarga Node.js LTS desde: https://nodejs.org/
   - Selecciona la versión "LTS (Recommended For Most Users)"
   - Descarga el instalador para Windows (.msi)

2. Ejecuta el instalador descargado
   - Acepta los términos de licencia
   - Mantén las opciones por defecto
   - **IMPORTANTE:** Asegúrate de marcar "Add to PATH"
   - Completa la instalación

3. **Reinicia PowerShell** para que los cambios tomen efecto

4. Verifica la instalación abriendo PowerShell y ejecutando:
   ```powershell
   node --version
   npm --version
   ```
   Deberías ver algo como:
   ```
   v20.x.x
   10.x.x
   ```

### PASO 2: Instalar MongoDB

1. Descarga MongoDB Community desde: https://www.mongodb.com/try/download/community
   - Selecciona la versión para Windows
   - Tipo de paquete: msi

2. Ejecuta el instalador
   - Selecciona "Complete" installation
   - **IMPORTANTE:** Marca "Install MongoDB as a Service"
   - Mantén el puerto por defecto (27017)
   - Completa la instalación

3. Verifica que el servicio esté corriendo:
   ```powershell
   Get-Service MongoDB
   ```

### PASO 3: Instalar dependencias globales

```powershell
npm install -g @angular/cli @nestjs/cli
```

### PASO 4: Instalar dependencias del proyecto

Desde la carpeta raíz del proyecto (vendsave):

```powershell
# Instalar todo de una vez
npm run install:all
```

O paso por paso:
```powershell
# 1. Dependencias raíz
npm install

# 2. Backend
cd backend
npm install
cd ..

# 3. Frontend
cd frontend
npm install
cd ..
```

### PASO 5: Crear aplicación Angular

El proyecto Angular necesita ser creado con Angular CLI:

```powershell
# Desde la raíz del proyecto
ng new frontend --routing --style=scss --skip-git
```

Cuando pregunte:
- "Would you like to enable Server-Side Rendering?" → **No**
- "Would you like to add Angular Material?" → **Yes**
- Tema: Selecciona el que prefieras (recomendado: Indigo/Pink)
- Tipografía global: **Yes**
- Animaciones: **Include**

### PASO 6: Ejecutar en modo desarrollo

```powershell
npm run dev
```

Esto iniciará:
- ✅ Backend NestJS en http://localhost:3000
- ✅ Frontend Angular en http://localhost:4200  
- ✅ Aplicación Electron

---

## Resumen de comandos después de instalar Node.js

```powershell
# 1. Verificar Node.js instalado
node --version
npm --version

# 2. Instalar CLIs globales
npm install -g @angular/cli @nestjs/cli

# 3. Instalar dependencias del proyecto
npm run install:all

# 4. Crear app Angular (SOLO LA PRIMERA VEZ)
ng new frontend --routing --style=scss --skip-git

# 5. Ejecutar en desarrollo
npm run dev
```

---

## Si encuentras errores

### Error: "npm no se reconoce"
→ Reinstala Node.js y asegúrate de reiniciar PowerShell

### Error: "MongoDB connection failed"
→ Verifica que MongoDB esté corriendo: `Get-Service MongoDB`
→ Si está detenido: `Start-Service MongoDB`

### Error: Puerto 3000 o 4200 en uso
→ Cierra otras aplicaciones que usen esos puertos
→ O edita los archivos de configuración para cambiar el puerto

---

## Estructura después de la instalación

```
vendsave/
├── node_modules/          ✅ (después de npm install)
├── backend/
│   ├── node_modules/      ✅ (después de npm run install:backend)
│   └── src/               ✅ (ya está creado)
├── frontend/
│   ├── node_modules/      ✅ (después de npm run install:frontend)
│   └── src/               ✅ (después de ng new frontend)
├── electron/              ✅ (ya está creado)
├── package.json           ✅
└── README.md              ✅
```

---

## Próximos pasos después de la instalación

1. El backend ya está completo con todos los endpoints
2. Necesitas ejecutar `ng new frontend` para crear la app Angular
3. Luego se implementarán los componentes Angular según el plan
4. Finalmente se integrará todo con Electron

---

**¿Necesitas ayuda?** Consulta el README.md para más detalles.
