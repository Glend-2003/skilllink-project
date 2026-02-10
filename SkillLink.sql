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

--
-- Table structure for table `__EFMigrationsHistory`
--

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
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conversations`
--

LOCK TABLES `conversations` WRITE;
/*!40000 ALTER TABLE `conversations` DISABLE KEYS */;
INSERT INTO `conversations` VALUES (1,NULL,9,10,'2026-01-14 19:47:11',1,'2026-01-14 18:52:40'),(2,NULL,9,11,'2026-01-14 18:53:18',1,'2026-01-14 18:52:40'),(4,NULL,9,10,'2026-01-14 05:04:22',1,'2026-01-14 04:56:04'),(5,NULL,24,10,NULL,1,'2026-01-20 17:31:24'),(6,NULL,24,11,NULL,1,'2026-01-20 17:31:24'),(7,NULL,24,25,'2026-01-20 18:52:24',1,'2026-01-20 17:54:40'),(8,NULL,24,26,'2026-01-20 18:39:06',1,'2026-01-20 17:55:38'),(10,NULL,24,27,'2026-01-20 18:39:15',1,'2026-01-20 18:34:49'),(11,NULL,24,28,'2026-01-20 18:52:40',1,'2026-01-20 18:40:26'),(14,NULL,19,19,NULL,1,'2026-01-28 03:28:47'),(15,NULL,20,19,'2026-01-28 19:24:53',1,'2026-01-28 03:29:39'),(18,NULL,33,41,'2026-01-28 22:28:17',1,'2026-01-28 22:28:06');
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
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
INSERT INTO `messages` VALUES (1,4,9,'Mensaje de prueba manual',0,NULL,'2026-01-14 05:04:22'),(2,1,9,'Hola\n\n',0,NULL,'2026-01-14 18:53:11'),(3,2,9,'Hey Ana \n',0,NULL,'2026-01-14 18:53:18'),(4,1,9,'Guapo\n',0,NULL,'2026-01-14 18:53:29'),(5,1,9,'Usted quién es \n',0,NULL,'2026-01-14 18:54:16'),(6,1,9,'Hi\n',0,NULL,'2026-01-14 18:54:45'),(7,1,9,'Holaaaaa\n',0,NULL,'2026-01-14 19:21:05'),(8,1,9,'Hola cómo vas \n',0,NULL,'2026-01-14 19:36:32'),(9,1,9,'Hola',0,NULL,'2026-01-14 19:45:58'),(10,1,9,'Hola\n',0,NULL,'2026-01-14 19:47:11'),(11,7,24,'Hola Carlitos \n',0,NULL,'2026-01-20 18:05:20'),(14,10,24,'Hey Miguelito \n',0,NULL,'2026-01-20 18:34:55'),(15,8,24,'Vea la cosa está así \n',0,NULL,'2026-01-20 18:39:06'),(16,10,24,'Volví ',0,NULL,'2026-01-20 18:39:15'),(17,7,24,'Hola\n',0,NULL,'2026-01-20 18:39:39'),(18,7,24,'Bombo\n',0,NULL,'2026-01-20 18:39:57'),(19,11,24,'Lau es cierto \n?\n',0,NULL,'2026-01-20 18:40:33'),(20,11,24,'Volví ',0,NULL,'2026-01-20 18:47:08'),(21,7,24,'Mijita ',0,NULL,'2026-01-20 18:47:25'),(22,7,24,'Holaaaaa aaaa ternura ',0,NULL,'2026-01-20 18:52:24'),(23,11,24,'Laura Fernanda jura\n',0,NULL,'2026-01-20 18:52:40'),(26,15,20,'Hola, me gustaría que me arreglaran unas platinas',0,NULL,'2026-01-28 03:29:54'),(27,15,19,'Claro que si, que sería lo que tiene',0,NULL,'2026-01-28 03:35:44'),(29,15,20,'Hola, estoy haciendo una prueba de mensaje',0,NULL,'2026-01-28 19:24:53'),(30,18,33,'Hola que tal?',0,NULL,'2026-01-28 22:28:17');
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `provider_profiles`
--

LOCK TABLES `provider_profiles` WRITE;
/*!40000 ALTER TABLE `provider_profiles` DISABLE KEYS */;
INSERT INTO `provider_profiles` VALUES (1,25,'Plomería Carlos','Especialista en reparaciones de plomería residencial y comercial. 10 años de experiencia.',NULL,NULL,10,15,1,NULL,1,1,'2026-01-20 17:35:15','2026-01-20 17:35:15'),(2,26,'Electricista Ana','Instalación y reparación de sistemas eléctricos. Todos los trabajos garantizados.',NULL,NULL,8,20,1,NULL,1,1,'2026-01-20 17:35:15','2026-01-20 17:35:15'),(3,27,'Barbería Miguel','Cortes profesionales y diseño de barba. Atendemos todo tipo de cabello.',NULL,NULL,5,10,1,NULL,0,1,'2026-01-20 17:35:15','2026-01-20 17:35:15'),(4,28,'Limpieza Laura','Servicio de limpieza integral para hogares y negocios. Rápido y confiable.',NULL,NULL,6,25,1,NULL,1,1,'2026-01-20 17:35:15','2026-01-20 17:35:15'),(5,33,'Admin Services','Servicios administrativos y gestión',NULL,NULL,NULL,NULL,0,NULL,0,1,'2026-01-28 02:52:11','2026-01-28 02:52:11'),(6,19,'Green House ','Reparamos plantas',10.32197400,-83.90382700,6,20,0,NULL,0,1,'2026-01-28 09:02:51','2026-01-29 01:26:12'),(7,38,'Kos','Animador de fiesta ',10.32020980,-83.91485970,5,50,0,NULL,0,1,'2026-01-28 10:39:14','2026-01-28 10:39:14'),(8,41,'Plomería HALOB','Nos encargamos de hacer lo mejor de lo mejor ',40.73110400,-73.99338700,2,1500,0,NULL,0,1,'2026-01-29 04:25:39','2026-01-29 04:25:39');
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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `provider_requests`
--

LOCK TABLES `provider_requests` WRITE;
/*!40000 ALTER TABLE `provider_requests` DISABLE KEYS */;
INSERT INTO `provider_requests` VALUES (1,19,'Vivero Green House ','Nos encargamos de vender plantas a domicilio ','Restauramos y recuperamos plantas ','10','Sarapiquí de Heredia ',5.00,'Facebook ','Ninguna','approved','2026-01-28 02:22:18','2026-01-28 02:26:26',33,'Solicitud aprobada. ¡Bienvenido como proveedor!'),(2,36,'Fotógrafo ','Hago fotos ','Hago fotos ',NULL,'Sarapiquí de Heredia, costa rica ',NULL,NULL,NULL,'approved','2026-01-28 04:16:55','2026-01-28 04:17:43',33,'Solicitud aprobada. ¡Bienvenido como proveedor!'),(3,38,'Kos','Canto a domicilio ','Canto a domicilio ',NULL,'México ',NULL,NULL,NULL,'approved','2026-01-28 04:31:53','2026-01-28 04:37:34',33,'Solicitud aprobada. ¡Bienvenido como proveedor!'),(4,39,'Pollos asados ','Vendemos pollos asados','Vendemos pollos asados',NULL,'Sarapiquí de Heredia ',NULL,NULL,NULL,'rejected','2026-01-28 04:36:47','2026-01-28 04:37:42',33,'Solicitud rechazada. Por favor revisa los requisitos.'),(5,40,'Flores mary','Arreglos de flores y más ','Arreglos de flores y más ',NULL,'Heredia, Sarapiquí, Horquetas ',NULL,NULL,NULL,'approved','2026-01-28 19:30:57','2026-01-28 19:31:52',33,'Solicitud aprobada. ¡Bienvenido como proveedor!'),(6,41,'HALOB','Nos encargamos en plomería al máximo nivel ','Nos encargamos en plomería al máximo nivel ',NULL,'Sarapiqui',NULL,NULL,NULL,'approved','2026-01-28 22:20:44','2026-01-28 22:22:00',33,'Solicitud aprobada. ¡Bienvenido como proveedor!'),(7,20,'Jefrry','Hago plomería \n','Hago plomería \n',NULL,'La victoria ',NULL,NULL,NULL,'pending','2026-02-04 19:46:50',NULL,NULL,NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES (1,1,20,19,5,'Bueno','Súper bueno',0,1,0,'2026-02-06 06:00:29','2026-02-06 06:00:29');
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
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_categories`
--

