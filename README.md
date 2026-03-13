# Cargo Guardian - Backend Node.js

Backend completo en Node.js/Express para el sistema de gestión de entregas Cargo Guardian.

## Requisitos Previos

- **Node.js** v18 o superior
- **PostgreSQL** v14 o superior
- **npm** o **yarn**

## Instalación

### 1. Acceder al directorio

```bash
cd backend
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copia el archivo de ejemplo y edita con tus datos:

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales:

```env
# Base de datos PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cargo_guardian
DB_USER=postgres
DB_PASSWORD=tu_password

# Entorno
NODE_ENV=developing

# Servidor
PORT=3001

# JWT
JWT_SECRET=un_secreto_muy_seguro_aqui
JWT_EXPIRES_IN=7d

# CORS - URLs del frontend separadas por comas
CORS_ORIGINS=http://localhost:8080
```

### 4. Crear la base de datos

```bash
# Desde la terminal
createdb cargo_guardian

# O desde psql:
# CREATE DATABASE cargo_guardian;
```

### 5. Inicializar el schema y usuario admin

```bash
npm run db:init
```

Esto creará todas las tablas y un usuario admin por defecto:
- Email: `admin@cargoguardian.com`
- Password: `admin123`
- **Cambia esta contraseña en producción**

### 6. Ejecutar migraciones pendientes

```bash
npm run migrate
```

### 7. Iniciar el servidor

```bash
# Desarrollo (con hot-reload)
npm run dev

# Producción
npm start
```

El servidor estará disponible en: `http://localhost:3001`

## Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm start` | Ejecuta en producción |
| `npm run dev` | Ejecuta con nodemon (hot-reload) |
| `npm run db:init` | Inicializa el schema y crea el admin por defecto |
| `npm run migrate` | Ejecuta las migraciones pendientes |
| `npm run seed` | Ejecuta el seed de la base de datos |

## Estructura del Proyecto

```
backend/
├── package.json
├── .env
├── .env.example
├── seed.sql
└── src/
    ├── app.js                              # Entrada principal de Express
    ├── config/
    │   ├── database.js                     # Pool de conexión PostgreSQL
    │   └── supabase.js                     # Cliente Supabase (legacy)
    ├── middleware/
    │   ├── auth.js                         # JWT + control de roles
    │   └── cors.js                         # Configuración CORS
    ├── controllers/
    │   ├── authController.js               # Login / registro
    │   ├── clientsController.js            # CRUD clientes
    │   ├── couriersController.js           # Mensajeros + estadísticas
    │   ├── deliveriesController.js         # CRUD entregas + auditoría
    │   ├── dailySettlementsController.js   # Liquidaciones diarias
    │   ├── weeklySettlementsController.js  # Liquidaciones semanales
    │   ├── operationalChargesController.js # Gastos operacionales
    │   ├── salaryAdvancesController.js     # Anticipos de salario
    │   ├── adminsController.js             # Gestión de admins
    │   └── pickersController.js            # Gestión de pickers
    ├── routes/
    │   ├── auth.js
    │   ├── clients.js
    │   ├── couriers.js
    │   ├── deliveries.js
    │   ├── dailySettlements.js
    │   ├── weeklySettlements.js
    │   ├── operationalCharges.js
    │   ├── salaryAdvances.js
    │   ├── admins.js
    │   └── pickers.js
    └── db/
        ├── schema.sql                      # Schema completo de la base de datos
        ├── init.js                         # Inicialización + creación de admin
        ├── migrate.js                      # Runner de migraciones
        └── migrations/
            ├── 001_initial_schema.sql
            ├── 002_add_loan_losttrips_to_deliveries.sql
            ├── 003_cash_accounts_daily_settlements.sql
            └── 004_add_advanced_payment.sql
```

## Endpoints de la API

**Base URL:** `http://localhost:3001/api`

**Autenticación:** Header `Authorization: Bearer <token>`

---

### Health Check

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/api/health` | Estado del servidor | No |

---

### Autenticación (`/api/auth`)

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/api/auth/register` | Registrar usuario | No |
| POST | `/api/auth/login` | Iniciar sesión | No |
| GET | `/api/auth/me` | Usuario actual | Si |

