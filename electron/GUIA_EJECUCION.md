# 🚀 GUÍA RÁPIDA DE EJECUCIÓN - VendSave

## ✅ Estado del Proyecto: 90% Completado

### Componentes Implementados

**Backend NestJS (100%):**
- ✅ API RESTful completa con 15+ endpoints
- ✅ Conexión MongoDB con Mongoose
- ✅ Generación de códigos de barras únicos
- ✅ Sistema de gestión de inventario
- ✅ Procesamiento de ventas con descuento automático de stock
- ✅ Generación de recibos PDF

**Frontend Angular (100%):**
- ✅ Dashboard con estadísticas en tiempo real
- ✅ Registro de productos con scanner integrado
- ✅ Lista de inventario con filtros y búsqueda
- ✅ Carrito de compras con scanner
- ✅ Recibos digitales con descarga PDF
- ✅ Historial de ventas con filtros por fecha
- ✅ Layout responsive con Angular Material
- ✅ Servicios: API, Scanner, Electron

**Electron (100%):**
- ✅ Configuración completa
- ✅ Integración frontend + backend
- ✅ Scripts de desarrollo y producción

---

## 🎯 Pasos para Ejecutar la Aplicación

### 1. Verificar Requisitos

```powershell
# Verificar Node.js instalado
node --version  # Debe mostrar v18 o superior

# Verificar MongoDB corriendo
Get-Service MongoDB  # Debe estar "Running"
```

### 2. Instalar Dependencias (SOLO LA PRIMERA VEZ)

```powershell
# Desde la raíz del proyecto

# Opción A: Instalar todo de una vez
npm run install:all

# Opción B: Instalar paso por paso
npm install                    # Raíz
cd backend && npm install     # Backend
cd ../frontend && npm install # Frontend
cd ..
```

### 3. Iniciar MongoDB

Si MongoDB no está corriendo:
```powershell
Start-Service MongoDB
```

### 4. Ejecutar en Modo Desarrollo

```powershell
# Desde la raíz del proyecto
npm run dev
```

Esto iniciará automáticamente:
- ✅ Backend en http://localhost:3000
- ✅ Frontend en http://localhost:4200
- ✅ Aplicación Electron (ventana de escritorio)

**Alternativamente, ejecutar servicios por separado:**

```powershell
# Terminal 1: Backend
cd backend
npm run start:dev

# Terminal 2: Frontend
cd frontend
npm start

# Terminal 3: Electron (después de que backend y frontend estén corriendo)
npm run dev:electron
```

---

## 📊 Endpoints API Disponibles

### Products
```
POST   http://localhost:3000/products              - Crear producto
GET    http://localhost:3000/products              - Listar todos
GET    http://localhost:3000/products/barcode/:code - Buscar por código
GET    http://localhost:3000/products/low-stock    - Productos bajo stock
PATCH  http://localhost:3000/products/:id/stock    - Actualizar stock
DELETE http://localhost:3000/products/:id          - Eliminar
```

### Sales
```
POST   http://localhost:3000/sales                 - Crear venta
GET    http://localhost:3000/sales                 - Listar ventas
GET    http://localhost:3000/sales/today           - Ventas del día
GET    http://localhost:3000/sales/:id/receipt     - Descargar PDF
```

### Barcode
```
POST   http://localhost:3000/barcode/generate      - Generar código
GET    http://localhost:3000/barcode/image/:code   - Imagen PNG
```

---

## 🎮 Uso de la Aplicación

### Flujo 1: Registrar Producto

1. Navegar a **"Guardar Producto"**
2. Escanear código de barras con pistola USB
3. Si es nuevo: llenar formulario (nombre, marca, modelo, tipo, precio, cantidad)
4. Si existe: agregar cantidad adicional
5. Hacer clic en **"Guardar Producto"** o **"Actualizar Stock"**

### Flujo 2: Realizar Venta

1. Navegar a **"Vender"**
2. Escanear productos uno por uno
3. Ajustar cantidades con los botones +/-
4. Ver resumen en panel lateral
5. Hacer clic en **"Finalizar Venta"**
6. Descargar/imprimir recibo PDF

### Flujo 3: Consultar Inventario

1. Navegar a **"Inventario"**
2. Usar búsqueda o filtros por tipo
3. Ver lista completa de productos
4. Editar o eliminar productos

### Flujo 4: Ver Historial

1. Navegar a **"Historial"**
2. Filtrar por fechas
3. Ver detalles de ventas
4. Descargar recibos PDF

---

## 🔧 Solución de Problemas