LOCK TABLES `service_categories` WRITE;
/*!40000 ALTER TABLE `service_categories` DISABLE KEYS */;
INSERT INTO `service_categories` VALUES (1,NULL,'Plomería','Servicios de plomería y tuberías',NULL,1,0,'2026-01-20 17:46:22'),(2,NULL,'Electricidad','Servicios eléctricos y de iluminación',NULL,1,0,'2026-01-20 17:46:22'),(3,NULL,'Barbería','Servicios de corte y cuidado personal',NULL,1,0,'2026-01-20 17:46:22'),(4,NULL,'Limpieza','Servicios de limpieza y mantenimiento',NULL,1,0,'2026-01-20 17:46:22'),(7,NULL,'Carpintería','Fabricación y reparación de muebles, puertas y estructuras de madera',NULL,1,3,'2026-01-28 04:55:36'),(9,NULL,'Jardinería','Mantenimiento de jardines, poda y diseño paisajístico',NULL,1,5,'2026-01-28 04:55:36');
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_gallery`
--

LOCK TABLES `service_gallery` WRITE;
/*!40000 ALTER TABLE `service_gallery` DISABLE KEYS */;
INSERT INTO `service_gallery` VALUES (2,18,6,'https://res.cloudinary.com/dsr4zuujv/image/upload/v1769647539/skilllink/services/dbcvscdzqe4zvkt6i5k1.jpg','aca8f334-e7d7-43d3-831d-2bdad8679beb.jpeg',NULL,1,1,'2026-01-29 00:45:39',NULL),(3,18,6,'https://res.cloudinary.com/dsr4zuujv/image/upload/v1769647540/skilllink/services/txkfjtgiwpe0k1zdyxyz.jpg','7648cdfd-f3b1-451f-8932-f4b4660a50d5.jpeg',NULL,2,1,'2026-01-29 00:45:41',NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_requests`
--