---

### Clientes (`/api/clients`)

| Método | Ruta | Descripción | Rol |
|--------|------|-------------|-----|
| GET | `/api/clients` | Listar todos | Todos |
| GET | `/api/clients/:id` | Obtener uno | Todos |
| GET | `/api/clients/with-debt` | Con saldo negativo | Admin |
| GET | `/api/clients/:id/statement` | Estado de cuenta | Todos |
| POST | `/api/clients` | Crear | Todos |
| PUT | `/api/clients/:id` | Actualizar | Todos |
| PUT | `/api/clients` | Actualización masiva | Admin |
| DELETE | `/api/clients/:id` | Eliminar | Admin |

---

### Mensajeros (`/api/couriers`)

| Método | Ruta | Descripción | Rol |
|--------|------|-------------|-----|
| GET | `/api/couriers` | Listar todos | Todos |
| GET | `/api/couriers/:id/stats` | Estadísticas del mensajero | Todos |
| GET | `/api/couriers/:id/summary` | Resumen diario | Todos |
| POST | `/api/couriers` | Crear mensajero | Admin |
| PUT | `/api/couriers/:id` | Actualizar | Admin |
| DELETE | `/api/couriers/:id` | Eliminar | Admin |

---

### Entregas (`/api/deliveries`)

| Método | Ruta | Descripción | Rol |
|--------|------|-------------|-----|
| GET | `/api/deliveries` | Listar (con filtros y paginación) | Todos |
| GET | `/api/deliveries/:id` | Obtener una | Todos |
| GET | `/api/deliveries/audit-log` | Log de auditoría | Admin |
| POST | `/api/deliveries` | Crear | Todos |
| PUT | `/api/deliveries/:id` | Actualizar | Todos |
| PATCH | `/api/deliveries/:id/status` | Cambiar estado | Todos |
| PATCH | `/api/deliveries/:id/reassign` | Reasignar a otro mensajero | Admin |
| DELETE | `/api/deliveries/:id` | Eliminar | Admin |
| DELETE | `/api/deliveries` | Eliminar todas | Admin |

**Filtros disponibles en `GET /api/deliveries`:**
- `client_id` — filtrar por cliente
- `courier_id` — filtrar por mensajero (solo admin puede ver de otros)
- `status` — `pending`, `completed`, `cancelled`, `not_delivered_collected`, `not_delivered_no_collection`
- `date` — filtrar por fecha de entrega
- `week_start` / `week_end` — filtrar por semana
- `search` — búsqueda por nombre, mensajero, destinatario o notas
- `page` — página (default: 1)
- `limit` — resultados por página (default: 10, max: 100)

**Métodos de pago:** `cash`, `transfer_to_courier`, `transfer_to_client`

> Los mensajeros (role: `courier`) solo pueden ver sus propias entregas.

---

### Liquidaciones Diarias (`/api/daily-settlements`)

| Método | Ruta | Descripción | Rol |
|--------|------|-------------|-----|
| GET | `/api/daily-settlements` | Listar | Todos |
| GET | `/api/daily-settlements/get-base-money` | Dinero base asignado | Admin |
| GET | `/api/daily-settlements/get-partial-deliveries` | Entregas parciales | Admin |
| GET | `/api/daily-settlements/company` | Cuentas de la empresa | Admin |
| GET | `/api/daily-settlements/company/transactions/:account` | Transacciones de cuenta | Admin |
| POST | `/api/daily-settlements` | Crear liquidación | Admin |
| POST | `/api/daily-settlements/base-money` | Asignar dinero base | Admin |
| POST | `/api/daily-settlements/partial-delivery` | Registrar entrega parcial | Admin |
| POST | `/api/daily-settlements/company/money-assignment` | Asignar dinero a empresa | Admin |
| POST | `/api/daily-settlements/company/reset` | Resetear cuentas empresa | Admin |
| PATCH | `/api/daily-settlements/:id/settle` | Liquidar settlement | Admin |
| PATCH | `/api/daily-settlements/reopen` | Reabrir settlement | Admin |
| PUT | `/api/daily-settlements/company/movements/opening-balance` | Editar balance inicial | Admin |
| DELETE | `/api/daily-settlements` | Eliminar settlements | Admin |

