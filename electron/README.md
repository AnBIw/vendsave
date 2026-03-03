# VendSave - Sistema de Gestión de Inventario y Ventas

Sistema de escritorio para gestionar inventario y ventas de repuestos de autos mediante escaneo de códigos de barras.

## Requisitos del Sistema

- **Node.js** 18+ y npm 9+
- **MongoDB Community** 6.0+ (instalado y corriendo localmente)
- **Angular CLI** 17+
- **NestJS CLI** 10+
- **Windows 10/11** (64-bit)
- 4 GB RAM mínimo
- 1 GB espacio en disco

## Instalación

### 1. Instalar Node.js

Descargar e instalar desde: https://nodejs.org/ (versión LTS recomendada)

Verificar instalación:
```powershell
node --version
npm --version
```

### 2. Instalar MongoDB

Descargar MongoDB Community desde: https://www.mongodb.com/try/download/community

Instalar y asegurarse de que el servicio está corriendo:
```powershell
# Verificar si MongoDB está corriendo
Get-Service MongoDB
```

### 3. Instalar Angular CLI y NestJS CLI globalmente

```powershell
npm install -g @angular/cli @nestjs/cli
```

### 4. Instalar dependencias del proyecto

En la raíz del proyecto:
```powershell
# Instalar dependencias raíz
npm install

# Instalar dependencias del backend
npm run install:backend

# Instalar dependencias del frontend
npm run install:frontend
```

O instalar todo de una vez:
```powershell
npm run install:all
```

## Desarrollo

### Iniciar en modo desarrollo

Esto iniciará automáticamente:
- Backend NestJS en http://localhost:3000
- Frontend Angular en http://localhost:4200
- Aplicación Electron

```powershell
npm run dev
```

### Iniciar servicios por separado

**Backend:**
```powershell
npm run dev:backend
```

**Frontend:**
```powershell
npm run dev:frontend
```

**Electron (después de que backend y frontend estén corriendo):**
```powershell
npm run dev:electron
```

## API Backend - Endpoints

### Products
```
POST   /products              - Crear producto
GET    /products              - Listar todos (query: search, tipo, limit, page)
GET    /products/low-stock    - Productos con bajo stock
GET    /products/count        - Contar total de productos
GET    /products/barcode/:code - Buscar por código de barras
GET    /products/:id          - Obtener por ID
PUT    /products/:id          - Actualizar producto
PATCH  /products/:id/stock    - Actualizar stock
DELETE /products/:id          - Eliminar producto
```

### Sales
```
POST   /sales                 - Crear venta (descuenta stock automáticamente)
GET    /sales                 - Listar ventas (query: startDate, endDate, limit, page)
GET    /sales/today           - Ventas del día
GET    /sales/top-products    - Productos más vendidos
GET    /sales/receipt/:numeroRecibo - Buscar por número de recibo
GET    /sales/:id             - Obtener venta por ID
GET    /sales/:id/receipt     - Descargar recibo en PDF
```

### Barcode
```
POST   /barcode/generate      - Generar código único (body: { tipo })
GET    /barcode/image/:code   - Obtener imagen PNG del código
```

## Estructura del Proyecto

```
vendsave/
├── backend/                    # NestJS API
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── database/
│   │   │   ├── schemas/        # Mongoose schemas
│   │   ├── modules/
│   │   │   ├── products/       # CRUD productos
│   │   │   ├── sales/          # Gestión ventas
│   │   │   └── barcode/        # Generación códigos
│   │   └── common/
│   │       └── services/
│   │           └── pdf.service.ts  # Generación PDFs
│   └── package.json
│
├── frontend/                   # Angular App
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/
│   │   │   │   └── services/   # API, Scanner, Electron
│   │   │   ├── shared/
│   │   │   │   ├── components/ # Componentes reutilizables
│   │   │   │   └── models/     # Interfaces TypeScript
│   │   │   └── features/
│   │   │       ├── dashboard/
│   │   │       ├── inventory/
│   │   │       ├── sales/
│   │   │       └── history/
│   │   └── styles/
│   └── package.json
│
├── electron/                   # Electron wrapper
│   ├── main.js                 # Proceso principal
│   └── preload.js              # Preload script
│
├── package.json                # Scripts raíz
└── electron-builder.json       # Configuración empaquetado
```

## Compilar para Producción

### Compilar Backend
```powershell
npm run build:backend
```
Genera archivos en `backend/dist/`

### Compilar Frontend
```powershell
npm run build:frontend
```
Genera archivos en `frontend/dist/`

### Generar Instalador Windows
```powershell
npm run build
```
Genera instalador `.exe` en carpeta `release/`

## Uso de la Aplicación

### Pistola Scanner
La aplicación detecta automáticamente la entrada de códigos de barras desde una pistola scanner USB (emula teclado). No requiere configuración adicional.

### Flujo de Trabajo

#### 1. Guardar Producto
- Navegar a "Guardar Producto"
- Escanear código de barras
- Si no existe: llenar formulario (nombre, marca, modelo, tipo, precio, cantidad)
- Si existe: actualizar cantidad
- Guardar

#### 2. Realizar Venta
- Navegar a "Vender"
- Escanear productos a vender
- Ajustar cantidades si es necesario
- Confirmar venta
- Descargar/imprimir recibo PDF

#### 3. Ver Inventario
- Navegar a "Inventario"
- Ver lista completa de productos
- Buscar y filtrar por tipo
- Editar o eliminar productos

#### 4. Consultar Historial
- Navegar a "Historial"
- Ver todas las ventas
- Filtrar por fecha
- Ver detalles y reimprimir recibos

## Solución de Problemas

### MongoDB no conecta
```powershell
# Verificar que el servicio está corriendo
Get-Service MongoDB

# Iniciar servicio si está detenido
Start-Service MongoDB
```

### Puerto 3000 o 4200 en uso
Cerrar las aplicaciones que estén usando esos puertos o cambiar los puertos en:
- Backend: `backend/src/main.ts` (línea del puerto)
- Frontend: `frontend/angular.json` (configuración del servidor dev)

### Dependencias no se instalan
```powershell
# Limpiar cache de npm
npm cache clean --force

# Eliminar node_modules y reinstalar
Remove-Item -Recurse -Force node_modules, backend\node_modules, frontend\node_modules
npm run install:all
```

## Tecnologías Utilizadas

- **Backend:** NestJS, MongoDB, Mongoose, bwip-js, pdfkit
- **Frontend:** Angular 17, Angular Material, Tailwind CSS
- **Desktop:** Electron
- **Validación:** class-validator, class-transformer

## Licencia

Uso privado - Todos los derechos reservados

## Soporte

Para reportar problemas o solicitar características, contactar al desarrollador.