LOCK TABLES `service_requests` WRITE;
/*!40000 ALTER TABLE `service_requests` DISABLE KEYS */;
INSERT INTO `service_requests` VALUES (1,20,'6464',6,18,'Jsjs','Hshsh',', La Victoria, Heredia','Jahsj',10.32027280,-83.91486690,NULL,'2026-02-06','23:12:00','completed',5.00,1500.00,'2026-02-06 05:13:52','2026-02-06 05:57:48','2026-02-06 05:57:49');
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
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `services`
--

LOCK TABLES `services` WRITE;
/*!40000 ALTER TABLE `services` DISABLE KEYS */;
INSERT INTO `services` VALUES (5,1,1,'Reparación de tuberías','Reparación de tuberías dañadas',75.00,'fixed',60,1,'approved','2026-01-20 17:46:37','2026-01-28 09:27:57',1,'2026-01-28 09:27:57'),(6,1,1,'Instalación de sanitarios','Instalación profesional',150.00,'fixed',120,1,'approved','2026-01-20 17:46:37','2026-01-28 09:27:55',1,'2026-01-28 09:27:55'),(7,1,1,'Destapar desagüe','Destapado rápido',50.00,'fixed',30,1,'approved','2026-01-20 17:46:37','2026-01-28 09:27:53',1,'2026-01-28 09:27:53'),(8,1,1,'Inspección de fugas','Inspección completa',80.00,'fixed',45,1,'approved','2026-01-20 17:46:37','2026-01-28 09:27:51',1,'2026-01-28 09:27:51'),(9,2,2,'Instalación de circuitos','Instalación segura de circuitos',200.00,'fixed',180,1,'approved','2026-01-20 17:46:45','2026-01-28 09:28:18',1,'2026-01-28 09:28:18'),(10,2,2,'Cambio de interruptores','Cambio de interruptores y tomas',40.00,'fixed',30,1,'approved','2026-01-20 17:46:45','2026-01-28 09:28:07',1,'2026-01-28 09:28:07'),(11,2,2,'Reparación de luminarias','Reparación de lámparas',60.00,'fixed',45,1,'rejected','2026-01-20 17:46:45','2026-01-28 09:28:13',0,NULL),(12,3,3,'Corte clásico','Corte tradicional',25.00,'fixed',30,1,'approved','2026-01-20 17:46:45','2026-01-28 09:28:04',1,'2026-01-28 09:28:04'),(13,3,3,'Diseño de barba','Diseño y perfilado',30.00,'fixed',20,1,'approved','2026-01-20 17:46:45','2026-01-28 09:28:03',1,'2026-01-28 09:28:03'),(14,4,4,'Limpieza general','Limpieza completa del hogar',120.00,'hourly',240,1,'approved','2026-01-20 17:46:45','2026-01-28 09:28:00',1,'2026-01-28 09:28:00'),(15,4,4,'Limpieza de oficina','Limpieza profesional',150.00,'hourly',120,1,'approved','2026-01-20 17:46:45','2026-01-28 09:27:59',1,'2026-01-28 09:27:59'),(16,6,9,'Reparamos plantas ','Plantas ',15.00,'negotiable',30,1,'approved','2026-01-28 09:04:27','2026-01-28 11:37:57',1,'2026-01-28 11:37:57'),(17,7,2,'Animador de fiestas ','Hacemos fiestas a lo loco ',1000.00,'hourly',120,1,'approved','2026-01-28 10:40:27','2026-01-28 10:41:51',1,'2026-01-28 10:41:51'),(18,6,9,'Limpieza de planta ','Limpieza de planta ',5.00,'hourly',60,1,'approved','2026-01-29 01:27:04','2026-01-29 06:54:58',1,'2026-01-29 06:54:58'),(19,8,1,'Reparacion de tuberías ','Reparamos tuberías a domicilio \n',25.00,'hourly',120,1,'approved','2026-01-29 04:26:53','2026-01-29 04:27:33',1,'2026-01-29 04:27:33');
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
  `transaction_id` int NOT NULL AUTO_INCREMENT,
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
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_profiles`
--

LOCK TABLES `user_profiles` WRITE;
/*!40000 ALTER TABLE `user_profiles` DISABLE KEYS */;
INSERT INTO `user_profiles` VALUES (6,7,'Glend','Rojas','2003-11-20','Arquitecto de Software en SkillLink','San Luis',NULL,'Guapiles','Limon','70201','Costa Rica','Masculino','9.3281','-84.0307'),(7,8,'Keyla','Alvarado','1971-03-07','Ama de casa','San Luis',NULL,'Guapiles','Limon','70201','Costa Rica','Femenino','9.3281','-84.0307'),(8,9,'','',NULL,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(9,10,'','',NULL,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(10,25,'','',NULL,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(11,26,'','',NULL,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(12,27,'','',NULL,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(13,28,'','',NULL,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(14,37,'','',NULL,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(15,24,'','',NULL,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(16,40,'','',NULL,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(17,11,'','',NULL,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(18,12,'','',NULL,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(19,38,'','',NULL,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(20,15,'','',NULL,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(21,16,'','',NULL,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(22,22,'','',NULL,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(23,23,'','',NULL,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(24,20,'Gerald','Calderon','2004-01-10','Soy gera','La victoria ',NULL,'Río frío ','Heredia ',NULL,'Costa rica','Masculino','10.3202917','-83.9147997'),(25,33,'','',NULL,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(26,17,'','',NULL,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(27,18,'','',NULL,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(28,39,'','',NULL,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(29,13,'','',NULL,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(30,21,'','',NULL,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(31,36,'','',NULL,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(32,14,'','',NULL,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(33,19,'','',NULL,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(34,41,'','',NULL,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_roles`
--

