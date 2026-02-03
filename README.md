# Plateforme d’Innovation – Guide complet d’installation

## 🎯 Présentation du projet

**Innovation Platform** est un système collaboratif de gestion d’idées basé sur une architecture microservices. Il permet aux employés de proposer, évaluer et collaborer autour d’idées innovantes au sein de leur organisation.

### Architecture

* **Frontend** : Angular 17+ (TypeScript)
* **Backend** : Microservices Spring Boot (Java 17+)
* **Base de données** : MySQL 8.0+
* **Message Queue** : Apache Kafka
* **Découverte de services** : Eureka Server
* **API Gateway** : Spring Cloud Gateway

---

## 📋 Prérequis

### Logiciels requis

```bash
# Java Development Kit
Java 17+ (OpenJDK recommandé)

# Node.js & npm
Node.js 18+
npm 9+

# Base de données
MySQL 8.0+

# Message Queue
Apache Kafka 3.5+

# Outils de build
Apache Maven 3.8+
Git

# IDE (recommandés)
IntelliJ IDEA Ultimate / VS Code
```

### Configuration système

* **RAM** : minimum 8 Go (16 Go recommandé)
* **Stockage** : 10 Go d’espace libre
* **OS** : Windows 10+, macOS 10.15+, Ubuntu 20.04+

---

## 🗄️ Configuration de la base de données (MySQL)

changement de Url de My sql dans les microservice dans Applications Proprieties


## 📨 Configuration de Kafka (Apache Kafka)

### 1. Installation de Kafka

```bash
wget https://downloads.apache.org/kafka/3.5.0/kafka_2.13-3.5.0.tgz

tar -xzf kafka_2.13-3.5.0.tgz
cd kafka_2.13-3.5.0

# macOS
brew install kafka

# Ubuntu
sudo apt install kafka
```

### 2. Démarrage des services Kafka

```bash
# Zookeeper
bin/zookeeper-server-start.sh config/zookeeper.properties

# Kafka Broker (nouveau terminal)
bin/kafka-server-start.sh config/server.properties

# Création des topics
bin/kafka-topics.sh --create --topic user-events --bootstrap-server localhost:9092
bin/kafka-topics.sh --create --topic idea-events --bootstrap-server localhost:9092
bin/kafka-topics.sh --create --topic notification-events --bootstrap-server localhost:9092
```

### 3. Vérification

```bash
bin/kafka-topics.sh --list --bootstrap-server localhost:9092
```

---

## 🏗️ Configuration des microservices

### 1. Eureka Server (Service Discovery)

```bash
cd microservices/eureka
mvn clean install
mvn spring-boot:run
```

Accès : [http://localhost:8761](http://localhost:8761)

### 2. Gateway Service

```bash
cd microservices/gateway
mvn clean install
mvn spring-boot:run
```

Port : 8080
### 2. User Service

```bash
cd microservices/userservice
mvn clean install
mvn spring-boot:run
```

Port : 8081

### 3. Team Service

```bash
cd microservices/TeamService
mvn clean install
mvn spring-boot:run
```

Port : 8086

### 4. Bookmark Service

```bash
cd microservices/bookmarkservice
mvn clean install
mvn spring-boot:run
```

Port : 8090

### 5. Idea Service

```bash
cd microservices/ideaservice
mvn clean install
mvn spring-boot:run
```

Port : 8082
### 6. workflow Service

```bash
cd microservices/workflowservice
mvn clean install
mvn spring-boot:run
```

Port : 8084
### 7. notification Service

```bash
cd microservices/notificationservice
mvn clean install
mvn spring-boot:run
```

Port : 8095
### 7. Vote Service

```bash
cd microservices/voteservice
mvn clean install
mvn spring-boot:run
```

Port : 8083
## 🌐 Configuration du Frontend (Angular)

### 1. Installation

```bash
cd angular
npm install -g @angular/cli@17
npm install
```

### 2. Configuration des endpoints

```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080'
};
```

### 3. Lancement

```bash
ng serve
```

Accès : [http://localhost:4200](http://localhost:4200)

---

## 🚀 Ordre de lancement recommandé

1. MySQL
2. Kafka (Zookeeper puis Broker)
3. Eureka Server
4. Microservices
5. Frontend Angular

---

## 🐛 Dépannage (Troubleshooting)

### Problèmes courants

* **Kafka non accessible** : vérifier le port 9092
* **Connexion MySQL refusée** : vérifier le service et les identifiants
* **Service non enregistré dans Eureka** : vérifier `application.properties`
* **Erreur CORS Frontend** : vérifier la configuration de sécurité Spring

---

## 🎓 Contexte académique

### Objectifs pédagogiques

* Architecture microservices
* Communication événementielle avec Kafka
* Développement full-stack Angular / Spring Boot
* Conception de base de données relationnelle
* Bonnes pratiques DevOps

---

## 📁 Structure du projet

<img width="342" height="429" alt="image" src="https://github.com/user-attachments/assets/c04ed402-b8da-435a-8056-8a91b60040bb" />

