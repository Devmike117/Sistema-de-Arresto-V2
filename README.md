# 🚔 Sistema Modular para la Gestión Operativa en Centros de Comando Municipal

<div align="center">

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-18.x-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.2.0-blue.svg)
![PostgreSQL](https://img.shields.io/badge/postgresql-15-blue.svg)

**Sistema integral de identificación biométrica y gestión de arrestos administrativos**

[Características](#características) • [Tecnologías](#tecnologías) • [Instalación](#instalación) • [Uso](#uso) • [Documentación](#documentación)

</div>

---

## 📋 Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Características Principales](#características-principales)
- [Arquitectura del Sistema](#arquitectura-del-sistema)
- [Tecnologías y Frameworks](#tecnologías-y-frameworks)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Uso](#uso)
- [API Endpoints](#api-endpoints)
- [Base de Datos](#base-de-datos)
- [Contribución](#contribución)
- [Licencia](#licencia)

---

## 🎯 Descripción General

Sistema modular diseñado para la gestión integral de arrestos administrativos en centros de comando municipal. Implementa tecnologías avanzadas de **identificación biométrica facial** y **captura de huellas dactilares**, proporcionando una solución completa para el registro, búsqueda y seguimiento de personas arrestadas.

### Módulos Principales

1. **🔍 Búsqueda Facial**: Reconocimiento facial en tiempo real utilizando DeepFace
2. **👤 Gestión de Personas**: Registro completo con datos personales y biométricos
3. **📝 Registro de Arrestos**: Captura de información administrativa y legal
4. **📊 Dashboard Analítico**: Visualización de estadísticas y métricas en tiempo real
5. **🔐 Control de Acceso**: Sistema de autenticación para administradores

---

## ✨ Características Principales

### 🎭 Identificación Biométrica

- ✅ **Reconocimiento Facial**: Búsqueda por foto con DeepFace (VGG-Face)
- ✅ **Captura Facial**: Cámara en tiempo real con guías visuales y countdown
- ✅ **Escaneo de Huellas**: Captura y almacenamiento de huellas dactilares
- ✅ **Validación en Tiempo Real**: Verificación instantánea de rostros

### 📋 Gestión de Datos

- ✅ **Registro Completo**: Datos personales, legales y biométricos
- ✅ **Firma Digital**: Canvas para firma del arrestado
- ✅ **Documentación PDF**: Generación automática de reportes
- ✅ **Historial de Arrestos**: Seguimiento completo por persona
- ✅ **Búsqueda Avanzada**: Filtros por nombre, ID, CURP, etc.

### 📊 Analytics y Reportes

- ✅ **Dashboard Interactivo**: Gráficos de barras y pastel con Chart.js
- ✅ **Filtros Temporales**: Por año, mes y día
- ✅ **Estadísticas en Tiempo Real**: Total de personas, arrestos, faltas
- ✅ **Exportación a Excel**: Descarga de datos en formato XLSX
- ✅ **Reportes Individuales**: Generación de documentos por persona

### 🎨 Interfaz de Usuario

- ✅ **Diseño Moderno**: Glassmorphism y gradientes
- ✅ **Responsive**: Adaptable a diferentes dispositivos
- ✅ **Material Symbols**: Iconografía consistente
- ✅ **Notificaciones**: Feedback visual de acciones
- ✅ **Animaciones**: Transiciones suaves y agradables

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React 18)                       │
│  ┌────────────┬────────────┬────────────┬─────────────┐    │
│  │  Búsqueda  │  Registro  │ Biometría  │  Dashboard  │    │
│  │   Facial   │  Personas  │  (Captura) │ (Analytics) │    │
│  └────────────┴────────────┴────────────┴─────────────┘    │
└─────────────────────────────────────────────────────────────┘
                           ↕ HTTP/REST API
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND (Node.js + Express)                │
│  ┌────────────┬────────────┬────────────┬─────────────┐    │
│  │  Persons   │  Register  │  Search    │  Dashboard  │    │
│  │   Routes   │   Routes   │  Routes    │   Routes    │    │
│  └────────────┴────────────┴────────────┴─────────────┘    │
└─────────────────────────────────────────────────────────────┘
            ↕ SQL Queries              ↕ HTTP Requests
┌──────────────────────┐      ┌──────────────────────────────┐
│  PostgreSQL Database │      │  Python FastAPI (DeepFace)   │
│  (Datos Principales) │      │  (Reconocimiento Facial)     │
└──────────────────────┘      └──────────────────────────────┘
```

### Flujo de Trabajo

1. **Usuario** → Interactúa con la interfaz React
2. **Frontend** → Envía peticiones al backend Node.js
3. **Backend** → Procesa datos y consulta PostgreSQL
4. **Python Service** → Analiza imágenes con DeepFace
5. **Respuesta** → Datos procesados regresan al frontend

---

## 🛠️ Tecnologías y Frameworks

### Frontend

| Tecnología | Versión | Uso |
|-----------|---------|-----|
| **React** | 18.2.0 | Framework principal de UI |
| **Chart.js** | 4.5.0 | Gráficos y visualizaciones |
| **react-chartjs-2** | 5.3.0 | Wrapper de Chart.js para React |
| **Axios** | 1.11.0 | Cliente HTTP |
| **XLSX** | 0.20.2 | Exportación a Excel |
| **QRCode.react** | 4.2.0 | Generación de códigos QR |
| **React Signature Canvas** | 1.1.0 | Canvas para firmas digitales |
| **Material Symbols** | Latest | Iconografía |

### Backend

| Tecnología | Versión | Uso |
|-----------|---------|-----|
| **Node.js** | 18.x | Entorno de ejecución |
| **Express** | 5.1.0 | Framework web |
| **PostgreSQL** | 15 | Base de datos relacional |
| **pg** | 8.16.3 | Cliente PostgreSQL |
| **Multer** | 2.0.2 | Manejo de archivos |
| **PDFKit** | 0.17.2 | Generación de PDFs |
| **bcrypt** | 6.0.0 | Encriptación de contraseñas |
| **CORS** | 2.8.5 | Manejo de CORS |
| **dotenv** | 17.2.2 | Variables de entorno |

### Python Services

| Tecnología | Uso |
|-----------|-----|
| **FastAPI** | Framework API RESTful |
| **DeepFace** | Reconocimiento facial |
| **TensorFlow/Keras** | Modelos de ML |
| **OpenCV** | Procesamiento de imágenes |

### DevOps & Herramientas

| Herramienta | Uso |
|------------|-----|
| **Docker** | Contenedorización |
| **Docker Compose** | Orquestación de servicios |
| **Git** | Control de versiones |
| **VS Code** | IDE principal |

---

## 📁 Estructura del Proyecto

```
Sistema-de-Arresto-V2/
│
├── 📂 frontend/                    # Aplicación React
│   ├── 📂 public/                  # Archivos públicos
│   │   ├── index.html
│   │   └── 📂 pdf/                 # PDFs de avisos legales
│   ├── 📂 src/
│   │   ├── App.js                  # Componente principal
│   │   ├── index.js                # Punto de entrada
│   │   ├── styles.js               # Estilos globales
│   │   └── 📂 components/          # Componentes React
│   │       ├── Dashboard.js        # Dashboard analítico
│   │       ├── RegisterForm.js     # Formulario de registro
│   │       ├── FacialCapture.js    # Captura facial
│   │       ├── FacialSearch.js     # Búsqueda facial
│   │       ├── FingerprintScan.js  # Escaneo de huellas
│   │       ├── SearchPeople.js     # Búsqueda de personas
│   │       ├── Login.js            # Login de admin
│   │       ├── DashboardModal.js   # Modales del dashboard
│   │       ├── PersonReport.js     # Reportes individuales
│   │       ├── Notification.js     # Sistema de notificaciones
│   │       └── Loader.js           # Pantalla de carga
│   └── package.json                # Dependencias frontend
│
├── 📂 backend/                     # Servidor Node.js
│   ├── app.js                      # Aplicación Express
│   ├── db.js                       # Conexión PostgreSQL
│   ├── 📂 routes/                  # Rutas API
│   │   ├── persons.js              # CRUD de personas
│   │   ├── register.js             # Registro de arrestos
│   │   ├── register_arrest.js      # Arrestos administrativos
│   │   ├── search_face.js          # Búsqueda facial
│   │   ├── dashboard.js            # Estadísticas
│   │   ├── stats.js                # Métricas
│   │   └── files.js                # Manejo de archivos
│   ├── 📂 uploads/                 # Archivos subidos
│   │   ├── 📂 photos/              # Fotos faciales
│   │   ├── 📂 fingerprints/        # Huellas dactilares
│   │   ├── 📂 signatures/          # Firmas digitales
│   │   └── 📂 temp/                # Archivos temporales
│   ├── 📂 python/                  # Servicios Python
│   │   └── deepface_service.py     # Servicio de DeepFace
│   └── package.json                # Dependencias backend
│
├── 📂 docs/                        # Documentación
│   ├── ESTRUCTURA_CODIGO.md        # Guía de estructura
│   └── api/                        # Documentación API
│
├── docker-compose.yml              # Configuración Docker
├── package.json                    # Dependencias globales
├── requirements.txt                # Dependencias Python
└── README.md                       # Este archivo
```

---

## 📋 Requisitos Previos

Antes de instalar, asegúrate de tener:

- ✅ **Node.js** >= 18.x
- ✅ **npm** >= 9.x o **yarn** >= 1.22.x
- ✅ **Python** >= 3.8
- ✅ **PostgreSQL** >= 15
- ✅ **Docker** (opcional, pero recomendado)
- ✅ **Git** para clonar el repositorio

### Verificar Instalaciones

```bash
node --version    # v18.x o superior
npm --version     # 9.x o superior
python --version  # 3.8 o superior
psql --version    # 15 o superior
docker --version  # (opcional)
```

---

## 🚀 Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/Devmike117/Sistema-de-Arresto-V2.git
cd Sistema-de-Arresto-V2
```

### 2. Instalar Dependencias del Frontend

```bash
cd frontend
npm install
# o
yarn install
```

### 3. Instalar Dependencias del Backend

```bash
cd ../backend
npm install
# o
yarn install
```

### 4. Instalar Dependencias de Python

```bash
pip install -r requirements.txt
# o
pip install fastapi uvicorn deepface tensorflow opencv-python
```

### 5. Configurar Base de Datos (Docker)

```bash
# En la raíz del proyecto
docker-compose up -d
```

Esto creará automáticamente:
- ✅ Contenedor PostgreSQL en puerto 5432
- ✅ Base de datos `arrest_registry`
- ✅ Usuario: `admin` / Contraseña: `admin123`

### 6. Crear Tablas en la Base de Datos

Conectarse a PostgreSQL y ejecutar el schema:

```bash
psql -h localhost -U admin -d arrest_registry -f backend/schema.sql
```

O manualmente:

```sql
-- Ver estructura_basede datos.txt para el schema completo
```

---

## ⚙️ Configuración

### Variables de Entorno

Crear archivo `.env` en la carpeta `backend/`:

```env
# Base de Datos
DB_HOST=localhost
DB_PORT=puerto
DB_USER=nombredetudb
DB_PASSWORD=contraseñabd
DB_NAME=nombredetabla

# Servidor
PORT=5000
NODE_ENV=development

# Python Service
DEEPFACE_API_URL=http://localhost:8001

# Seguridad (opcional)
JWT_SECRET=tu_clave_secreta_aqui
```

### Configuración de Puertos

| Servicio | Puerto | URL |
|---------|--------|-----|
| Frontend | 3000 | http://localhost:3000 |
| Backend | 5000 | http://localhost:5000 |
| PostgreSQL | 5432 | localhost:5432 |
| DeepFace API | 8001 | http://localhost:8001 |

---

## 🎮 Uso

### Iniciar el Sistema Completo

**Terminal 1 - Backend:**
```bash
cd backend
node app.js
# Servidor corriendo en http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
# Aplicación abierta en http://localhost:3000
```

**Terminal 3 - Servicio Python (DeepFace):**
```bash
cd backend/python
uvicorn deepface_service:app --reload --port 8001
# API disponible en http://localhost:8001
```

### Scripts Disponibles

**Frontend:**
```bash
npm start      # Iniciar en modo desarrollo
npm build      # Compilar para producción
npm test       # Ejecutar tests
```

**Backend:**
```bash
node app.js    # Iniciar servidor
npm test       # Ejecutar tests (si están configurados)
```

---

## 🔌 API Endpoints

### Personas

```http
GET    /api/persons              # Listar todas las personas
GET    /api/persons/:id          # Obtener persona por ID
POST   /api/persons              # Crear nueva persona
PUT    /api/persons/:id          # Actualizar persona
DELETE /api/persons/:id          # Eliminar persona
GET    /api/persons/search       # Buscar personas
```

### Registro de Arrestos

```http
POST   /api/register             # Registrar nuevo arresto
POST   /api/register-arrest      # Registrar arresto administrativo
GET    /api/arrests/:personId    # Historial de arrestos
```

### Búsqueda Facial

```http
POST   /api/search-face          # Buscar persona por foto
POST   /api/facial-search        # Búsqueda avanzada facial
```

### Dashboard

```http
GET    /api/dashboard/stats      # Estadísticas generales
GET    /api/dashboard/recent-arrests  # Arrestos recientes
GET    /api/dashboard/top-offenses    # Faltas más comunes
```

### Archivos

```http
GET    /api/files/photo/:filename      # Obtener foto
GET    /api/files/fingerprint/:filename # Obtener huella
POST   /api/files/upload               # Subir archivo
```

**Ejemplo de Petición:**

```javascript
// Búsqueda por nombre
const response = await fetch('http://localhost:5000/api/persons/search?q=Elena');
const data = await response.json();
console.log(data);
```

---

## 🗄️ Base de Datos

### Diagrama ER

```
┌─────────────────┐       ┌──────────────────┐
│    persons      │───────│    arrests       │
├─────────────────┤  1:N  ├──────────────────┤
│ person_id (PK)  │       │ arrest_id (PK)   │
│ first_name      │       │ person_id (FK)   │
│ last_name       │       │ arrest_date      │
│ alias           │       │ falta_admin      │
│ dob             │       │ arrest_community │
│ gender          │       │ arresting_officer│
│ nationality     │       │ folio            │
│ state           │       │ sentencia        │
│ municipality    │       │ created_at       │
│ community       │       └──────────────────┘
│ id_number       │
│ photo_path      │
│ fingerprint_path│
│ signature_path  │
│ observaciones   │
│ created_at      │
└─────────────────┘
```

### Tablas Principales

**persons** - Información personal y biométrica
- `person_id`: ID único autoincrementable
- `first_name`: Nombre(s)
- `last_name`: Apellidos
- `alias`: Apodo o alias
- `dob`: Fecha de nacimiento
- `gender`: Género
- `photo_path`: Ruta de la foto facial
- `fingerprint_path`: Ruta de la huella

**arrests** - Registro de arrestos administrativos
- `arrest_id`: ID único del arresto
- `person_id`: Referencia a la persona
- `arrest_date`: Fecha y hora del arresto
- `falta_administrativa`: Tipo de falta
- `arrest_community`: Comunidad donde ocurrió
- `arresting_officer`: Oficial que realizó el arresto

---

## 👥 Uso del Sistema

### 1. Registro de Nueva Persona

1. Ir a **Registro** en el menú
2. Llenar datos personales (nombre, apellido, fecha de nacimiento, etc.)
3. Seleccionar falta administrativa
4. Leer y aceptar aviso de privacidad
5. Firmar en el canvas digital
6. Pasar a **Biometría**
7. Capturar foto facial (con countdown de 3 segundos)
8. Escanear huella dactilar
9. Hacer clic en **Registrar Persona**

### 2. Búsqueda de Personas

#### Búsqueda por Texto:
1. Ir a **Buscar Personas**
2. Escribir nombre, CURP o ID
3. Ver resultados en tabla
4. Hacer clic en "Ver Historial" para ver arrestos

#### Búsqueda Facial:
1. Ir a **Búsqueda Facial**
2. Subir una foto o tomar con cámara
3. El sistema buscará coincidencias
4. Ver resultados con porcentaje de similitud

### 3. Dashboard y Estadísticas

1. Hacer clic en **Administrador** (requiere login)
   - Usuario: `usuario@prueba.com`
   - Contraseña: `contraseña`
2. Acceder al **Dashboard**
3. Aplicar filtros por año/mes/día
4. Ver gráficos de:
   - Total de personas registradas
   - Total de arrestos
   - Faltas más comunes
   - Personas con más arrestos
5. Exportar a Excel o generar reportes PDF

---

## 📊 Características Técnicas

### Frontend (React)

- **Hooks**: useState, useEffect, useRef
- **Manejo de Estado**: Props y estado local
- **Routing**: SPA con navegación por secciones
- **API Calls**: Axios para peticiones HTTP
- **Canvas API**: Para firma digital y captura facial
- **Media Devices API**: Acceso a cámara web
- **Chart.js**: Gráficos interactivos de barras y pastel

### Backend (Node.js)

- **RESTful API**: Endpoints organizados por recursos
- **Middleware**: CORS, body-parser, multer
- **PostgreSQL**: Queries parametrizadas para seguridad
- **File Upload**: Manejo de imágenes y documentos
- **Error Handling**: Manejo centralizado de errores
- **Logging**: Console logs para debugging

### Seguridad

- ✅ Validación de datos en frontend y backend
- ✅ Queries parametrizadas (prevención SQL injection)
- ✅ CORS configurado correctamente
- ✅ Autenticación de administradores
- ✅ Encriptación de contraseñas con bcrypt
- ✅ Validación de tipos de archivo

---

## 🔧 Solución de Problemas

### Error: "Cannot connect to database"

```bash
# Verificar que PostgreSQL está corriendo
docker ps

# Reiniciar contenedor
docker-compose restart db
```

### Error: "Port 3000 already in use"

```bash
# Cambiar puerto en package.json o matar proceso
npx kill-port 3000
```

### Error: "Module not found"

```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### Error: "DeepFace API not responding"

```bash
# Verificar que el servicio Python está corriendo
cd backend/python
uvicorn deepface_service:app --reload --port 8001
```

---

### ✨ Guías de Estilo

- Seguir las convenciones de [ESTRUCTURA_CODIGO.md](ESTRUCTURA_CODIGO.md)
- Usar nombres descriptivos para variables y funciones
- Comentar código complejo
- Escribir commits descriptivos

---

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

---

## 👨‍💻 Autores

**Devmike117**
- GitHub: [@Devmike117](https://github.com/Devmike117)
  
**Nextefer**
- GitHub: [@Nextefer](https://github.com/Nextefer)


---

<div align="center">

Hecho con ❤️

</div>




