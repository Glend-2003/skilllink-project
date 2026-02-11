CREATE DATABASE  IF NOT EXISTS `skilllink_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `skilllink_db`;
-- MySQL dump 10.13  Distrib 8.0.43, for macos15 (arm64)
--
-- Host: localhost    Database: skilllink_db
-- ------------------------------------------------------
-- Server version	9.4.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '8ba6c684-dd5d-11f0-b2f8-00155d24608c:1-165';

DROP TABLE IF EXISTS `__EFMigrationsHistory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `__EFMigrationsHistory` (
  `MigrationId` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `ProductVersion` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`MigrationId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `__EFMigrationsHistory`
--

LOCK TABLES `__EFMigrationsHistory` WRITE;
/*!40000 ALTER TABLE `__EFMigrationsHistory` DISABLE KEYS */;
/*!40000 ALTER TABLE `__EFMigrationsHistory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conversations`
--

DROP TABLE IF EXISTS `conversations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conversations` (
  `conversation_id` int NOT NULL AUTO_INCREMENT,
  `request_id` int DEFAULT NULL,
  `participant1_user_id` int NOT NULL,
  `participant2_user_id` int NOT NULL,
  `last_message_at` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`conversation_id`),
  KEY `request_id` (`request_id`),
  KEY `idx_participant1` (`participant1_user_id`),
  KEY `idx_participant2` (`participant2_user_id`),
  CONSTRAINT `conversations_ibfk_1` FOREIGN KEY (`request_id`) REFERENCES `service_requests` (`request_id`) ON DELETE SET NULL,
  CONSTRAINT `conversations_ibfk_2` FOREIGN KEY (`participant1_user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `conversations_ibfk_3` FOREIGN KEY (`participant2_user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conversations`
--

LOCK TABLES `conversations` WRITE;
/*!40000 ALTER TABLE `conversations` DISABLE KEYS */;
INSERT INTO `conversations` VALUES (33,NULL,6,27,NULL,1,'2026-02-11 05:54:11');
/*!40000 ALTER TABLE `conversations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `message_id` int NOT NULL AUTO_INCREMENT,
  `conversation_id` int NOT NULL,
  `sender_user_id` int NOT NULL,
  `message_text` text NOT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`message_id`),
  KEY `idx_conversation` (`conversation_id`),
  KEY `idx_sender` (`sender_user_id`),
  KEY `idx_created` (`created_at`),
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`conversation_id`) ON DELETE CASCADE,
  CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`sender_user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `notification_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `notification_type` varchar(50) NOT NULL,
  `title` varchar(200) NOT NULL,
  `message` text NOT NULL,
  `related_entity_type` varchar(50) DEFAULT NULL,
  `related_entity_id` int DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`notification_id`),
  KEY `idx_user_unread` (`user_id`,`is_read`),
  KEY `idx_created` (`created_at`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=86 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (48,6,'LOGIN_SECURITY','Nuevo inicio de sesión detectado','Hola, se ha detectado un inicio de sesión en tu cuenta el 11/02/2026 02:56. Si no fuiste tú, contacta a soporte.','User',6,0,NULL,'2026-02-11 02:56:08'),(49,1,'LOGIN_SECURITY','Nuevo inicio de sesión detectado','Hola, se ha detectado un inicio de sesión en tu cuenta el 11/02/2026 03:09. Si no fuiste tú, contacta a soporte.','User',1,0,NULL,'2026-02-11 03:09:47'),(50,3,'LOGIN_SECURITY','Nuevo inicio de sesión detectado','Hola, se ha detectado un inicio de sesión en tu cuenta el 11/02/2026 03:13. Si no fuiste tú, contacta a soporte.','User',3,0,NULL,'2026-02-11 03:13:51'),(51,4,'LOGIN_SECURITY','Nuevo inicio de sesión detectado','Hola, se ha detectado un inicio de sesión en tu cuenta el 11/02/2026 03:14. Si no fuiste tú, contacta a soporte.','User',4,0,NULL,'2026-02-11 03:14:29'),(52,2,'LOGIN_SECURITY','Nuevo inicio de sesión detectado','Hola, se ha detectado un inicio de sesión en tu cuenta el 11/02/2026 03:15. Si no fuiste tú, contacta a soporte.','User',2,0,NULL,'2026-02-11 03:15:11'),(53,7,'LOGIN_SECURITY','Nuevo inicio de sesión detectado','Hola, se ha detectado un inicio de sesión en tu cuenta el 11/02/2026 03:16. Si no fuiste tú, contacta a soporte.','User',7,0,NULL,'2026-02-11 03:16:41'),(54,8,'LOGIN_SECURITY','Nuevo inicio de sesión detectado','Hola, se ha detectado un inicio de sesión en tu cuenta el 11/02/2026 03:24. Si no fuiste tú, contacta a soporte.','User',8,0,NULL,'2026-02-11 03:24:26'),(55,10,'LOGIN_SECURITY','Nuevo inicio de sesión detectado','Hola, se ha detectado un inicio de sesión en tu cuenta el 11/02/2026 03:30. Si no fuiste tú, contacta a soporte.','User',10,0,NULL,'2026-02-11 03:30:54'),(56,7,'LOGIN_SECURITY','Nuevo inicio de sesión detectado','Hola, se ha detectado un inicio de sesión en tu cuenta el 11/02/2026 03:38. Si no fuiste tú, contacta a soporte.','User',7,0,NULL,'2026-02-11 03:38:22'),(57,8,'LOGIN_SECURITY','Nuevo inicio de sesión detectado','Hola, se ha detectado un inicio de sesión en tu cuenta el 11/02/2026 03:39. Si no fuiste tú, contacta a soporte.','User',8,0,NULL,'2026-02-11 03:39:23'),(58,11,'LOGIN_SECURITY','Nuevo inicio de sesión detectado','Hola, se ha detectado un inicio de sesión en tu cuenta el 11/02/2026 03:40. Si no fuiste tú, contacta a soporte.','User',11,0,NULL,'2026-02-11 03:40:49'),(59,11,'LOGIN_SECURITY','Nuevo inicio de sesión detectado','Hola, se ha detectado un inicio de sesión en tu cuenta el 11/02/2026 03:44. Si no fuiste tú, contacta a soporte.','User',11,0,NULL,'2026-02-11 03:44:23'),(60,15,'LOGIN_SECURITY','Nuevo inicio de sesión detectado','Hola, se ha detectado un inicio de sesión en tu cuenta el 11/02/2026 03:47. Si no fuiste tú, contacta a soporte.','User',15,0,NULL,'2026-02-11 03:47:38'),(61,13,'LOGIN_SECURITY','Nuevo inicio de sesión detectado','Hola, se ha detectado un inicio de sesión en tu cuenta el 11/02/2026 03:55. Si no fuiste tú, contacta a soporte.','User',13,0,NULL,'2026-02-11 03:55:28'),(62,14,'LOGIN_SECURITY','Nuevo inicio de sesión detectado','Hola, se ha detectado un inicio de sesión en tu cuenta el 11/02/2026 04:05. Si no fuiste tú, contacta a soporte.','User',14,0,NULL,'2026-02-11 04:05:47'),(63,9,'LOGIN_SECURITY','Nuevo inicio de sesión detectado','Hola, se ha detectado un inicio de sesión en tu cuenta el 11/02/2026 04:11. Si no fuiste tú, contacta a soporte.','User',9,0,NULL,'2026-02-11 04:11:48'),(64,9,'LOGIN_SECURITY','Nuevo inicio de sesión detectado','Hola, se ha detectado un inicio de sesión en tu cuenta el 11/02/2026 04:13. Si no fuiste tú, contacta a soporte.','User',9,0,NULL,'2026-02-11 04:13:16'),(65,16,'LOGIN_SECURITY','Nuevo inicio de sesión detectado','Hola, se ha detectado un inicio de sesión en tu cuenta el 11/02/2026 04:21. Si no fuiste tú, contacta a soporte.','User',16,0,NULL,'2026-02-11 04:21:03'),(66,17,'LOGIN_SECURITY','Nuevo inicio de sesión detectado','Hola, se ha detectado un inicio de sesión en tu cuenta el 11/02/2026 04:24. Si no fuiste tú, contacta a soporte.','User',17,0,NULL,'2026-02-11 04:24:36'),(67,12,'LOGIN_SECURITY','Nuevo inicio de sesión detectado','Hola, se ha detectado un inicio de sesión en tu cuenta el 11/02/2026 04:28. Si no fuiste tú, contacta a soporte.','User',12,0,NULL,'2026-02-11 04:28:34'),(68,18,'LOGIN_SECURITY','Nuevo inicio de sesión detectado','Hola, se ha detectado un inicio de sesión en tu cuenta el 11/02/2026 04:33. Si no fuiste tú, contacta a soporte.','User',18,0,NULL,'2026-02-11 04:33:13'),(69,18,'LOGIN_SECURITY','Nuevo inicio de sesión detectado','Hola, se ha detectado un inicio de sesión en tu cuenta el 11/02/2026 04:37. Si no fuiste tú, contacta a soporte.','User',18,0,NULL,'2026-02-11 04:37:05'),(70,19,'LOGIN_SECURITY','Nuevo inicio de sesión detectado','Hola, se ha detectado un inicio de sesión en tu cuenta el 11/02/2026 04:38. Si no fuiste tú, contacta a soporte.','User',19,0,NULL,'2026-02-11 04:38:32'),(71,20,'LOGIN_SECURITY','Nuevo inicio de sesión detectado','Hola, se ha detectado un inicio de sesión en tu cuenta el 11/02/2026 04:41. Si no fuiste tú, contacta a soporte.','User',20,0,NULL,'2026-02-11 04:41:30'),(72,21,'LOGIN_SECURITY','Nuevo inicio de sesión detectado','Hola, se ha detectado un inicio de sesión en tu cuenta el 11/02/2026 04:48. Si no fuiste tú, contacta a soporte.','User',21,0,NULL,'2026-02-11 04:48:29'),(73,22,'LOGIN_SECURITY','Nuevo inicio de sesión detectado','Hola, se ha detectado un inicio de sesión en tu cuenta el 11/02/2026 04:53. Si no fuiste tú, contacta a soporte.','User',22,0,NULL,'2026-02-11 04:53:26'),(74,23,'LOGIN_SECURITY','Nuevo inicio de sesión detectado','Hola, se ha detectado un inicio de sesión en tu cuenta el 11/02/2026 04:57. Si no fuiste tú, contacta a soporte.','User',23,0,NULL,'2026-02-11 04:57:43'),(75,24,'LOGIN_SECURITY','Nuevo inicio de sesión detectado','Hola, se ha detectado un inicio de sesión en tu cuenta el 11/02/2026 05:02. Si no fuiste tú, contacta a soporte.','User',24,0,NULL,'2026-02-11 05:02:57'),(76,25,'LOGIN_SECURITY','Nuevo inicio de sesión detectado','Hola, se ha detectado un inicio de sesión en tu cuenta el 11/02/2026 05:06. Si no fuiste tú, contacta a soporte.','User',25,0,NULL,'2026-02-11 05:06:40'),(77,25,'LOGIN_SECURITY','Nuevo inicio de sesión detectado','Hola, se ha detectado un inicio de sesión en tu cuenta el 11/02/2026 05:08. Si no fuiste tú, contacta a soporte.','User',25,0,NULL,'2026-02-11 05:08:01'),(78,26,'LOGIN_SECURITY','Nuevo inicio de sesión detectado','Hola, se ha detectado un inicio de sesión en tu cuenta el 11/02/2026 05:11. Si no fuiste tú, contacta a soporte.','User',26,0,NULL,'2026-02-11 05:11:55'),(79,26,'LOGIN_SECURITY','Nuevo inicio de sesión detectado','Hola, se ha detectado un inicio de sesión en tu cuenta el 11/02/2026 05:16. Si no fuiste tú, contacta a soporte.','User',26,0,NULL,'2026-02-11 05:16:49'),(80,16,'LOGIN_SECURITY','Nuevo inicio de sesión detectado','Hola, se ha detectado un inicio de sesión en tu cuenta el 11/02/2026 05:18. Si no fuiste tú, contacta a soporte.','User',16,0,NULL,'2026-02-11 05:18:48'),(81,27,'WELCOME','¡Bienvenido a SkillLink!','Gracias por registrarte. Estamos felices de tenerte con nosotros.','User',27,0,NULL,'2026-02-11 05:21:36'),(82,6,'LOGIN_SECURITY','Nuevo inicio de sesión detectado','Hola, se ha detectado un inicio de sesión en tu cuenta el 11/02/2026 05:24. Si no fuiste tú, contacta a soporte.','User',6,0,NULL,'2026-02-11 05:24:03'),(83,27,'LOGIN_SECURITY','Nuevo inicio de sesión detectado','Hola, se ha detectado un inicio de sesión en tu cuenta el 11/02/2026 05:24. Si no fuiste tú, contacta a soporte.','User',27,0,NULL,'2026-02-11 05:24:59'),(84,6,'LOGIN_SECURITY','Nuevo inicio de sesión detectado','Hola, se ha detectado un inicio de sesión en tu cuenta el 11/02/2026 05:28. Si no fuiste tú, contacta a soporte.','User',6,0,NULL,'2026-02-11 05:28:35'),(85,6,'LOGIN_SECURITY','Nuevo inicio de sesión detectado','Hola, se ha detectado un inicio de sesión en tu cuenta el 11/02/2026 05:53. Si no fuiste tú, contacta a soporte.','User',6,0,NULL,'2026-02-11 05:53:16');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `provider_profiles`
--

DROP TABLE IF EXISTS `provider_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `provider_profiles` (
  `provider_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `business_name` varchar(200) DEFAULT NULL,
  `business_description` text,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `years_experience` int DEFAULT NULL,
  `service_radius_km` int DEFAULT NULL,
  `is_verified` tinyint(1) DEFAULT '0',
  `verification_date` timestamp NULL DEFAULT NULL,
  `trust_badge` tinyint(1) DEFAULT '0',
  `available_for_work` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`provider_id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `FK_user_provider` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `provider_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `provider_profiles`
--

LOCK TABLES `provider_profiles` WRITE;
/*!40000 ALTER TABLE `provider_profiles` DISABLE KEYS */;
INSERT INTO `provider_profiles` VALUES (1,7,'Plomería Carlos Pro','Servicios profesionales de plomería residencial y comercial. Reparaciones, instalaciones, mantenimiento. Trabajos garantizados y presupuestos sin compromiso.',10.28820200,-83.93679200,12,30,1,NULL,1,1,'2026-02-11 02:36:42','2026-02-11 03:38:56'),(2,8,'Electricidad Ana Experta','Instalación y reparación de sistemas eléctricos. Certificados CFIA. Servicios residenciales, comerciales e industriales. Emergencias 24/7.',10.25994200,-83.77798400,10,35,1,NULL,1,1,'2026-02-11 02:36:42','2026-02-11 03:39:56'),(3,9,'Barbería Miguel Estilo','Cortes modernos y clásicos, diseño de barba, tratamientos capilares. Atención personalizada en ambiente profesional.',10.39044700,-84.12608900,8,20,1,NULL,1,1,'2026-02-11 02:36:42','2026-02-11 04:20:35'),(4,10,'Limpieza Integral Laura','Servicio profesional de limpieza para hogares, oficinas y locales. Personal capacitado, productos ecológicos. Rapidez y confiabilidad.',10.18025800,-83.76901200,9,40,1,NULL,1,1,'2026-02-11 02:36:42','2026-02-11 03:37:58'),(5,11,'Pinturas Jiménez Pro','Pintura residencial y comercial. Especialistas en texturas decorativas, lacados, acabados especiales. Asesoría en colores incluida.',10.20623900,-83.83209700,15,35,1,NULL,1,1,'2026-02-11 02:36:42','2026-02-11 03:47:02'),(6,12,'TecnoSolutions María','Reparación de computadoras, redes, soporte técnico. Servicio a domicilio y remoto. Certificaciones Microsoft y Cisco.',10.46834200,-84.43262700,8,30,1,NULL,1,1,'2026-02-11 02:36:42','2026-02-11 04:32:46'),(7,13,'Constructora JR','Construcción de casas, ampliaciones, remodelaciones. Personal calificado. Proyectos llave en mano. 18 años de experiencia.',9.93333000,-84.08333000,18,50,1,NULL,1,1,'2026-02-11 02:36:42','2026-02-11 04:04:10'),(8,14,'Carpintería Juan Premium','Fabricación de muebles a medida. Closets, cocinas integrales, muebles de sala y comedor. Carpintería artesanal de alta calidad.',10.47331600,-83.91657800,12,30,1,NULL,1,1,'2026-02-11 02:36:42','2026-02-11 04:11:15'),(9,15,'Jardines del Valle','Mantenimiento de jardines, diseño paisajístico, sistemas de riego. Poda de árboles, fumigación ecológica.',10.01573000,-84.21416000,11,40,1,NULL,1,1,'2026-02-11 02:36:42','2026-02-11 02:36:42'),(10,16,'Belleza Mariana Salon','Salón de belleza completo. Cortes, tintes, tratamientos capilares, manicure, pedicure. Ambiente acogedor y profesional.',10.42759800,-84.02592400,10,25,1,NULL,1,1,'2026-02-11 02:36:42','2026-02-11 04:24:12'),(11,17,'Spa Relax Sofía','Tratamientos faciales, masajes terapéuticos, depilación láser. Productos premium. Ambiente tranquilo y relajante.',10.19163800,-83.70693200,8,30,1,NULL,1,1,'2026-02-11 02:36:42','2026-02-11 04:28:12'),(12,18,'Eventos Elegantes Diana','Organización integral de bodas, quinceaños, eventos corporativos. Decoración, coordinación, logística completa.',10.29061900,-83.87246900,10,60,1,NULL,1,1,'2026-02-11 02:36:42','2026-02-11 04:37:59'),(13,19,'Catering Gourmet Manuel','Servicio de catering para eventos. Menús personalizados, chef profesional. Desde 20 hasta 500 personas. Calidad garantizada.',9.93333000,-84.08333000,12,70,1,NULL,1,1,'2026-02-11 02:36:42','2026-02-11 02:36:42'),(14,20,'Mudanzas Express Ricardo','Servicio de mudanzas local y nacional. Personal capacitado, vehículos equipados, seguro incluido. Embalaje profesional.',9.95499000,-84.00850700,12,150,1,NULL,1,1,'2026-02-11 02:36:42','2026-02-11 04:47:48'),(15,21,'Taller Mecánico Central','Reparación y mantenimiento vehicular. Mecánica general, frenos, suspensión, sistema eléctrico. Diagnóstico computarizado.',9.94006400,-84.09327500,15,30,1,NULL,1,1,'2026-02-11 02:36:42','2026-02-11 04:53:03'),(16,22,'Automóvil 360 Daniel','Servicio completo automotriz. Alineación, balanceo, cambio de aceite, revisión técnica. Repuestos originales.',10.43526400,-84.02299300,9,35,1,NULL,0,1,'2026-02-11 02:36:42','2026-02-11 04:57:00'),(17,23,'Fotografía Esteban Pro','Fotografía profesional de eventos. Bodas, quinceaños, graduaciones. Paquetes todo incluido. Álbum digital en alta resolución.',9.94410600,-84.10264000,11,50,1,NULL,1,1,'2026-02-11 02:36:42','2026-02-11 05:02:10'),(18,24,'Momentos Fotografía Gaby','Sesiones fotográficas profesionales. Bodas, embarazos, bebés, familias. Edición profesional incluida.',9.97622000,-84.83656000,8,45,1,NULL,1,1,'2026-02-11 02:36:42','2026-02-11 02:36:42'),(19,25,'Vet Clinic Pets Dra. Patricia','Atención veterinaria a domicilio. Consultas, vacunación, cirugías menores, emergencias. Servicio 24/7.',9.93333000,-84.08333000,10,40,1,NULL,1,1,'2026-02-11 02:36:42','2026-02-11 02:36:42'),(20,26,'Veterinaria Exóticos Fernando','Especialista en mascotas exóticas. Aves, reptiles, roedores. Clínica completa. Urgencias disponibles.',9.99839000,-84.11696000,7,35,1,NULL,0,1,'2026-02-11 02:36:42','2026-02-11 05:18:18'),(21,27,'Fotografía Gerald Calderón ','Fotografía de retrato',10.32022770,-83.91481990,2,150,0,NULL,0,1,'2026-02-11 05:24:24','2026-02-11 05:25:27');
/*!40000 ALTER TABLE `provider_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `provider_requests`
--

DROP TABLE IF EXISTS `provider_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `provider_requests` (
  `request_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `business_name` varchar(200) NOT NULL,
  `description` text NOT NULL,
  `services` text NOT NULL,
  `experience` varchar(500) DEFAULT NULL,
  `location` varchar(200) NOT NULL,
  `hourly_rate` decimal(10,2) DEFAULT NULL,
  `portfolio` text,
  `certifications` text,
  `status` varchar(20) DEFAULT 'pending',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `reviewed_at` datetime DEFAULT NULL,
  `reviewed_by` int DEFAULT NULL,
  `review_notes` text,
  PRIMARY KEY (`request_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `provider_requests_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `provider_requests`
--

LOCK TABLES `provider_requests` WRITE;
/*!40000 ALTER TABLE `provider_requests` DISABLE KEYS */;
INSERT INTO `provider_requests` VALUES (14,27,'Fotografía Gerald Calderón ','Fotografía de retrato','Fotografía de retrato',NULL,'Sarapiquí, Heredia, Costa Rica',NULL,NULL,NULL,'approved','2026-02-11 05:21:41','2026-02-11 05:24:24',NULL,'Solicitud aprobada. ¡Bienvenido como proveedor!');
/*!40000 ALTER TABLE `provider_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `provider_subscriptions`
--

DROP TABLE IF EXISTS `provider_subscriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `provider_subscriptions` (
  `subscription_id` int NOT NULL AUTO_INCREMENT,
  `provider_id` int NOT NULL,
  `plan_id` int NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `status` enum('active','cancelled','expired','pending') DEFAULT 'pending',
  `auto_renew` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `cancelled_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`subscription_id`),
  KEY `plan_id` (`plan_id`),
  KEY `idx_provider` (`provider_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `provider_subscriptions_ibfk_1` FOREIGN KEY (`provider_id`) REFERENCES `provider_profiles` (`provider_id`) ON DELETE CASCADE,
  CONSTRAINT `provider_subscriptions_ibfk_2` FOREIGN KEY (`plan_id`) REFERENCES `subscription_plans` (`plan_id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `provider_subscriptions`
--

LOCK TABLES `provider_subscriptions` WRITE;
/*!40000 ALTER TABLE `provider_subscriptions` DISABLE KEYS */;
/*!40000 ALTER TABLE `provider_subscriptions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `push_tokens`
--

DROP TABLE IF EXISTS `push_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `push_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `push_token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `last_used` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_token` (`user_id`,`push_token`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `push_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `push_tokens`
--

LOCK TABLES `push_tokens` WRITE;
/*!40000 ALTER TABLE `push_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `push_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reports`
--

DROP TABLE IF EXISTS `reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reports` (
  `report_id` int NOT NULL AUTO_INCREMENT,
  `reporter_user_id` int NOT NULL,
  `reported_user_id` int DEFAULT NULL,
  `reported_service_id` int DEFAULT NULL,
  `reported_review_id` int DEFAULT NULL,
  `report_type` varchar(50) NOT NULL,
  `report_reason` text NOT NULL,
  `status` enum('pending','investigating','resolved','dismissed') DEFAULT 'pending',
  `admin_notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `resolved_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`report_id`),
  KEY `reporter_user_id` (`reporter_user_id`),
  KEY `reported_user_id` (`reported_user_id`),
  KEY `reported_service_id` (`reported_service_id`),
  KEY `reported_review_id` (`reported_review_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `reports_ibfk_1` FOREIGN KEY (`reporter_user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `reports_ibfk_2` FOREIGN KEY (`reported_user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  CONSTRAINT `reports_ibfk_3` FOREIGN KEY (`reported_service_id`) REFERENCES `services` (`service_id`) ON DELETE SET NULL,
  CONSTRAINT `reports_ibfk_4` FOREIGN KEY (`reported_review_id`) REFERENCES `reviews` (`review_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reports`
--

LOCK TABLES `reports` WRITE;
/*!40000 ALTER TABLE `reports` DISABLE KEYS */;
/*!40000 ALTER TABLE `reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `review_id` int NOT NULL AUTO_INCREMENT,
  `request_id` int NOT NULL,
  `reviewer_user_id` int NOT NULL,
  `reviewed_user_id` int NOT NULL,
  `rating` int NOT NULL,
  `review_title` varchar(200) DEFAULT NULL,
  `review_text` text,
  `is_verified` tinyint(1) DEFAULT '0',
  `is_approved` tinyint(1) DEFAULT '1',
  `helpful_count` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`review_id`),
  UNIQUE KEY `request_id` (`request_id`),
  KEY `reviewer_user_id` (`reviewer_user_id`),
  KEY `idx_reviewed_user` (`reviewed_user_id`),
  KEY `idx_rating` (`rating`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`request_id`) REFERENCES `service_requests` (`request_id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`reviewer_user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_ibfk_3` FOREIGN KEY (`reviewed_user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_chk_1` CHECK ((`rating` between 1 and 5))
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `role_id` int NOT NULL AUTO_INCREMENT,
  `role_name` varchar(50) NOT NULL,
  `role_description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`role_id`),
  UNIQUE KEY `role_name` (`role_name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'client','Usuario que solicita servicios','2025-12-25 23:26:31'),(2,'provider','Usuario que ofrece servicios','2025-12-25 23:26:31'),(3,'admin','Administrador del sistema','2025-12-25 23:26:31');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `saved_searches`
--

DROP TABLE IF EXISTS `saved_searches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `saved_searches` (
  `search_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `category_id` int DEFAULT NULL,
  `search_query` varchar(255) DEFAULT NULL,
  `location_latitude` decimal(10,8) DEFAULT NULL,
  `location_longitude` decimal(11,8) DEFAULT NULL,
  `search_radius_km` int DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`search_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `saved_searches`
--

LOCK TABLES `saved_searches` WRITE;
/*!40000 ALTER TABLE `saved_searches` DISABLE KEYS */;
/*!40000 ALTER TABLE `saved_searches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `service_categories`
--

DROP TABLE IF EXISTS `service_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `service_categories` (
  `category_id` int NOT NULL AUTO_INCREMENT,
  `parent_category_id` int DEFAULT NULL,
  `category_name` varchar(100) NOT NULL,
  `category_description` text,
  `icon_url` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `display_order` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`category_id`),
  KEY `idx_parent` (`parent_category_id`),
  CONSTRAINT `service_categories_ibfk_1` FOREIGN KEY (`parent_category_id`) REFERENCES `service_categories` (`category_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_categories`
--

LOCK TABLES `service_categories` WRITE;
/*!40000 ALTER TABLE `service_categories` DISABLE KEYS */;
INSERT INTO `service_categories` VALUES (1,NULL,'Plomería','Servicios de plomería residencial y comercial',NULL,1,1,'2026-01-20 17:46:22'),(2,NULL,'Electricidad','Servicios eléctricos residenciales y comerciales',NULL,1,2,'2026-01-20 17:46:22'),(3,NULL,'Barbería','Servicios de barbería y peluquería',NULL,1,3,'2026-01-20 17:46:22'),(4,NULL,'Limpieza','Servicios de limpieza residencial y comercial',NULL,1,4,'2026-01-20 17:46:22'),(5,NULL,'Pintura','Servicios de pintura residencial y comercial',NULL,1,5,'2026-02-11 02:17:08'),(6,NULL,'Construcción','Servicios de construcción y remodelación',NULL,1,6,'2026-02-11 02:17:08'),(7,NULL,'Carpintería','Fabricación y reparación de muebles y estructuras de madera',NULL,1,7,'2026-01-28 04:55:36'),(8,NULL,'Tecnología','Reparación de computadoras, celulares y soporte técnico',NULL,1,8,'2026-02-11 02:17:08'),(9,NULL,'Jardinería','Mantenimiento de jardines, poda y diseño paisajístico',NULL,1,9,'2026-01-28 04:55:36'),(10,NULL,'Belleza y Estética','Servicios de belleza, spa y cuidado personal',NULL,1,10,'2026-02-11 02:17:08'),(11,NULL,'Eventos','Organización de eventos, catering y decoración',NULL,1,11,'2026-02-11 02:17:08'),(12,NULL,'Transporte','Servicios de mudanza y transporte',NULL,1,12,'2026-02-11 02:17:08'),(13,NULL,'Mecánica Automotriz','Reparación y mantenimiento de vehículos','',1,13,'2026-02-07 19:22:35'),(14,NULL,'Fotografía','Servicios fotográficos profesionales','',1,14,'2026-02-07 19:23:50'),(15,NULL,'Veterinaria','Cuidado y atención veterinaria',NULL,1,15,'2026-02-11 02:17:08');
/*!40000 ALTER TABLE `service_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `service_gallery`
--

DROP TABLE IF EXISTS `service_gallery`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `service_gallery` (
  `gallery_id` int NOT NULL AUTO_INCREMENT,
  `service_id` int DEFAULT NULL,
  `provider_id` int NOT NULL,
  `image_url` varchar(500) NOT NULL,
  `image_title` varchar(200) DEFAULT NULL,
  `image_description` text,
  `display_order` int DEFAULT '0',
  `is_approved` tinyint(1) DEFAULT '1',
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `approval_date` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`gallery_id`),
  KEY `idx_service` (`service_id`),
  KEY `idx_provider` (`provider_id`),
  CONSTRAINT `service_gallery_ibfk_1` FOREIGN KEY (`service_id`) REFERENCES `services` (`service_id`) ON DELETE CASCADE,
  CONSTRAINT `service_gallery_ibfk_2` FOREIGN KEY (`provider_id`) REFERENCES `provider_profiles` (`provider_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=82 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_gallery`
--

LOCK TABLES `service_gallery` WRITE;
/*!40000 ALTER TABLE `service_gallery` DISABLE KEYS */;
INSERT INTO `service_gallery` VALUES (7,1,1,'https://res.cloudinary.com/dsr4zuujv/image/upload/v1770780023/skilllink/services/bbrp0qa3irbr2tjhewvv.jpg','a238ab80-5916-4348-8217-c645e139d0b5.jpeg',NULL,0,1,'2026-02-11 03:20:23',NULL),(8,1,1,'https://res.cloudinary.com/dsr4zuujv/image/upload/v1770780025/skilllink/services/q4cicvnruiz4fec1oeht.jpg','0dcd0b8d-5564-4195-a292-a8bf7aed24ca.jpeg',NULL,1,1,'2026-02-11 03:20:25',NULL),(9,2,1,'https://res.cloudinary.com/dsr4zuujv/image/upload/v1770780119/skilllink/services/dms9ukdz5cfnie3paisy.jpg','ee3d0edc-4397-47ed-bac0-035f77ef9329.jpeg',NULL,0,1,'2026-02-11 03:21:59',NULL),(10,2,1,'https://res.cloudinary.com/dsr4zuujv/image/upload/v1770780120/skilllink/services/oxlbiwkhoc9golh5nvnl.jpg','d24877c6-f6e3-4ac9-8e8d-dd88847a9953.jpeg',NULL,1,1,'2026-02-11 03:22:01',NULL),(11,3,1,'https://res.cloudinary.com/dsr4zuujv/image/upload/v1770780162/skilllink/services/zb6d8d77j4jfyko5srzt.jpg','2ac4f312-dc84-4970-b519-a5744be88f19.jpeg',NULL,0,1,'2026-02-11 03:22:43',NULL),(12,3,1,'https://res.cloudinary.com/dsr4zuujv/image/upload/v1770780166/skilllink/services/pm8f0lovp5rhauupx0kv.jpg','bead7890-040a-49d1-ab87-4c4361f5ea90.jpeg',NULL,1,1,'2026-02-11 03:22:47',NULL),(13,5,2,'https://res.cloudinary.com/dsr4zuujv/image/upload/v1770780536/skilllink/services/qqvlapuztzsjhtj7fdb1.jpg','8a4cffe4-5330-4abb-beaa-375511741657.webp',NULL,0,1,'2026-02-11 03:28:57',NULL),(14,6,2,'https://res.cloudinary.com/dsr4zuujv/image/upload/v1770780549/skilllink/services/ywbl8fljcghqbanl8g01.jpg','6ae51a3d-2068-4a9a-8810-d28770f1f9c5.jpeg',NULL,0,1,'2026-02-11 03:29:10',NULL),(15,7,2,'https://res.cloudinary.com/dsr4zuujv/image/upload/v1770780562/skilllink/services/cls0uk4tdyyes2pszlf9.jpg','f7b865cf-71e4-4a9b-b253-e77a8775ee4e.jpeg',NULL,0,1,'2026-02-11 03:29:23',NULL),(16,12,4,'https://res.cloudinary.com/dsr4zuujv/image/upload/v1770780874/skilllink/services/avrwn1sx7hqkhnfp773v.jpg','fd2b2a28-40b6-4db7-af70-393e69b007c6.png',NULL,0,1,'2026-02-11 03:34:35',NULL),(17,13,4,'https://res.cloudinary.com/dsr4zuujv/image/upload/v1770780952/skilllink/services/wda4iwsrch9qwypxye8a.jpg','f1231ac3-7a56-4717-a696-448898b6cbee.jpeg',NULL,0,1,'2026-02-11 03:35:53',NULL),(18,14,4,'https://res.cloudinary.com/dsr4zuujv/image/upload/v1770781031/skilllink/services/fydifywblnsz8lsiza9o.jpg','1a8fa468-46e6-4155-a851-8db3c1ba7fb7.jpeg',NULL,0,1,'2026-02-11 03:37:12',NULL),(19,16,5,'https://res.cloudinary.com/dsr4zuujv/image/upload/v1770781559/skilllink/services/m70oxarocxnysu0seayf.jpg','4b99b2c4-5218-40d0-8ca7-69d758d2ebe0.jpeg',NULL,0,1,'2026-02-11 03:46:00',NULL),(20,17,5,'https://res.cloudinary.com/dsr4zuujv/image/upload/v1770781581/skilllink/services/fzpcyxncq8uygo94h22z.jpg','bc77e944-5273-45c6-ac26-6336ff9679a7.jpeg',NULL,0,1,'2026-02-11 03:46:22',NULL),(21,18,5,'https://res.cloudinary.com/dsr4zuujv/image/upload/v1770781591/skilllink/services/von1haor9qhv98tzvzhy.jpg','6277d8dc-ac59-4a71-b03f-5af276c4b064.jpeg',NULL,0,1,'2026-02-11 03:46:34',NULL),(22,32,9,'https://res.cloudinary.com/dsr4zuujv/image/upload/v1770781777/skilllink/services/xnkyt3ilp0bbxrrbfalr.jpg','0d55d214-fde2-4d6a-95e5-378e0d8cdefe.jpeg',NULL,0,1,'2026-02-11 03:49:38',NULL),(23,34,9,'https://res.cloudinary.com/dsr4zuujv/image/upload/v1770781858/skilllink/services/lufm4abrvaiyoy4rqpap.jpg','532c3550-cfb8-4879-b633-aa3b4ba76930.jpeg',NULL,0,1,'2026-02-11 03:50:58',NULL),(24,33,9,'https://res.cloudinary.com/dsr4zuujv/image/upload/v1770781876/skilllink/services/ukyyzkxfdjuxyncmkp7e.jpg','ea239fb1-84e5-4ffd-9648-7c4dfaa81c75.jpeg',NULL,0,1,'2026-02-11 03:51:16',NULL),(25,24,7,'https://res.cloudinary.com/dsr4zuujv/image/upload/v1770782456/skilllink/services/suox5tit0ikj5u2lh3cu.jpg','24478361-260d-49db-b5d3-abf01a34c082.jpeg',NULL,0,1,'2026-02-11 04:00:57',NULL),(26,25,7,'https://res.cloudinary.com/dsr4zuujv/image/upload/v1770782512/skilllink/services/twcqvarodrtzpubyfnn6.jpg','2fe31470-7804-422d-a917-94acc8a1a09d.webp',NULL,0,1,'2026-02-11 04:01:53',NULL),(27,26,7,'https://res.cloudinary.com/dsr4zuujv/image/upload/v1770782600/skilllink/services/za5bq8yxblgy4advzvix.jpg','301d9d10-92ba-462e-95da-5916f04697dd.jpeg',NULL,0,1,'2026-02-11 04:03:20',NULL),(28,27,7,'https://res.cloudinary.com/dsr4zuujv/image/upload/v1770782613/skilllink/services/zmdkg0jua3qdyf64zfqy.jpg','b5dc637d-f606-4f4e-bdb8-d90c11255bd0.jpeg',NULL,0,1,'2026-02-11 04:03:36',NULL),(29,28,8,'https://res.cloudinary.com/dsr4zuujv/image/upload/v1770782962/skilllink/services/krckfcum9j5g8zbw91it.jpg','88180dd8-66e1-45a1-a00b-0eb9cc033b3a.jpeg',NULL,0,1,'2026-02-11 04:09:23',NULL),(30,29,8,'https://res.cloudinary.com/dsr4zuujv/image/upload/v1770782992/skilllink/services/lraiv8ttc9w7izivyczv.jpg','e3043c3e-d28d-4e26-9352-3bf01c00e58d.webp',NULL,0,1,'2026-02-11 04:09:53',NULL),(31,30,8,'https://res.cloudinary.com/dsr4zuujv/image/upload/v1770783039/skilllink/services/zqebxlhgv2cz7yzddyae.jpg','4e2643b7-0da8-4dae-8efe-ef9b8f7afc28.jpeg',NULL,0,1,'2026-02-11 04:10:40',NULL),(32,10,3,'https://res.cloudinary.com/dsr4zuujv/image/upload/v1770783477/skilllink/services/xjt7hqvhomxfwbwejn2k.jpg','501aa7ea-1bfb-4899-8871-138400159ebe.jpeg',NULL,0,1,'2026-02-11 04:17:58',NULL),(33,9,3,'https://res.cloudinary.com/dsr4zuujv/image/upload/v1770783507/skilllink/services/ambigmragwue42whrgmf.jpg','fbeed813-993b-4174-9039-41793ae9ba85.jpeg',NULL,0,1,'2026-02-11 04:18:28',NULL),(34,11,3,'https://res.cloudinary.com/dsr4zuujv/image/upload/v1770783611/skilllink/services/xz6y5k3u60jaibrjugf5.jpg','2ba91d3d-8c48-4267-8f7e-bf23454e7abf.jpeg',NULL,0,1,'2026-02-11 04:20:11',NULL),(35,36,10,'https://res.cloudinary.com/dsr4zuujv/image/upload/v1770783702/skilllink/services/ed9iywbhika5fuce6cdz.jpg','02a70800-be33-4024-91a1-8e8fc77b7b8b.jpeg',NULL,0,1,'2026-02-11 04:21:43',NULL),(36,39,10,'https://res.cloudinary.com/dsr4zuujv/image/upload/v1770783717/skilllink/services/mchljoptw2lkkue7xvma.jpg','b8fcee76-7156-4830-9460-69a93cee8b13.jpeg',NULL,0,1,'2026-02-11 04:21:58',NULL),(37,37,10,'https://res.cloudinary.com/dsr4zuujv/image/upload/v1770783762/skilllink/services/qgtxmghklcpejxe46ed1.jpg','6c0a5b96-a75b-4c37-a428-f7cec4a72a6c.jpeg',NULL,0,1,'2026-02-11 04:22:42',NULL),(38,38,10,'https://res.cloudinary.com/dsr4zuujv/image/upload/v1770783815/skilllink/services/rrzqyvxfaqhsro8v0goy.jpg','80e4bb24-848d-45ae-bd8e-757a4c7859cd.jpeg',NULL,0,1,'2026-02-11 04:23:36',NULL),(39,40,11,'https://res.cloudinary.com/dsr4zuujv/image/upload/v1770784021/skilllink/services/pqztwdvdkxgqg6izbthx.jpg','75d3d788-1236-41c4-a9e4-28ff3715314a.jpeg',NULL,0,1,'2026-02-11 04:27:02',NULL),(40,41,11,'https://res.cloudinary.com/dsr4zuujv/image/upload/v1770784051/skilllink/services/iodwk1go6pubtr4oialt.jpg','a3fb05e0-187d-4b19-a30e-5932b8a62d99.jpeg',NULL,0,1,'2026-02-11 04:27:32',NULL),(41,42,11,'https://res.cloudinary.com/dsr4zuujv/image/upload/v1770784064/skilllink/services/byneeaoxh35awl9a03hb.jpg','6913d132-74c9-49f2-a131-c2448793f664.jpeg',NULL,0,1,'2026-02-11 04:27:45',NULL),(42,20,6,'https://res.cloudinary.com/dsr4zuujv/image/upload/v1770784305/skilllink/services/ynmi6awc4o9k2ptou9jb.jpg','38111631-3011-4206-9ba5-f9a90ca32719.jpeg',NULL,0,1,'2026-02-11 04:31:46',NULL),(43,21,6,'https://res.cloudinary.com/dsr4zuujv/image/upload/v1770784317/skilllink/services/xy5sx81oyoyawkfjjs6o.jpg','f474d9b2-dfd2-48f9-9e19-9f51a6619408.jpeg',NULL,0,1,'2026-02-11 04:31:57',NULL),(44,22,6,'https://res.cloudinary.com/dsr4zuujv/image/upload/v1770784347/skilllink/services/ijnyrasg63zfrfi16wpu.jpg','03cdda4e-7ede-4628-bdf0-a072b1dee048.jpeg',NULL,0,1,'2026-02-11 04:32:27',NULL),(45,43,12,'https://res.cloudinary.com/dsr4zuujv/image/upload/v1770784503/skilllink/services/zom138kwgju0ijwmcml2.jpg','a499dbb5-3188-4ad4-b602-1c28d6575106.jpeg',NULL,0,1,'2026-02-11 04:35:04',NULL),(46,46,12,'https://res.cloudinary.com/dsr4zuujv/image/upload/v1770784548/skilllink/services/qmb3o9lfvpwq1xtqjrs5.jpg','1c948ac0-8c0a-4247-9767-956bd20cfa14.jpeg',NULL,0,1,'2026-02-11 04:35:49',NULL),(47,44,12,'https://res.cloudinary.com/dsr4zuujv/image/upload/v1770784642/skilllink/services/ml3mri3clpxabc8577d0.jpg','4c4916c4-1c7d-4261-b635-3e31e11f3e17.jpeg',NULL,0,1,'2026-02-11 04:37:23',NULL),(48,45,12,'https://res.cloudinary.com/dsr4zuujv/image/upload/v1770784653/skilllink/services/y70qljdeyncjx536cazg.jpg','523d9352-3de2-4e5b-bedd-8f86fd82a9e2.webp',NULL,0,1,'2026-02-11 04:37:34',NULL),(49,48,13,'https://res.cloudinary.com/dsr4zuujv/image/upload/v1770784752/skilllink/services/fcijkpyj4js2vasdyx2y.jpg','cbf04933-529c-469c-8282-b7376f2547af.jpeg',NULL,0,1,'2026-02-11 04:39:13',NULL),(50,47,13,'https://res.cloudinary.com/dsr4zuujv/image/upload/v1770784774/skilllink/services/tsxnotmltyqj2st7n8hx.jpg','8ea23713-c564-4796-83a7-5c00329c9847.jpeg',NULL,0,1,'2026-02-11 04:39:35',NULL),(51,49,13,'https://res.cloudinary.com/dsr4zuujv/image/upload/v1770784809/skilllink/services/a5pbhx2dtdchgw62asmo.jpg','036d00a5-7808-42f7-a078-0b544eac05b1.jpeg',NULL,0,1,'2026-02-11 04:40:10',NULL),(52,50,14,'https://res.cloudinary.com/dsr4zuujv/image/upload/v1770784923/skilllink/services/j0ypmj212vgvwm9eqbsi.jpg','5e80401b-e0d9-4c6b-8028-f8094e115d2a.jpeg',NULL,0,1,'2026-02-11 04:42:03',NULL),(53,51,14,'https://res.cloudinary.com/dsr4zuujv/image/upload/v1770784936/skilllink/services/d2olabsb6wnmwg9ipqm5.jpg','8c9e2219-0781-4ccd-8ec4-a53d6ab86383.jpeg',NULL,0,1,'2026-02-11 04:42:17',NULL),(54,52,14,'https://res.cloudinary.com/dsr4zuujv/image/upload/v1770784992/skilllink/services/fqsrmvvkpvgfor2lomxn.jpg','e454d539-7623-4db6-8659-409faa5531b8.jpeg',NULL,0,1,'2026-02-11 04:43:13',NULL),(55,53,15,'https://res.cloudinary.com/dsr4zuujv/image/upload/v1770785455/skilllink/services/mpsmofmareibl1mqagbp.jpg','c65c274e-d619-4f92-b718-ee087c606a2e.jpeg',NULL,0,1,'2026-02-11 04:50:56',NULL),(57,55,15,'https://res.cloudinary.com/dsr4zuujv/image/upload/v1770785481/skilllink/services/ckwl4aesshrjxpmuisbp.jpg','7b7f3d4a-337e-4f77-b307-7be17b968695.jpeg',NULL,0,1,'2026-02-11 04:51:22',NULL),(58,56,15,'https://res.cloudinary.com/dsr4zuujv/image/upload/v1770785502/skilllink/services/yu2dagcetp8izbnhugh3.jpg','95c4e0fd-8523-4245-a325-ad31b5191fff.jpeg',NULL,0,1,'2026-02-11 04:51:43',NULL),(59,54,15,'https://res.cloudinary.com/dsr4zuujv/image/upload/v1770785537/skilllink/services/kvfhwybfkoyurdvlnknv.jpg','192ecc03-357d-40c8-8d3b-4fb075d466b3.jpeg',NULL,0,1,'2026-02-11 04:52:18',NULL),(60,57,16,'https://res.cloudinary.com/dsr4zuujv/image/upload/v1770785706/skilllink/services/nlwgqsnxfzzpthwrb5xb.jpg','d20a07ff-f537-4e54-a5f0-df0577f9e6b7.jpeg',NULL,0,1,'2026-02-11 04:55:06',NULL),(61,58,16,'https://res.cloudinary.com/dsr4zuujv/image/upload/v1770785788/skilllink/services/dfo1ua3basasth4lhzal.jpg','e5ff6353-3a34-4a9c-b603-fb52bc57344f.jpeg',NULL,0,1,'2026-02-11 04:56:29',NULL),(62,60,17,'https://res.cloudinary.com/dsr4zuujv/image/upload/v1770785988/skilllink/services/uepzgyglc25ugppbcwpz.jpg','f9de01f1-d17a-4db0-a4fd-53fb76f9311f.jpeg',NULL,0,1,'2026-02-11 04:59:49',NULL),(63,61,17,'https://res.cloudinary.com/dsr4zuujv/image/upload/v1770786038/skilllink/services/peq6x06pfdvqns8fiv5i.jpg','411795c2-a154-419a-ba48-cb924df146ff.jpeg',NULL,0,1,'2026-02-11 05:00:39',NULL),(64,62,17,'https://res.cloudinary.com/dsr4zuujv/image/upload/v1770786105/skilllink/services/cimx5o9v7vi1nnk0idpk.jpg','173bddf8-a101-4770-8ea0-0f0926079e61.jpeg',NULL,0,1,'2026-02-11 05:01:45',NULL),(65,64,18,'https://res.cloudinary.com/dsr4zuujv/image/upload/v1770786276/skilllink/services/iwrzjz2qkbdcj5c4msyg.jpg','74da4773-2441-46be-a199-508909fa93bf.jpeg',NULL,0,1,'2026-02-11 05:04:37',NULL),(66,65,18,'https://res.cloudinary.com/dsr4zuujv/image/upload/v1770786294/skilllink/services/mwt2bpmxbiecl21l1ccf.jpg','30894558-868d-42c9-8253-f61029b77070.jpeg',NULL,0,1,'2026-02-11 05:04:54',NULL),(67,66,18,'https://res.cloudinary.com/dsr4zuujv/image/upload/v1770786334/skilllink/services/ndzmoqljtvfb7ysovgu1.jpg','43565342-10f8-4325-b150-d1f65b28e8b0.jpeg',NULL,0,1,'2026-02-11 05:05:34',NULL),(68,67,19,'https://res.cloudinary.com/dsr4zuujv/image/upload/v1770786504/skilllink/services/uspsz5szbzpy0ccxr2ez.jpg','5a8802c4-8f47-4593-82d4-7482c8a8c3d5.jpeg',NULL,0,1,'2026-02-11 05:08:25',NULL),(70,70,19,'https://res.cloudinary.com/dsr4zuujv/image/upload/v1770786618/skilllink/services/gyiygvrc3yyqbmtmrzdh.jpg','00b5810d-2d9d-4b4a-bfa5-c823fa7538c5.jpeg',NULL,0,1,'2026-02-11 05:10:19',NULL),(71,69,19,'https://res.cloudinary.com/dsr4zuujv/image/upload/v1770786644/skilllink/services/a4iugk9rvelsofoebujq.jpg','b5afa18b-c27c-4369-8ecf-6899e3dbf751.jpeg',NULL,0,1,'2026-02-11 05:10:44',NULL),(72,68,19,'https://res.cloudinary.com/dsr4zuujv/image/upload/v1770786662/skilllink/services/biroqeckf3spu58gh6wr.jpg','037e37fa-8fe8-45f7-a2b2-256e2062fc63.jpeg',NULL,0,1,'2026-02-11 05:11:03',NULL),(73,71,20,'https://res.cloudinary.com/dsr4zuujv/image/upload/v1770787055/skilllink/services/y1ozbdcyvgiqo9erkgsb.jpg','d1cba2a1-a71c-4686-9896-8f4d4772341d.jpeg',NULL,0,1,'2026-02-11 05:17:35',NULL),(74,72,20,'https://res.cloudinary.com/dsr4zuujv/image/upload/v1770787068/skilllink/services/d7fmpium72l0pajoqgnv.jpg','1f4ad0f5-7337-4d14-bba9-f086dbce9e92.jpeg',NULL,0,1,'2026-02-11 05:17:49',NULL),(75,73,20,'https://res.cloudinary.com/dsr4zuujv/image/upload/v1770787083/skilllink/services/iyzbyiquvwrjk9znuwo6.jpg','a67f6a89-1736-448e-af91-3b288c97592f.jpeg',NULL,0,1,'2026-02-11 05:18:03',NULL),(76,74,21,'https://res.cloudinary.com/dsr4zuujv/image/upload/v1770787663/skilllink/services/ehcbrba3fxs6ukubzscy.jpg','a0bc709c-488b-4a17-a80c-42eadfc6f2ab.jpeg',NULL,0,1,'2026-02-11 05:27:44',NULL),(77,74,21,'https://res.cloudinary.com/dsr4zuujv/image/upload/v1770787665/skilllink/services/hyrho9w7pufiy9w5jlob.jpg','0876907f-583a-4d64-b12a-783745e0259c.jpeg',NULL,1,1,'2026-02-11 05:27:46',NULL),(78,74,21,'https://res.cloudinary.com/dsr4zuujv/image/upload/v1770787673/skilllink/services/kmnos21acfli4qr2vw3k.jpg','7ccda37f-ad7d-47dc-8f0e-59360991246f.jpeg',NULL,2,1,'2026-02-11 05:27:54',NULL),(79,74,21,'https://res.cloudinary.com/dsr4zuujv/image/upload/v1770787676/skilllink/services/aqshvmxq6epiragpbkzd.jpg','67c0b9f7-3a02-4aa0-bc51-848fc18c9513.jpeg',NULL,3,1,'2026-02-11 05:27:57',NULL),(80,74,21,'https://res.cloudinary.com/dsr4zuujv/image/upload/v1770787679/skilllink/services/ynzqttbvguwsqqaxghk7.jpg','c3a3cb26-0d88-46ea-84d9-7989d327d8b4.jpeg',NULL,4,1,'2026-02-11 05:28:00',NULL),(81,74,21,'https://res.cloudinary.com/dsr4zuujv/image/upload/v1770787683/skilllink/services/ymzmh5x7edf0ryf7h2fi.jpg','e12ea83d-52f8-426c-93d0-19d279fb401f.jpeg',NULL,5,1,'2026-02-11 05:28:04',NULL);
/*!40000 ALTER TABLE `service_gallery` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `service_requests`
--

DROP TABLE IF EXISTS `service_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `service_requests` (
  `request_id` int NOT NULL AUTO_INCREMENT,
  `client_user_id` int NOT NULL,
  `contact_phone` varchar(20) DEFAULT NULL,
  `provider_id` int NOT NULL,
  `service_id` int NOT NULL,
  `request_title` varchar(200) NOT NULL,
  `request_description` text NOT NULL,
  `service_address` varchar(500) DEFAULT NULL,
  `address_details` text,
  `service_latitude` decimal(10,8) DEFAULT NULL,
  `service_longitude` decimal(11,8) DEFAULT NULL,
  `distance_km` decimal(10,2) DEFAULT NULL,
  `preferred_date` date DEFAULT NULL,
  `preferred_time` time DEFAULT NULL,
  `status` enum('pending','accepted','in_progress','completed','cancelled') DEFAULT 'pending',
  `estimated_cost` decimal(10,2) DEFAULT NULL,
  `final_cost` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `completed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`request_id`),
  KEY `idx_client` (`client_user_id`),
  KEY `idx_provider` (`provider_id`),
  KEY `idx_status` (`status`),
  KEY `fk_requests_service` (`service_id`),
  CONSTRAINT `fk_requests_provider` FOREIGN KEY (`provider_id`) REFERENCES `provider_profiles` (`provider_id`),
  CONSTRAINT `fk_requests_service` FOREIGN KEY (`service_id`) REFERENCES `services` (`service_id`),
  CONSTRAINT `service_requests_ibfk_1` FOREIGN KEY (`client_user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_requests`
--

LOCK TABLES `service_requests` WRITE;
/*!40000 ALTER TABLE `service_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `service_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `services`
--

DROP TABLE IF EXISTS `services`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `services` (
  `service_id` int NOT NULL AUTO_INCREMENT,
  `provider_id` int NOT NULL,
  `category_id` int NOT NULL,
  `service_title` varchar(200) NOT NULL,
  `service_description` text NOT NULL,
  `base_price` decimal(10,2) DEFAULT NULL,
  `price_type` enum('fixed','hourly','negotiable') DEFAULT 'fixed',
  `estimated_duration_minutes` int DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `approval_status` enum('pending','approved','rejected') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_verified` tinyint(1) DEFAULT '0',
  `verification_date` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`service_id`),
  KEY `idx_provider` (`provider_id`),
  KEY `idx_category` (`category_id`),
  KEY `idx_active` (`is_active`),
  CONSTRAINT `services_ibfk_1` FOREIGN KEY (`provider_id`) REFERENCES `provider_profiles` (`provider_id`) ON DELETE CASCADE,
  CONSTRAINT `services_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `service_categories` (`category_id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=75 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `services`
--

LOCK TABLES `services` WRITE;
/*!40000 ALTER TABLE `services` DISABLE KEYS */;
INSERT INTO `services` VALUES (1,1,1,'Reparación de Tuberías','Reparación de tuberías dañadas, fugas, roturas. Incluye materiales y mano de obra.',75.00,'fixed',120,1,'approved','2026-02-11 02:36:42','2026-02-11 03:20:30',1,NULL),(2,1,1,'Instalación de Sanitarios','Instalación completa de inodoros, lavamanos, duchas. Trabajo profesional garantizado.',150.00,'fixed',180,1,'approved','2026-02-11 02:36:42','2026-02-11 03:22:03',1,NULL),(3,1,1,'Destapado de Desagües','Servicio de destapado rápido con equipo especializado. Emergencias atendidas.',50.00,'fixed',60,1,'approved','2026-02-11 02:36:42','2026-02-11 03:22:49',1,NULL),(5,2,2,'Instalación Eléctrica Completa','Instalación de sistemas eléctricos residenciales. Cableado, paneles, tomas, interruptores.',250.00,'negotiable',480,1,'approved','2026-02-11 02:36:42','2026-02-11 03:28:59',1,NULL),(6,2,2,'Reparación de Circuitos','Reparación de circuitos eléctricos defectuosos. Diagnóstico incluido.',80.00,'hourly',120,1,'approved','2026-02-11 02:36:42','2026-02-11 03:29:13',1,NULL),(7,2,2,'Instalación de Luminarias','Instalación de lámparas, reflectores, iluminación LED. Diseño de iluminación.',60.00,'fixed',90,1,'approved','2026-02-11 02:36:42','2026-02-11 03:29:25',1,NULL),(9,3,3,'Corte de Cabello Caballero','Corte profesional para caballeros. Incluye lavado y estilizado.',18.00,'fixed',45,1,'approved','2026-02-11 02:36:42','2026-02-11 04:18:31',1,NULL),(10,3,3,'Diseño de Barba','Diseño y perfilado de barba. Acabado profesional con productos premium.',15.00,'fixed',30,1,'approved','2026-02-11 02:36:42','2026-02-11 04:18:01',1,NULL),(11,3,3,'Corte + Barba Combo','Combo especial: corte de cabello + diseño de barba. Mejor precio.',28.00,'fixed',60,1,'approved','2026-02-11 02:36:42','2026-02-11 04:20:14',1,NULL),(12,4,4,'Limpieza General de Hogar','Limpieza completa de vivienda. Pisos, baños, cocina, habitaciones.',90.00,'fixed',240,1,'approved','2026-02-11 02:36:42','2026-02-11 03:34:37',1,NULL),(13,4,4,'Limpieza Profunda','Limpieza profunda incluyendo ventanas, gabinetes, áreas difíciles.',180.00,'fixed',480,1,'approved','2026-02-11 02:36:42','2026-02-11 03:35:56',1,NULL),(14,4,4,'Limpieza de Oficinas','Limpieza comercial para oficinas. Servicio diario, semanal o mensual.',120.00,'fixed',180,1,'approved','2026-02-11 02:36:42','2026-02-11 03:37:15',1,NULL),(16,5,5,'Pintura Interior Completa','Pintura de interiores con preparación de superficie, sellador y dos manos.',400.00,'negotiable',600,1,'approved','2026-02-11 02:36:42','2026-02-11 03:46:02',1,NULL),(17,5,5,'Pintura de Fachadas','Pintura exterior resistente. Limpieza, reparación de grietas, aplicación profesional.',600.00,'negotiable',720,1,'approved','2026-02-11 02:36:42','2026-02-11 03:46:24',1,NULL),(18,5,5,'Texturas Decorativas','Aplicación de texturas decorativas en paredes. Variedad de diseños.',220.00,'negotiable',360,1,'approved','2026-02-11 02:36:42','2026-02-11 03:46:36',1,NULL),(20,6,8,'Reparación de Computadoras','Diagnóstico y reparación de PCs y laptops. Cambio de piezas, limpieza, software.',50.00,'hourly',120,1,'approved','2026-02-11 02:36:42','2026-02-11 04:31:47',1,NULL),(21,6,8,'Instalación de Redes','Configuración de redes empresariales y domésticas. Cableado estructurado, WiFi.',220.00,'fixed',300,1,'approved','2026-02-11 02:36:42','2026-02-11 04:32:00',1,NULL),(22,6,8,'Soporte Técnico Remoto','Asistencia técnica remota. Resolución de problemas de software y configuración.',35.00,'hourly',60,1,'approved','2026-02-11 02:36:42','2026-02-11 04:32:30',1,NULL),(24,7,6,'Construcción de Viviendas','Construcción completa de casas. Desde planos hasta entrega de llaves.',30000.00,'negotiable',21600,1,'approved','2026-02-11 02:36:42','2026-02-11 04:01:00',1,NULL),(25,7,6,'Ampliaciones','Ampliación de viviendas. Segundos pisos, cuartos adicionales, terrazas.',10000.00,'negotiable',7200,1,'approved','2026-02-11 02:36:42','2026-02-11 04:01:55',1,NULL),(26,7,6,'Remodelación de Cocinas','Remodelación completa de cocinas. Gabinetes, pisos, azulejos, instalaciones.',4000.00,'negotiable',1200,1,'approved','2026-02-11 02:36:42','2026-02-11 04:03:23',1,NULL),(27,7,6,'Remodelación de Baños','Renovación completa de baños. Sanitarios, azulejos, grifería moderna.',2800.00,'negotiable',900,1,'approved','2026-02-11 02:36:42','2026-02-11 04:03:41',1,NULL),(28,8,7,'Muebles a Medida','Fabricación de muebles personalizados según necesidades del cliente.',900.00,'negotiable',1200,1,'approved','2026-02-11 02:36:42','2026-02-11 04:09:26',1,NULL),(29,8,7,'Closets Empotrados','Diseño e instalación de closets empotrados. Optimización de espacio.',1400.00,'fixed',960,1,'approved','2026-02-11 02:36:42','2026-02-11 04:09:55',1,NULL),(30,8,7,'Cocinas Integrales','Diseño y fabricación de cocinas integrales. Materiales de alta calidad.',2800.00,'negotiable',1800,1,'approved','2026-02-11 02:36:42','2026-02-11 04:10:42',1,NULL),(32,9,9,'Mantenimiento de Jardines','Corte de césped, poda de arbustos, limpieza. Servicio quincenal o mensual.',70.00,'fixed',180,1,'approved','2026-02-11 02:36:42','2026-02-11 03:49:40',1,NULL),(33,9,9,'Diseño Paisajístico','Diseño profesional de jardines. Creación de espacios verdes funcionales.',350.00,'negotiable',600,1,'approved','2026-02-11 02:36:42','2026-02-11 03:51:18',1,NULL),(34,9,9,'Poda de Árboles','Poda técnica de árboles. Eliminación de ramas secas o peligrosas.',120.00,'fixed',300,1,'approved','2026-02-11 02:36:42','2026-02-11 03:51:01',1,NULL),(36,10,10,'Corte de Cabello Dama','Corte profesional para damas con lavado y secado incluido.',22.00,'fixed',60,1,'approved','2026-02-11 02:36:42','2026-02-11 04:21:45',1,NULL),(37,10,10,'Tinte Completo','Aplicación de tinte permanente. Incluye lavado y secado.',65.00,'fixed',150,1,'approved','2026-02-11 02:36:42','2026-02-11 04:22:45',1,NULL),(38,10,10,'Manicure y Pedicure','Servicio completo de uñas. Esmaltado permanente disponible.',35.00,'fixed',90,1,'approved','2026-02-11 02:36:42','2026-02-11 04:23:38',1,NULL),(39,10,10,'Tratamientos Capilares','Keratina, botox capilar, hidratación profunda.',80.00,'fixed',120,1,'approved','2026-02-11 02:36:42','2026-02-11 04:22:00',1,NULL),(40,11,10,'Tratamientos Faciales','Limpieza facial, hidratación, mascarillas según tipo de piel.',50.00,'fixed',90,1,'approved','2026-02-11 02:36:42','2026-02-11 04:27:04',1,NULL),(41,11,10,'Masajes Relajantes','Masajes terapéuticos y relajantes. Aromaterapia incluida.',55.00,'hourly',60,1,'approved','2026-02-11 02:36:42','2026-02-11 04:27:35',1,NULL),(42,11,10,'Depilación Láser','Depilación definitiva con tecnología láser. Sesión individual.',45.00,'fixed',45,1,'approved','2026-02-11 02:36:42','2026-02-11 04:27:48',1,NULL),(43,12,11,'Organización de Bodas','Planificación completa de bodas. Coordinación de proveedores, decoración.',1800.00,'negotiable',1800,1,'approved','2026-02-11 02:36:42','2026-02-11 04:35:06',1,NULL),(44,12,11,'Eventos Corporativos','Organización de eventos empresariales. Conferencias, lanzamientos.',1200.00,'negotiable',1200,1,'approved','2026-02-11 02:36:42','2026-02-11 04:37:25',1,NULL),(45,12,11,'Quinceaños','Organización completa de quinceaños. Decoración, cronograma, coordinación.',900.00,'negotiable',900,1,'approved','2026-02-11 02:36:42','2026-02-11 04:37:35',1,NULL),(46,12,11,'Decoración de Eventos','Decoración temática para eventos. Montaje y desmontaje incluido.',450.00,'fixed',540,1,'approved','2026-02-11 02:36:42','2026-02-11 04:35:51',1,NULL),(47,13,11,'Catering para Eventos','Servicio de comida para eventos. Menú personalizado, montaje incluido.',28.00,'fixed',300,1,'approved','2026-02-11 02:36:42','2026-02-11 04:39:38',1,NULL),(48,13,11,'Bocadillos y Pasapalos','Variedad de bocadillos para eventos. Opciones dulces y saladas.',18.00,'fixed',180,1,'approved','2026-02-11 02:36:42','2026-02-11 04:39:16',1,NULL),(49,13,11,'Banquetes Gourmet','Menú gourmet para eventos especiales. Chef profesional.',45.00,'fixed',360,1,'approved','2026-02-11 02:36:42','2026-02-11 04:40:12',1,NULL),(50,14,12,'Mudanzas Locales','Servicio de mudanza dentro de la GAM. Personal capacitado.',180.00,'fixed',480,1,'approved','2026-02-11 02:36:42','2026-02-11 04:42:06',1,NULL),(51,14,12,'Mudanzas Nacionales','Mudanzas a cualquier parte del país. Seguro incluido.',500.00,'negotiable',960,1,'approved','2026-02-11 02:36:42','2026-02-11 04:42:20',1,NULL),(52,14,12,'Embalaje Profesional','Servicio de embalaje de artículos frágiles y delicados.',100.00,'fixed',240,1,'approved','2026-02-11 02:36:42','2026-02-11 04:43:19',1,NULL),(53,15,13,'Mantenimiento Preventivo','Cambio de aceite, filtros, revisión de frenos y suspensión.',130.00,'fixed',180,1,'approved','2026-02-11 02:36:42','2026-02-11 04:50:58',1,NULL),(54,15,13,'Reparación de Frenos','Cambio de pastillas, discos, cilindros. Materiales originales.',160.00,'fixed',150,1,'approved','2026-02-11 02:36:42','2026-02-11 04:52:24',1,NULL),(55,15,13,'Sistema Eléctrico Automotriz','Diagnóstico y reparación de sistema eléctrico. Alternador, batería.',90.00,'hourly',180,1,'approved','2026-02-11 02:36:42','2026-02-11 04:51:24',1,NULL),(56,15,13,'Diagnóstico Computarizado','Diagnóstico completo con scanner. Detección de fallas.',40.00,'fixed',60,1,'approved','2026-02-11 02:36:42','2026-02-11 04:51:45',1,NULL),(57,16,13,'Alineación y Balanceo','Servicio de alineación y balanceo computarizado.',50.00,'fixed',90,1,'approved','2026-02-11 02:36:42','2026-02-11 04:55:10',1,NULL),(58,16,13,'Cambio de Aceite Express','Cambio de aceite rápido. Incluye filtro y revisión general.',35.00,'fixed',30,1,'approved','2026-02-11 02:36:42','2026-02-11 04:56:31',1,NULL),(59,16,13,'Revisión Técnica','Preparación para revisión técnica vehicular. Diagnóstico completo.',65.00,'fixed',120,1,'approved','2026-02-11 02:36:42','2026-02-11 02:36:42',1,NULL),(60,17,14,'Fotografía de Bodas','Cobertura completa de bodas. Álbum digital en alta resolución.',650.00,'fixed',540,1,'approved','2026-02-11 02:36:42','2026-02-11 04:59:51',1,NULL),(61,17,14,'Quinceaños y Graduaciones','Cobertura de eventos sociales. Edición profesional incluida.',380.00,'fixed',360,1,'approved','2026-02-11 02:36:42','2026-02-11 05:00:42',1,NULL),(62,17,14,'Eventos Corporativos','Fotografía de eventos empresariales. Entrega en 48 horas.',450.00,'fixed',300,1,'approved','2026-02-11 02:36:42','2026-02-11 05:01:47',1,NULL),(64,18,14,'Sesión de Embarazo','Sesiones especiales para mamás embarazadas. Locación incluida.',200.00,'fixed',120,1,'approved','2026-02-11 02:36:42','2026-02-11 05:04:41',1,NULL),(65,18,14,'Fotografía de Bebés','Sesiones para recién nacidos y bebés. Props incluidos.',220.00,'fixed',150,1,'approved','2026-02-11 02:36:42','2026-02-11 05:04:57',1,NULL),(66,18,14,'Sesión Familiar','Sesiones fotográficas familiares. Interior o exterior.',180.00,'fixed',120,1,'approved','2026-02-11 02:36:42','2026-02-11 05:05:41',1,NULL),(67,19,15,'Consulta Veterinaria','Consulta médica veterinaria a domicilio. Revisión general.',40.00,'fixed',45,1,'approved','2026-02-11 02:36:42','2026-02-11 05:08:28',1,NULL),(68,19,15,'Vacunación Completa','Aplicación de vacunas para perros y gatos. Esquema completo.',30.00,'fixed',30,1,'approved','2026-02-11 02:36:42','2026-02-11 05:11:05',1,NULL),(69,19,15,'Desparasitación','Desparasitación interna y externa. Productos de calidad.',25.00,'fixed',20,1,'approved','2026-02-11 02:36:42','2026-02-11 05:10:47',1,NULL),(70,19,15,'Emergencias Veterinarias','Atención de emergencias 24/7. Servicio a domicilio.',90.00,'hourly',60,1,'approved','2026-02-11 02:36:42','2026-02-11 05:10:21',1,NULL),(71,20,15,'Consulta Mascotas Exóticas','Consulta especializada para aves, reptiles, roedores.',50.00,'fixed',60,1,'approved','2026-02-11 02:36:42','2026-02-11 05:17:38',1,NULL),(72,20,15,'Cirugías Menores Exóticos','Cirugías menores para mascotas exóticas. Clínica equipada.',150.00,'fixed',180,1,'approved','2026-02-11 02:36:42','2026-02-11 05:17:51',1,NULL),(73,20,15,'Asesoría en Cuidados','Asesoría completa sobre alimentación y cuidados de exóticos.',35.00,'fixed',45,1,'approved','2026-02-11 02:36:42','2026-02-11 05:18:06',1,NULL),(74,21,14,'Fotografía de retrato ','Fotografía de retrato con iluminación natural ',60.00,'negotiable',60,1,'approved','2026-02-11 05:26:17','2026-02-11 05:28:51',1,'2026-02-11 05:28:52');
/*!40000 ALTER TABLE `services` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subscription_plans`
--

DROP TABLE IF EXISTS `subscription_plans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subscription_plans` (
  `plan_id` int NOT NULL AUTO_INCREMENT,
  `plan_name` varchar(100) NOT NULL,
  `plan_description` text,
  `price` decimal(10,2) NOT NULL,
  `billing_cycle` enum('monthly','quarterly','yearly') DEFAULT 'monthly',
  `features` json DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`plan_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscription_plans`
--

LOCK TABLES `subscription_plans` WRITE;
/*!40000 ALTER TABLE `subscription_plans` DISABLE KEYS */;
INSERT INTO `subscription_plans` VALUES (1,'Free','Plan gratuito con funciones básicas',0.00,'monthly','{\"analytics\": false, \"max_photos\": 3, \"priority_listing\": false}',1,'2025-12-25 23:26:31','2025-12-25 23:26:31'),(2,'Pro','Plan profesional con todas las funciones',9.99,'monthly','{\"analytics\": true, \"max_photos\": 20, \"auto_response\": true, \"priority_listing\": true}',1,'2025-12-25 23:26:31','2025-12-25 23:26:31');
/*!40000 ALTER TABLE `subscription_plans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_settings`
--

DROP TABLE IF EXISTS `system_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_settings` (
  `setting_id` int NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text,
  `setting_type` varchar(50) DEFAULT NULL,
  `description` text,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`setting_id`),
  UNIQUE KEY `setting_key` (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_settings`
--

LOCK TABLES `system_settings` WRITE;
/*!40000 ALTER TABLE `system_settings` DISABLE KEYS */;
/*!40000 ALTER TABLE `system_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transactions`
--

DROP TABLE IF EXISTS `transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transactions` (
  `transaction_id` bigint NOT NULL AUTO_INCREMENT,
  `request_id` int DEFAULT NULL,
  `subscription_id` int DEFAULT NULL,
  `payer_user_id` int NOT NULL,
  `payee_user_id` int DEFAULT NULL,
  `transaction_type` enum('service_payment','subscription','commission','refund') NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `commission_amount` decimal(10,2) DEFAULT '0.00',
  `net_amount` decimal(10,2) NOT NULL,
  `currency` varchar(3) DEFAULT 'USD',
  `payment_method` varchar(50) DEFAULT NULL,
  `payment_status` enum('pending','completed','failed','refunded') DEFAULT 'pending',
  `external_transaction_id` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`transaction_id`),
  KEY `request_id` (`request_id`),
  KEY `subscription_id` (`subscription_id`),
  KEY `payee_user_id` (`payee_user_id`),
  KEY `idx_payer` (`payer_user_id`),
  KEY `idx_status` (`payment_status`),
  CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`request_id`) REFERENCES `service_requests` (`request_id`) ON DELETE SET NULL,
  CONSTRAINT `transactions_ibfk_2` FOREIGN KEY (`subscription_id`) REFERENCES `provider_subscriptions` (`subscription_id`) ON DELETE SET NULL,
  CONSTRAINT `transactions_ibfk_3` FOREIGN KEY (`payer_user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `transactions_ibfk_4` FOREIGN KEY (`payee_user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transactions`
--

LOCK TABLES `transactions` WRITE;
/*!40000 ALTER TABLE `transactions` DISABLE KEYS */;
/*!40000 ALTER TABLE `transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_profiles`
--

DROP TABLE IF EXISTS `user_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_profiles` (
  `profile_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `date_of_birth` date DEFAULT NULL,
  `bio` text,
  `address_line1` varchar(255) DEFAULT NULL,
  `address_line2` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state_province` varchar(100) DEFAULT NULL,
  `postal_code` varchar(20) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `gender` varchar(20) DEFAULT NULL,
  `latitude` varchar(50) DEFAULT NULL,
  `longitude` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`profile_id`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_profiles`
--

LOCK TABLES `user_profiles` WRITE;
/*!40000 ALTER TABLE `user_profiles` DISABLE KEYS */;
INSERT INTO `user_profiles` VALUES (1,1,'Jamel','Administrador',NULL,'Administrador del sistema SkillLink',NULL,NULL,'San José','San José',NULL,'Costa Rica','Masculino',NULL,NULL),(2,2,'Gerald','Administrador',NULL,'Administrador del sistema SkillLink',NULL,NULL,'Heredia','Heredia',NULL,'Costa Rica','Masculino',NULL,NULL),(3,3,'Daisy','Administrador',NULL,'Administradora del sistema SkillLink',NULL,NULL,'Alajuela','Alajuela',NULL,'Costa Rica','Femenino',NULL,NULL),(4,4,'Glend','Administrador',NULL,'Administrador del sistema SkillLink',NULL,NULL,'Cartago','Cartago',NULL,'Costa Rica','Masculino',NULL,NULL),(5,5,'Rachel','Administrador',NULL,'Administradora del sistema SkillLink',NULL,NULL,'Guápiles','Limón',NULL,'Costa Rica','Femenino',NULL,NULL),(6,6,'Admin','Principal',NULL,'Administrador principal del sistema',NULL,NULL,'San José','San José',NULL,'Costa Rica','Masculino',NULL,NULL),(7,7,'Carlos','González','1985-05-15','Plomero profesional certificado con 12 años de experiencia',NULL,NULL,'San José','San José',NULL,'Costa Rica','Masculino',NULL,NULL),(8,8,'Ana María','Rodríguez','1990-08-20','Electricista certificada con especialización en sistemas industriales',NULL,NULL,'Heredia','Heredia',NULL,'Costa Rica','Femenino',NULL,NULL),(9,9,'Miguel','Vargas','1988-03-10','Barbero profesional con estilo moderno y clásico',NULL,NULL,'Alajuela','Alajuela',NULL,'Costa Rica','Masculino',NULL,NULL),(10,10,'Laura','Fernández','1992-11-25','Especialista en limpieza profunda residencial y comercial',NULL,NULL,'Cartago','Cartago',NULL,'Costa Rica','Femenino',NULL,NULL),(11,11,'Roberto','Jiménez','1987-07-30','Pintor profesional con 15 años de experiencia',NULL,NULL,'Guápiles','Limón',NULL,'Costa Rica','Masculino',NULL,NULL),(12,12,'María','González','1991-12-12','Ingeniera en sistemas, reparación y soporte técnico',NULL,NULL,'Puntarenas','Puntarenas',NULL,'Costa Rica','Femenino',NULL,NULL),(13,13,'José','Ramírez','1983-09-18','Maestro de obras con 18 años de experiencia',NULL,NULL,'San José','San José',NULL,'Costa Rica','Masculino',NULL,NULL),(14,14,'Juan','Sánchez','1986-04-22','Carpintero artesanal, muebles a medida',NULL,NULL,'Heredia','Heredia',NULL,'Costa Rica','Masculino',NULL,NULL),(15,15,'Pedro','Castro','1989-01-14','Jardinero profesional y paisajista certificado',NULL,NULL,'Alajuela','Alajuela',NULL,'Costa Rica','Masculino',NULL,NULL),(16,16,'Mariana','López','1993-06-08','Cosmetóloga profesional con 10 años de experiencia',NULL,NULL,'Cartago','Cartago',NULL,'Costa Rica','Femenino',NULL,NULL),(17,17,'Sofía','Hernández','1990-10-05','Terapeuta de spa certificada internacionalmente',NULL,NULL,'San José','San José',NULL,'Costa Rica','Femenino',NULL,NULL),(18,18,'Diana','Rojas','1988-02-28','Organizadora profesional de eventos corporativos',NULL,NULL,'Heredia','Heredia',NULL,'Costa Rica','Femenino',NULL,NULL),(19,19,'Manuel','Vega','1985-08-16','Chef especializado en catering y banquetes',NULL,NULL,'Alajuela','Alajuela',NULL,'Costa Rica','Masculino',NULL,NULL),(20,20,'Ricardo','Solano','1987-11-20','Empresa de mudanzas con 12 años en el mercado',NULL,NULL,'Cartago','Cartago',NULL,'Costa Rica','Masculino',NULL,NULL),(21,21,'Miguel','Arias','1984-05-30','Mecánico automotriz certificado',NULL,NULL,'Guápiles','Limón',NULL,'Costa Rica','Masculino',NULL,NULL),(22,22,'Daniel','Chaves','1991-09-12','Especialista en mantenimiento preventivo vehicular',NULL,NULL,'Puntarenas','Puntarenas',NULL,'Costa Rica','Masculino',NULL,NULL),(23,23,'Esteban','Picado','1989-03-25','Fotógrafo profesional de eventos sociales',NULL,NULL,'San José','San José',NULL,'Costa Rica','Masculino',NULL,NULL),(24,24,'Gabriela','Monge','1992-07-19','Fotógrafa especializada en bodas',NULL,NULL,'Heredia','Heredia',NULL,'Costa Rica','Femenino',NULL,NULL),(25,25,'Dra. Patricia','Cordero','1986-12-03','Médica veterinaria, atención a domicilio',NULL,NULL,'Alajuela','Alajuela',NULL,'Costa Rica','Femenino',NULL,NULL),(26,26,'Fernando','Mora','1990-04-15','Veterinario especialista en mascotas exóticas',NULL,NULL,'Cartago','Cartago',NULL,'Costa Rica','Masculino',NULL,NULL),(27,27,'Gerald','Calderón Castillo','2004-01-10','Hola, soy Gerald, fotógrafo de retratos ','La Victoria',NULL,'Sarapiquí ','Heredia ',NULL,'Costa Rica ','Masculino','','');
/*!40000 ALTER TABLE `user_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_roles`
--

DROP TABLE IF EXISTS `user_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_roles` (
  `user_role_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `role_id` int NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `assigned_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_role_id`),
  UNIQUE KEY `unique_user_role` (`user_id`,`role_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_role_id` (`role_id`),
  CONSTRAINT `user_roles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `user_roles_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=90 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_roles`
--

LOCK TABLES `user_roles` WRITE;
/*!40000 ALTER TABLE `user_roles` DISABLE KEYS */;
INSERT INTO `user_roles` VALUES (62,1,3,1,'2026-02-11 02:36:42'),(63,2,3,1,'2026-02-11 02:36:42'),(64,3,3,1,'2026-02-11 02:36:42'),(65,4,3,1,'2026-02-11 02:36:42'),(66,5,3,1,'2026-02-11 02:36:42'),(67,6,3,1,'2026-02-11 02:36:42'),(68,7,2,1,'2026-02-11 02:36:42'),(69,8,2,1,'2026-02-11 02:36:42'),(70,9,2,1,'2026-02-11 02:36:42'),(71,10,2,1,'2026-02-11 02:36:42'),(72,11,2,1,'2026-02-11 02:36:42'),(73,12,2,1,'2026-02-11 02:36:42'),(74,13,2,1,'2026-02-11 02:36:42'),(75,14,2,1,'2026-02-11 02:36:42'),(76,15,2,1,'2026-02-11 02:36:42'),(77,16,2,1,'2026-02-11 02:36:42'),(78,17,2,1,'2026-02-11 02:36:42'),(79,18,2,1,'2026-02-11 02:36:42'),(80,19,2,1,'2026-02-11 02:36:42'),(81,20,2,1,'2026-02-11 02:36:42'),(82,21,2,1,'2026-02-11 02:36:42'),(83,22,2,1,'2026-02-11 02:36:42'),(84,23,2,1,'2026-02-11 02:36:42'),(85,24,2,1,'2026-02-11 02:36:42'),(86,25,2,1,'2026-02-11 02:36:42'),(87,26,2,1,'2026-02-11 02:36:42'),(88,27,1,1,'2026-02-11 05:21:40'),(89,27,2,1,'2026-02-11 05:24:24');
/*!40000 ALTER TABLE `user_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `profile_image_url` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `email_verified` tinyint(1) DEFAULT '0',
  `phone_verified` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_login` timestamp NULL DEFAULT NULL,
  `user_type` varchar(255) NOT NULL DEFAULT 'client',
  `reset_password_code` varchar(6) DEFAULT NULL,
  `reset_code_expiration` datetime DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`),
  KEY `idx_phone` (`phone_number`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'jamel@skilllink.com','$2b$11$4BBUX7.QSQbQ6ZQhls7Ty.ph/MpYx6ykH1a/mUMbEOVPZmYwIzn/S','8888-1001','https://res.cloudinary.com/dsr4zuujv/image/upload/v1770779612/skilllink/profiles/tl3rtcsman8c7kd2pmtt.jpg',1,1,1,'2026-02-11 02:36:42','2026-02-11 03:13:33',NULL,'admin',NULL,NULL),(2,'gerald@skilllink.com','$2b$11$4BBUX7.QSQbQ6ZQhls7Ty.ph/MpYx6ykH1a/mUMbEOVPZmYwIzn/S','8888-1002','https://res.cloudinary.com/dsr4zuujv/image/upload/v1770779754/skilllink/profiles/hrdzgtmftommrxaeib77.jpg',1,1,1,'2026-02-11 02:36:42','2026-02-11 03:15:56',NULL,'admin',NULL,NULL),(3,'daisy@skilllink.com','$2b$11$4BBUX7.QSQbQ6ZQhls7Ty.ph/MpYx6ykH1a/mUMbEOVPZmYwIzn/S','8888-1003','https://res.cloudinary.com/dsr4zuujv/image/upload/v1770779647/skilllink/profiles/n8k2sq1ocogtrtjmqg3j.jpg',1,1,1,'2026-02-11 02:36:42','2026-02-11 03:14:08',NULL,'admin',NULL,NULL),(4,'glend@skilllink.com','$2b$11$4BBUX7.QSQbQ6ZQhls7Ty.ph/MpYx6ykH1a/mUMbEOVPZmYwIzn/S','8888-1004','https://res.cloudinary.com/dsr4zuujv/image/upload/v1770779692/skilllink/profiles/itcmy1nkzjbbkv7rmqfi.jpg',1,1,1,'2026-02-11 02:36:42','2026-02-11 03:14:54',NULL,'admin',NULL,NULL),(5,'rachel@skilllink.com','$2b$11$4BBUX7.QSQbQ6ZQhls7Ty.ph/MpYx6ykH1a/mUMbEOVPZmYwIzn/S','8888-1005',NULL,1,1,1,'2026-02-11 02:36:42','2026-02-11 02:36:42',NULL,'admin',NULL,NULL),(6,'admin@skilllink.com','$2b$11$4BBUX7.QSQbQ6ZQhls7Ty.ph/MpYx6ykH1a/mUMbEOVPZmYwIzn/S','8888-1000',NULL,1,1,1,'2026-02-11 02:36:42','2026-02-11 02:36:42',NULL,'admin',NULL,NULL),(7,'carlos.plomeria@skilllink.com','$2b$11$EnZtaCymaqy8nrRmahfEceorAJWzB.PiR.A6I/EILieId.WZGXqdm','8765-4321','https://res.cloudinary.com/dsr4zuujv/image/upload/v1770779929/skilllink/profiles/snbgemoyg0yrx0hahcbx.jpg',1,1,1,'2026-02-11 02:36:42','2026-02-11 03:18:50',NULL,'provider',NULL,NULL),(8,'ana.electricidad@skilllink.com','$2b$11$EnZtaCymaqy8nrRmahfEceorAJWzB.PiR.A6I/EILieId.WZGXqdm','8877-6655','https://res.cloudinary.com/dsr4zuujv/image/upload/v1770780400/skilllink/profiles/kgtvnds5kwrbesl42da3.jpg',1,1,1,'2026-02-11 02:36:42','2026-02-11 03:26:41',NULL,'provider',NULL,NULL),(9,'miguel.barberia@skilllink.com','$2b$11$EnZtaCymaqy8nrRmahfEceorAJWzB.PiR.A6I/EILieId.WZGXqdm','8654-3210','https://res.cloudinary.com/dsr4zuujv/image/upload/v1770783439/skilllink/profiles/dmj8hhrwrex3zmsw18xl.jpg',1,1,1,'2026-02-11 02:36:42','2026-02-11 04:17:20',NULL,'provider',NULL,NULL),(10,'laura.limpieza@skilllink.com','$2b$11$EnZtaCymaqy8nrRmahfEceorAJWzB.PiR.A6I/EILieId.WZGXqdm','8912-3456','https://res.cloudinary.com/dsr4zuujv/image/upload/v1770780844/skilllink/profiles/jopno0it0maudko2qopu.jpg',1,1,1,'2026-02-11 02:36:42','2026-02-11 03:34:05',NULL,'provider',NULL,NULL),(11,'roberto.pintura@skilllink.com','$2b$11$EnZtaCymaqy8nrRmahfEceorAJWzB.PiR.A6I/EILieId.WZGXqdm','8712-3456','https://res.cloudinary.com/dsr4zuujv/image/upload/v1770781481/skilllink/profiles/c2ynodrlsdemccikpe0d.jpg',1,1,1,'2026-02-11 02:36:42','2026-02-11 03:44:42',NULL,'provider',NULL,NULL),(12,'maria.tecnologia@skilllink.com','$2b$11$EnZtaCymaqy8nrRmahfEceorAJWzB.PiR.A6I/EILieId.WZGXqdm','8823-4567','https://res.cloudinary.com/dsr4zuujv/image/upload/v1770784219/skilllink/profiles/xg3r5brabo4jokmcvuhb.jpg',1,1,1,'2026-02-11 02:36:42','2026-02-11 04:30:20',NULL,'provider',NULL,NULL),(13,'jose.construccion@skilllink.com','$2b$11$EnZtaCymaqy8nrRmahfEceorAJWzB.PiR.A6I/EILieId.WZGXqdm','8678-9012','https://res.cloudinary.com/dsr4zuujv/image/upload/v1770782303/skilllink/profiles/q0kuiflaoilj5tqfcn6h.jpg',1,1,1,'2026-02-11 02:36:42','2026-02-11 03:58:24',NULL,'provider',NULL,NULL),(14,'juan.carpinteria@skilllink.com','$2b$11$EnZtaCymaqy8nrRmahfEceorAJWzB.PiR.A6I/EILieId.WZGXqdm','8987-6543','https://res.cloudinary.com/dsr4zuujv/image/upload/v1770782830/skilllink/profiles/wu8rnhhkanzx5tsjufvs.jpg',1,1,1,'2026-02-11 02:36:42','2026-02-11 04:07:11',NULL,'provider',NULL,NULL),(15,'pedro.jardineria@skilllink.com','$2b$11$EnZtaCymaqy8nrRmahfEceorAJWzB.PiR.A6I/EILieId.WZGXqdm','8745-6789','https://res.cloudinary.com/dsr4zuujv/image/upload/v1770781749/skilllink/profiles/jc7tvidoa47bbmc7is2g.jpg',1,1,1,'2026-02-11 02:36:42','2026-02-11 03:49:11',NULL,'provider',NULL,NULL),(16,'mariana.belleza@skilllink.com','$2b$11$EnZtaCymaqy8nrRmahfEceorAJWzB.PiR.A6I/EILieId.WZGXqdm','8623-4567','https://res.cloudinary.com/dsr4zuujv/image/upload/v1770787178/skilllink/profiles/sycyhiqpmcvwiu1xauxj.jpg',1,1,1,'2026-02-11 02:36:42','2026-02-11 05:19:39',NULL,'provider',NULL,NULL),(17,'sofia.spa@skilllink.com','$2b$11$EnZtaCymaqy8nrRmahfEceorAJWzB.PiR.A6I/EILieId.WZGXqdm','8934-5678','https://res.cloudinary.com/dsr4zuujv/image/upload/v1770783997/skilllink/profiles/tswtf53zmpkkhmpbwewj.jpg',1,1,1,'2026-02-11 02:36:42','2026-02-11 04:26:38',NULL,'provider',NULL,NULL),(18,'diana.eventos@skilllink.com','$2b$11$EnZtaCymaqy8nrRmahfEceorAJWzB.PiR.A6I/EILieId.WZGXqdm','8789-0123','https://res.cloudinary.com/dsr4zuujv/image/upload/v1770784484/skilllink/profiles/uk2zdwj483z0nixi5fcy.jpg',1,1,1,'2026-02-11 02:36:42','2026-02-11 04:34:45',NULL,'provider',NULL,NULL),(19,'manuel.catering@skilllink.com','$2b$11$EnZtaCymaqy8nrRmahfEceorAJWzB.PiR.A6I/EILieId.WZGXqdm','8890-1234','https://res.cloudinary.com/dsr4zuujv/image/upload/v1770784845/skilllink/profiles/usoek71js66niaquiruz.jpg',1,1,1,'2026-02-11 02:36:42','2026-02-11 04:40:46',NULL,'provider',NULL,NULL),(20,'ricardo.mudanzas@skilllink.com','$2b$11$EnZtaCymaqy8nrRmahfEceorAJWzB.PiR.A6I/EILieId.WZGXqdm','8656-7890','https://res.cloudinary.com/dsr4zuujv/image/upload/v1770785248/skilllink/profiles/ptteeam0sidqary9jpkh.jpg',1,1,1,'2026-02-11 02:36:42','2026-02-11 04:47:29',NULL,'provider',NULL,NULL),(21,'miguel.mecanica@skilllink.com','$2b$11$EnZtaCymaqy8nrRmahfEceorAJWzB.PiR.A6I/EILieId.WZGXqdm','8923-4567','https://res.cloudinary.com/dsr4zuujv/image/upload/v1770785420/skilllink/profiles/uxsx13konh81og69tnaa.jpg',1,1,1,'2026-02-11 02:36:42','2026-02-11 04:50:21',NULL,'provider',NULL,NULL),(22,'daniel.autos@skilllink.com','$2b$11$EnZtaCymaqy8nrRmahfEceorAJWzB.PiR.A6I/EILieId.WZGXqdm','8767-8901','https://res.cloudinary.com/dsr4zuujv/image/upload/v1770785690/skilllink/profiles/zxjfelwtce91bonicjoy.jpg',1,1,1,'2026-02-11 02:36:42','2026-02-11 04:54:50',NULL,'provider',NULL,NULL),(23,'esteban.fotografia@skilllink.com','$2b$11$EnZtaCymaqy8nrRmahfEceorAJWzB.PiR.A6I/EILieId.WZGXqdm','8878-9012','https://res.cloudinary.com/dsr4zuujv/image/upload/v1770785999/skilllink/profiles/k7koihg0xsjosgyrujgf.jpg',1,1,1,'2026-02-11 02:36:42','2026-02-11 05:00:00',NULL,'provider',NULL,NULL),(24,'gabriela.fotos@skilllink.com','$2b$11$EnZtaCymaqy8nrRmahfEceorAJWzB.PiR.A6I/EILieId.WZGXqdm','8689-0123','https://res.cloudinary.com/dsr4zuujv/image/upload/v1770786263/skilllink/profiles/byhnm6zwuzuwenevw6am.jpg',1,1,1,'2026-02-11 02:36:42','2026-02-11 05:04:24',NULL,'provider',NULL,NULL),(25,'patricia.veterinaria@skilllink.com','$2b$11$EnZtaCymaqy8nrRmahfEceorAJWzB.PiR.A6I/EILieId.WZGXqdm','8945-6789','https://res.cloudinary.com/dsr4zuujv/image/upload/v1770786464/skilllink/profiles/y2u5ftoatsuzljupjlri.jpg',1,1,1,'2026-02-11 02:36:42','2026-02-11 05:07:45',NULL,'provider',NULL,NULL),(26,'fernando.mascotas@skilllink.com','$2b$11$EnZtaCymaqy8nrRmahfEceorAJWzB.PiR.A6I/EILieId.WZGXqdm','8856-7890','https://res.cloudinary.com/dsr4zuujv/image/upload/v1770786860/skilllink/profiles/gkndjscnkubzrwbfxiqs.jpg',1,1,1,'2026-02-11 02:36:42','2026-02-11 05:14:21',NULL,'provider',NULL,NULL),(27,'gerald.calderon.photos@gmail.com','$2a$11$dl8.RB0aVoraHRD.4OC.OexbkjCH3LlQXlefwP4EThx83izJfEPF2','64616422','https://res.cloudinary.com/dsr4zuujv/image/upload/v1770787353/skilllink/profiles/m7gdmifskgqsuzdxxw4l.jpg',1,0,0,'2026-02-11 05:21:36','2026-02-11 05:24:24',NULL,'provider',NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-11  0:06:49
