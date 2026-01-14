# SkillLink - Plataforma de Gestión de Servicios Profesionales

## Descripción General del Proyecto

SkillLink es una plataforma integral diseñada bajo una arquitectura de microservicios distribuida, cuyo objetivo es conectar de manera eficiente a proveedores de servicios técnicos y profesionales con clientes finales. El sistema resuelve la fragmentación del mercado de servicios locales mediante una solución escalable, segura y modular.

El proyecto implementa patrones de diseño modernos de ingeniería de software, priorizando la separación de responsabilidades (SoC), la integridad de los datos y la seguridad en la gestión de identidades.

---

## Arquitectura del Sistema

El sistema utiliza una arquitectura de **Microservicios**, donde cada componente funcional opera de manera independiente, comunicándose a través de protocolos HTTP/REST y WebSockets. Todo el tráfico externo es gestionado por un **API Gateway** centralizado que actúa como proxy inverso y balanceador de carga.

### Diagrama de Flujo de Datos (Alto Nivel)
Cliente (Web/Mobile) -> API Gateway -> [Auth / User / Service / Chat] -> Base de Datos Relacional

---

## Desglose de Componentes del Sistema

A continuación se detalla la estructura técnica de los servicios desarrollados, el puerto de ejecución y la tecnología seleccionada para cada dominio funcional.

### 1. API Gateway (Núcleo de Enrutamiento)
* **Tecnología:** Node.js / Express con `http-proxy-middleware`.
* **Puerto:** 3000
* **Responsabilidad:** Punto único de entrada. Gestiona el enrutamiento de peticiones, manejo de CORS y reescritura de cabeceras para la comunicación interna entre servicios.

### 2. Auth Service (Seguridad e Identidad)
* **Tecnología:** .NET 9 (C#).
* **Puerto:** 5293
* **Responsabilidad:** Gestión de credenciales, hashing de contraseñas (BCrypt) y emisión de tokens de acceso (JWT). Es la autoridad central de confianza del sistema.
* **Patrones:** Repository Pattern, DTO Mapping.

### 3. User Service (Gestión de Perfiles)
* **Tecnología:** NestJS (TypeScript).
* **Puerto:** 3004
* **Responsabilidad:** Administración de información demográfica y perfiles de usuarios. Implementa validación estricta de datos y protección de rutas mediante estrategias de autenticación JWT.
* **ORM:** TypeORM.

### 4. Service Manager (Lógica de Negocio)
* **Tecnología:** NestJS (TypeScript).
* **Puerto:** 3002
* **Responsabilidad:** Gestión del catálogo de servicios, creación de solicitudes de trabajo y administración del ciclo de vida de las contrataciones (Pendiente, Aceptado, Finalizado).

### 5. Chat Service (Comunicación en Tiempo Real)
* **Tecnología:** Node.js / Socket.io.
* **Puerto:** 3003
* **Responsabilidad:** Facilita la comunicación bidireccional en tiempo real entre cliente y proveedor mediante WebSockets.

### 6. Review Service (Análisis de Calidad)
* **Tecnología:** Python (FastAPI/Flask).
* **Puerto:** 8000
* **Responsabilidad:** Procesamiento de reseñas y calificaciones. Seleccionado en Python para facilitar la integración futura de análisis de datos o machine learning.

### 7. Payment Service (Transacciones Financieras)
* **Tecnología:** Java (Spring Boot).
* **Puerto:** 8081
* **Responsabilidad:** Gestión robusta de transacciones, suscripciones y pasarelas de pago, aprovechando la seguridad de tipos y manejo de concurrencia de Java.

---

## Stack Tecnológico

El proyecto es políglota, seleccionando la mejor herramienta para cada tarea específica:

* **Backend:** .NET 9, Node.js (Express/NestJS), Python, Java Spring Boot.
* **Base de Datos:** MySQL 8.0 (Diseño Relacional Normalizado).
* **Frontend Mobile:** React Native.
* **Frontend Web:** React.js + TypeScript.
* **Infraestructura:** Docker (Contenerización).

---

## Configuración y Seguridad

### Autenticación
El sistema utiliza **JSON Web Tokens (JWT)** para la gestión de sesiones sin estado (stateless).
1.  El usuario se autentica en el **Auth-Service**.
2.  Si las credenciales son válidas, recibe un token firmado digitalmente.
3.  Este token debe enviarse en el encabezado `Authorization: Bearer <token>` para acceder a recursos protegidos en otros microservicios (como el User-Service).

### Base de Datos
La persistencia de datos se maneja mediante una base de datos **MySQL** centralizada (`skilllink_db`). El esquema ha sido diseñado siguiendo las formas normales para evitar redundancia y asegurar la integridad referencial.

---

## Requisitos de Ejecución

Para desplegar el entorno de desarrollo, es necesario contar con las siguientes herramientas instaladas:

1.  **Node.js** (v18 o superior)
2.  **.NET SDK** (v9.0)
3.  **Python** (v3.9 o superior)
4.  **Java JDK** (v17 o superior)
5.  **MySQL Server**
6.  **Postman** (Para pruebas de integración de API)

---

## Estado Actual del Proyecto

El sistema cuenta con la infraestructura base operativa. Los servicios de Autenticación y Usuarios están completamente integrados a través del API Gateway, permitiendo el flujo completo de registro, inicio de sesión y creación de perfiles con validación de seguridad cruzada entre tecnologías (.NET y NestJS).