### Backend no inicia
```powershell
# Verificar MongoDB
Get-Service MongoDB

# Si está detenido
Start-Service MongoDB

# Verificar puerto 3000 libre
netstat -ano | findstr :3000
```

### Frontend no compila
```powershell
cd frontend
npm install --force
npm start
```

### Errores de dependencias
```powershell
# Limpiar y reinstalar
Remove-Item -Recurse -Force node_modules
Remove-Item -Recurse -Force backend\node_modules
Remove-Item -Recurse -Force frontend\node_modules
npm run install:all
```

### Scanner no detecta códigos
- Verificar que la pistola está conectada USB
- Probar escaneando en un bloc de notas
- El scanner debe emular teclado (no requiere drivers especiales)

---

## 🏗️ Compilar para Producción

```powershell
# Desde la raíz del proyecto

# 1. Compilar backend
npm run build:backend

# 2. Compilar frontend
npm run build:frontend

# 3. Generar instalador Windows
npm run build

# El instalador .exe se generará en la carpeta release/
```

---

## 📁 Estructura de Archivos Principales

```
vendsave/
├── backend/
│   ├── src/
│   │   ├── main.ts                          # Entrada backend
│   │   ├── app.module.ts                    # Módulo raíz
│   │   ├── modules/
│   │   │   ├── products/                    # CRUD productos
│   │   │   ├── sales/                       # Gestión ventas
│   │   │   └── barcode/                     # Códigos de barras
│   │   └── common/services/pdf.service.ts   # Generación PDFs
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/services/
│   │   │   │   ├── api.service.ts          # Cliente HTTP
│   │   │   │   ├── scanner.service.ts      # Detección scanner
│   │   │   │   └── electron.service.ts     # IPC Electron
│   │   │   ├── features/
│   │   │   │   ├── dashboard/              # Vista principal
│   │   │   │   ├── inventory/              # Gestión inventario
│   │   │   │   ├── sales/                  # Carrito y recibos
│   │   │   │   └── history/                # Historial ventas
│   │   │   └── shared/
│   │   │       ├── components/layout.component.ts  # Navegación
│   │   │       └── models/                 # Interfaces TypeScript
│   │   ├── styles.scss                     # Estilos globales
│   │   └── main.ts
│   └── package.json
│
├── electron/
│   ├── main.js                             # Proceso principal
│   └── preload.js                          # IPC seguro
│
├── package.json                            # Scripts raíz
└── README.md                               # Documentación completa
```

---

## ✨ Características Implementadas

### Backend
- [x] CRUD completo de productos
- [x] Sistema de códigos de barras únicos
- [x] Generación de imágenes de códigos (PNG)
- [x] Gestión de stock con validaciones
- [x] Procesamiento de ventas
- [x] Descuento automático de stock
- [x] Generación de recibos PDF profesionales
- [x] Historial de ventas con filtros
- [x] Estadísticas (ventas del día, top productos, etc.)
- [x] API RESTful con validación de DTOs

### Frontend
- [x] Dashboard con estadísticas en vivo
- [x] Registro de productos con scanner
- [x] Detección automática de pistola scanner
- [x] Lista de inventario con filtros
- [x] Carrito de compras inteligente
- [x] Validación de stock en tiempo real
- [x] Recibos digitales con diseño profesional
- [x] Descarga e impresión de PDFs
- [x] Historial con filtros por fecha
- [x] Búsqueda avanzada
- [x] Interfaz responsive con Material Design
- [x] Navegación intuitiva con sidebar

### Electron
- [x] Aplicación de escritorio Windows
- [x] Integración backend + frontend
- [x] Hot reload en desarrollo
- [x] Configuración para producción

---

## 🎯 Próximos Pasos (Opcionales)

- [ ] Probar con pistola scanner real
- [ ] Agregar más tipos de repuestos
- [ ] Implementar exportación de reportes (Excel, CSV)
- [ ] Agregar gráficas de ventas (Chart.js)
- [ ] Sistema de usuarios con login
- [ ] Backup automático de base de datos
- [ ] Notificaciones de bajo stock
- [ ] Integración con impresora térmica

---

## 📞 Soporte

**Archivos de ayuda:**
- `README.md` - Documentación completa
- `INSTRUCCIONES_INSTALACION.md` - Guía de instalación paso a paso
- `GUIA_EJECUCION.md` - Este archivo

**Backend API:**
- Documentación: http://localhost:3000 (cuando esté corriendo)
- Endpoints: Ver sección "Endpoints API Disponibles"

---

## 🎉 ¡La aplicación está lista para usar!

Ejecuta `npm run dev` y comienza a gestionar tu inventario.