LOCK TABLES `user_roles` WRITE;
/*!40000 ALTER TABLE `user_roles` DISABLE KEYS */;
INSERT INTO `user_roles` VALUES (1,33,3,1,'2026-01-28 02:16:29'),(3,19,2,1,'2026-01-28 02:26:25'),(4,33,2,1,'2026-01-28 02:51:48'),(5,36,1,1,'2026-01-28 04:15:12'),(6,36,2,1,'2026-01-28 04:17:43'),(7,37,1,1,'2026-01-28 04:26:36'),(8,38,1,1,'2026-01-28 04:31:52'),(9,39,1,1,'2026-01-28 04:36:47'),(10,38,2,1,'2026-01-28 04:37:33'),(11,40,1,1,'2026-01-28 19:30:56'),(12,40,2,1,'2026-01-28 19:31:52'),(13,41,1,1,'2026-01-28 22:16:39'),(14,41,2,1,'2026-01-28 22:22:00');
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
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`),
  KEY `idx_phone` (`phone_number`)
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (7,'glendrojas1040@gmail.com','$2a$11$r9Q8tpwVXf3Afrb.FWibVOAsWfnfpssm0hYcGqJLq6SvXLp8eWTA2','86237034',NULL,1,0,0,'2025-12-29 03:39:37','2025-12-29 03:39:37',NULL,'client'),(8,'kalvaradog1971@gmail.com','$2a$11$OgTrZaQIz1VSn6BL8I/dUu7Jh1LyLcfa8.TkclPRgNhF5xNdFlpSW','86403484',NULL,1,0,0,'2026-01-13 17:33:04','2026-01-13 17:33:04',NULL,'client'),(9,'user1@example.com','hash1',NULL,NULL,1,0,0,'2026-01-14 04:55:58','2026-01-14 04:55:58',NULL,'client'),(10,'user2@example.com','hash2',NULL,NULL,1,0,0,'2026-01-14 04:55:58','2026-01-14 04:55:58',NULL,'client'),(11,'test@example.com','$2a$11$vxbHpRi.TRLdmadXePN94ebJANC65vPzDnUBbWqma8EPH1.6RkZo6','123456789',NULL,1,0,0,'2026-01-14 16:41:57','2026-01-14 16:41:56',NULL,'client'),(12,'test3@example.com','$2a$11$HPzfTRwQqmrqEnuqA5zz/eWO56WQVxAqh2eNxQTTGRVG43unfA.b.','123456789',NULL,1,0,0,'2026-01-14 16:42:57','2026-01-14 16:42:56',NULL,'client'),(13,'calderoncastillo416@gmail.com','$2a$11$YkUursxQzTReFjYdDy18iOzqFb1vdUsjGQ0xBxFS2AfubuVipfrqu','64616422',NULL,1,0,0,'2026-01-14 16:46:00','2026-01-14 16:46:00',NULL,'client'),(14,'fromnowhereanyone@gmail.com','$2a$11$0fxmKePyqopmh/PMA9zv1ePOuuAlQN1NokOKppJFyNgUwUfaR5aiK','646222238',NULL,1,0,0,'2026-01-14 17:05:30','2026-01-14 17:05:30',NULL,'client'),(15,'test2@example.com','$2a$11$gnFAqEgJsA9g8mALxQ2ruOvCWFV8J9UIc4G08bFTrPMvV76aJ.YiO','1234567890',NULL,1,0,0,'2026-01-14 17:43:24','2026-01-14 17:43:24',NULL,'client'),(16,'provider@example.com','$2a$11$txLuTFrRlft5F4LhTB0fEODjDU/N/GFjzLhl3xHl8qmN2xYFlCeBq','1234567890',NULL,1,0,0,'2026-01-14 17:43:29','2026-01-14 17:43:28',NULL,'provider'),(17,'waltercalderonalpizar@gmail.com','$2a$11$J0taHZyTBOEO09WUfWuAdeSVRycNJTzcLbU.5wHZU/8xzub/ZT0e2','645231569',NULL,1,0,0,'2026-01-14 17:43:50','2026-01-14 17:43:50',NULL,'client'),(18,'walzar@gmail.com','$2a$11$xZg3rC90b52frvzWHrK5deKCowtJ6VuFPuqMfZ8g3s7/GVPkmwYsi','645231569',NULL,1,0,0,'2026-01-14 17:44:02','2026-01-14 17:44:01',NULL,'client'),(19,'greenhousesarapiqui@gmail.com','$2a$11$BsWbI0bvi9J0bkc92QFzDOmjyCJnJso4bkexKpmN0M8HgBqoLJXKG','64646464','https://res.cloudinary.com/dsr4zuujv/image/upload/v1769730816/skilllink/profiles/sc1iyrrawnqcqmxyuw1d.jpg',1,0,0,'2026-01-14 17:45:38','2026-01-29 23:53:38',NULL,'provider'),(20,'geraldcalderoncastillo@gmail.com','$2a$11$3stCDA1ErmPhf85OkZmBlux2GQFpkdQTa6kRFldgoTNPEcRjRhcPm','64616422',NULL,1,0,0,'2026-01-14 18:49:05','2026-02-06 07:28:31',NULL,'client'),(21,'gerald.calderon.castillo@est.una.ac.cr','$2a$11$1jUa61oZ7QqjnxQc4RwIZON7WPWvJHKmo9mZ2oyItFbiEjWLD6t8m','64616422',NULL,1,0,0,'2026-01-14 20:09:02','2026-01-14 20:09:01',NULL,'client'),(22,'testuser@test.com','$2a$11$9NSghlIdPzA6jByS2cJA6.Jsu.njx4Z4LBcFudL3GqtOxu9utJPqS','1234567890',NULL,1,0,0,'2026-01-20 17:14:27','2026-01-20 17:14:27',NULL,'client'),(23,'mobileuser@test.com','$2a$11$ElvRhIIY6lZFe6SlMW1eDOTy89wHAtINWclIxpP4ykm9lzmrFUe/m','1234567890',NULL,1,0,0,'2026-01-20 17:20:16','2026-01-20 17:20:16',NULL,'client'),(24,'p@gmail.com','$2a$11$sQUi4MCXBrzd1xqbeCUP/OZJ7hjLKByWMsxiQTMV9YrqyeTmhnnKq','12345678',NULL,1,0,0,'2026-01-20 17:29:06','2026-01-20 17:29:05',NULL,'client'),(25,'carlos.plomeria@test.com','$2a$11$xyz123...',NULL,NULL,1,0,0,'2026-01-20 17:34:40','2026-01-20 17:34:40',NULL,'provider'),(26,'ana.electricista@test.com','$2a$11$xyz124...',NULL,NULL,1,0,0,'2026-01-20 17:34:40','2026-01-20 17:34:40',NULL,'provider'),(27,'miguel.barberia@test.com','$2a$11$xyz125...',NULL,NULL,1,0,0,'2026-01-20 17:34:40','2026-01-20 17:34:40',NULL,'provider'),(28,'laura.limpieza@test.com','$2a$11$xyz126...',NULL,NULL,1,0,0,'2026-01-20 17:34:40','2026-01-20 17:34:40',NULL,'provider'),(33,'admin@skilllink.com','$2a$11$ScSgDP8KJsg/l1ECzI1LtuFhw1suzGp5ztfwiikoJrV7UsV6njjiy','5551234567',NULL,1,0,0,'2026-01-28 02:16:04','2026-01-28 02:25:24',NULL,'admin'),(36,'gerandrec@gmail.com','$2a$11$j1Mq.8ie1BhJOujht/Fy8OXUy1/uvutAObRre/b7YBzythhx.v1fO','64616422',NULL,1,0,0,'2026-01-28 10:15:12','2026-01-28 04:17:09',NULL,''),(37,'geraldphotos@gmail.com','$2a$11$oJ96P9ZvE76UDu778QvLR.KnmVvoOu3lWvXg3nt5JtLpT/a7zrqdy',NULL,NULL,1,0,0,'2026-01-28 10:26:37','2026-01-28 04:26:36',NULL,''),(38,'kenia@gmail.com','$2a$11$x8CBOTOUA4H62XwVIPifdOK1cZt/dtz1/bwd84YdmXEcdBgWkpJo.','123456789',NULL,1,0,0,'2026-01-28 10:31:52','2026-01-28 04:39:26',NULL,''),(39,'pollos@gmail.com','$2a$11$6WO9eGY9YVJW66hjyI.mpeP0.Iw.x6PGD2Ob5npo4atnE7MVgW7qm','64612233',NULL,1,0,0,'2026-01-28 10:36:47','2026-01-28 04:36:47',NULL,''),(40,'dey@gmail.com','$2a$11$fZfny0HQ4YCSM6ms2/F3kOMUTjVGKS5RY3ceH5ECdP605u9jE9pZq','12345678',NULL,1,0,0,'2026-01-29 01:30:57','2026-01-28 19:30:56',NULL,''),(41,'jsamdi12199@gmail.com','$2a$11$so/fWi8a4ejgMUecP2mrfezpUtq0xdbOTDLjjyR5Mv7o6RJ2oJS/G','88955772',NULL,1,0,0,'2026-01-29 04:16:39','2026-01-28 22:16:39',NULL,'');
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

-- Dump completed on 2026-02-06 21:46:10