**Cuentas de empresa disponibles:** `cash`, `bancolombia`, `nequi`

---

### Liquidaciones Semanales (`/api/weekly-settlements`)

| Método | Ruta | Descripción | Rol |
|--------|------|-------------|-----|
| GET | `/api/weekly-settlements` | Listar | Todos |
| POST | `/api/weekly-settlements` | Crear | Admin |
| PATCH | `/api/weekly-settlements/:id/settle` | Liquidar | Admin |

**Filtros:** `courier_id`, `week_start`, `week_end`

> La semana se calcula de sábado a viernes.

---

### Gastos Operacionales (`/api/operational-charges`)

| Método | Ruta | Descripción | Rol |
|--------|------|-------------|-----|
| GET | `/api/operational-charges` | Listar | Todos |
| POST | `/api/operational-charges` | Crear | Admin |
| DELETE | `/api/operational-charges/:id` | Eliminar | Admin |

---

### Anticipos de Salario (`/api/salary-advances`)

| Método | Ruta | Descripción | Rol |
|--------|------|-------------|-----|
| GET | `/api/salary-advances` | Listar | Todos |
| POST | `/api/salary-advances` | Crear | Admin |
| DELETE | `/api/salary-advances/:id` | Eliminar | Admin |

---

### Administradores (`/api/admins`)

Todas las rutas requieren autenticación y rol admin.

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/admins` | Listar admins |
| POST | `/api/admins` | Crear admin |
| PUT | `/api/admins/:id` | Actualizar admin |
| DELETE | `/api/admins/:id` | Eliminar admin |

---

### Pickers (`/api/pickers`)

| Método | Ruta | Descripción | Rol |
|--------|------|-------------|-----|
| GET | `/api/pickers` | Listar | Todos |
| POST | `/api/pickers` | Crear | Admin |
| PUT | `/api/pickers/:id` | Actualizar | Admin |
| DELETE | `/api/pickers/:id` | Eliminar | Admin |

---

## Base de Datos

### Tablas Principales

| Tabla | Descripción |
|-------|-------------|
| `users` | Usuarios del sistema (mensajeros, admins) |
| `user_roles` | Roles por usuario (`admin`, `courier`) |
| `profiles` | Perfil extendido del usuario |
| `clients` | Clientes de entregas |
| `deliveries` | Registros de entregas |
| `delivery_audit_log` | Auditoría de cambios en entregas (JSONB) |
| `daily_settlements` | Liquidaciones diarias por mensajero |
| `daily_base_money` | Dinero base asignado por día |
| `partial_deliveries` | Pagos parciales recibidos |
| `weekly_settlements` | Resúmenes semanales por mensajero |
| `salary_advances` | Anticipos de salario |
| `operational_charges` | Gastos operacionales de la empresa |
| `company_money_movements` | Movimientos de cuentas de la empresa |
| `system_settings` | Configuración del sistema (key-value) |

### Migraciones

Las migraciones se encuentran en `src/db/migrations/` y se ejecutan con `npm run migrate`. El runner aplica solo las migraciones que aún no han sido ejecutadas.

## Arquitectura

- **Patrón:** MVC (Model-View-Controller)
- **Autenticación:** JWT con expiración configurable (default 7 días)
- **Hashing de contraseñas:** bcryptjs (10 salt rounds)
- **Control de acceso:** RBAC con roles `admin` y `courier`
- **Pool de conexiones:** PostgreSQL con máximo 20 conexiones
- **Auditoría:** Los cambios en entregas se registran con valores anteriores y nuevos en formato JSONB
- **Formato de respuesta:** `{ data: [...], error: null }` / `{ data: null, error: "mensaje" }`

## Conectar el Frontend

1. Agrega `VITE_API_URL=http://localhost:3001/api` al `.env` del frontend
2. Configura Axios o fetch apuntando a esa URL base
3. Incluye el header `Authorization: Bearer <token>` en las peticiones autenticadas
