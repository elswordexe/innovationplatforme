# Innovation Platform Microservices

A multi-module Spring Boot microservices suite for an Innovation Platform. It includes service discovery, an API gateway, and domain services for users, ideas, votes, and workflows.

This README consolidates setup and run instructions for local development, detected stack details, scripts, environment variables, tests, and structure. Module-specific notes may also exist in each service's HELP.md.

## Tech Stack
- Language: Java 17
- Build/Package manager: Maven (with Maven Wrapper `mvnw` / `mvnw.cmd`)
- Frameworks & Libraries:
  - Spring Boot (varies by module; root uses 3.2.0, eureka uses 4.0.0)
  - Spring Cloud (Gateway, Netflix Eureka) – versions vary by module
  - Spring Data JPA, Hibernate
  - MySQL Connector/J
  - Lombok
  - springdoc-openapi (Swagger UI)

Note: The module POMs currently use different Spring Boot/Cloud versions. See TODOs for harmonization.

## Modules and Responsibilities
- eureka: Service discovery (Netflix Eureka server)
- gateway: API Gateway with service discovery–based routing and Swagger aggregation
- userservice: User domain service (MySQL, JPA)
- ideaservice: Idea domain service (MySQL, JPA)
- voteservice: Voting domain service (MySQL, JPA)
- workflowservice: Workflow domain service (MySQL, JPA)

## Default Ports & Service Names
- Eureka Server: http://localhost:8761
- API Gateway: http://localhost:8080
  - Swagger UI (aggregated): http://localhost:8080/swagger-ui.html
  - Routed service API docs:
    - Idea Service: /ideaservice/api-docs
    - User Service: /userservice/api-docs
    - Vote Service: /voteservice/api-docs
- User Service: http://localhost:8081 (spring.application.name=userservice)
- Idea Service: http://localhost:8082 (spring.application.name=ideaservice)
- Vote Service: http://localhost:8083 (spring.application.name=voteservice)
- Workflow Service: http://localhost:8084 (spring.application.name=workflowservice)
- Team Service: http://localhost:8086 (spring.application.name=workflowservice)
## Requirements
- JDK 17+
- MySQL 8.x running locally with a user that can create databases
- Windows (run.bat uses Windows cmd). For other OSes, use per-module `mvnw spring-boot:run` commands.

## Database Configuration (local defaults)
Each service (except Eureka and Gateway) expects a local MySQL database and will create it if it does not exist. Defaults (from application.properties):
- userservice
  - spring.datasource.url=jdbc:mysql://localhost:3306/users_db?createDatabaseIfNotExist=true&allowPublicKeyRetrieval=true&useSSL=false
  - spring.datasource.username=root
  - spring.datasource.password=root
  - spring.jpa.hibernate.ddl-auto=create-drop
- ideaservice
  - spring.datasource.url=jdbc:mysql://localhost:3306/ideas_db?createDatabaseIfNotExist=true&allowPublicKeyRetrieval=true&useSSL=false
  - spring.datasource.username=root
  - spring.datasource.password=root
  - spring.jpa.hibernate.ddl-auto=create-drop
- voteservice
  - spring.datasource.url=jdbc:mysql://localhost:3306/vote_db?createDatabaseIfNotExist=true&allowPublicKeyRetrieval=true&useSSL=false
  - spring.datasource.username=root
  - spring.datasource.password=root
  - spring.jpa.hibernate.ddl-auto=create-drop
- workflowservice
  - spring.datasource.url=jdbc:mysql://localhost:3306/workflow_db?createDatabaseIfNotExist=true&allowPublicKeyRetrieval=true&useSSL=false
  - spring.datasource.username=root
  - spring.datasource.password=root
  - spring.jpa.hibernate.ddl-auto=create-drop

You can override these via environment variables at runtime, for example:
- SPRING_DATASOURCE_URL
- SPRING_DATASOURCE_USERNAME
- SPRING_DATASOURCE_PASSWORD
- SPRING_JPA_HIBERNATE_DDL_AUTO

Or per-service namespaced variables, e.g., IDEASERVICE_SPRING_DATASOURCE_URL, depending on your Spring Boot version and configuration style.

All services are configured to register with Eureka at http://localhost:8761/eureka/.

## Build
You can build the full multi-module project from the repository root:
- On Windows: `mvnw.cmd -q clean package`
- On Unix-like systems: `./mvnw -q clean package`

You can also build individual modules by running the same command inside each module directory.

## Running the Suite
There are two main ways to run services locally:

1) Using the provided script (Windows only)
- Double-click or run `run.bat` from the repository root. It opens separate cmd windows and runs each service with `mvnw spring-boot:run`.
- Services start in this order: Eureka, API Gateway, User, Idea, Vote, Workflow.

2) Run services individually (any OS)
From separate terminals, run:
- Eureka: `cd eureka && mvnw spring-boot:run`
- Gateway: `cd gateway && mvnw spring-boot:run`
- User Service: `cd userservice && mvnw spring-boot:run`
- Idea Service: `cd ideaservice && mvnw spring-boot:run`
- Vote Service: `cd voteservice && mvnw spring-boot:run`
- Workflow Service: `cd workflowservice && mvnw spring-boot:run`

Ensure MySQL is running and credentials are valid before starting the domain services.

## API Gateway Routes
Configured in `gateway/src/main/resources/application.properties`:
- /userservice/** → lb://userservice (rewrite to /)
- /ideaservice/** → lb://ideaservice (rewrite to /)
- /voteservice/** → lb://voteservice (rewrite to /)

Swagger UI is exposed at `/swagger-ui.html` on the gateway and aggregates service API docs configured under `springdoc.swagger-ui.urls[*]`.

## Entry Points (Main Classes)
- Eureka: `com.example.eureka.EurekaApplication`
- Gateway: `com.example.gateway.GatewayApplication`
- User Service: `com.example.userservice.UserserviceApplication`
- Idea Service: `com.example.ideaservice.IdeaserviceApplication`
- Vote Service: `com.example.voteservice.VoteserviceApplication`
- Workflow Service: `com.example.workflow.WorkflowApplication`

## Environment Variables and Profiles
- Common:
  - EUREKA_CLIENT_SERVICE_URL_DEFAULTZONE (override Eureka URL)
  - SERVER_PORT (override service port)
  - LOGGING_LEVEL_ROOT (log level)
- Database (per service):
  - SPRING_DATASOURCE_URL
  - SPRING_DATASOURCE_USERNAME
  - SPRING_DATASOURCE_PASSWORD

Spring profiles are not explicitly defined in the repo; default profile is used. You may set `SPRING_PROFILES_ACTIVE=dev` (or similar) if you add profiles.

## Tests
Basic Spring Boot test skeletons exist per module. To run tests:
- From the root for all modules: `mvnw test`
- Per module: `cd <module> && mvnw test`

## Project Structure
- pom.xml (root, packaging=pom; declares modules)
- run.bat (Windows helper to run all services)
- eureka/
  - src/main/java/com/example/eureka/EurekaApplication.java
  - src/main/resources/application.properties
  - pom.xml
  - HELP.md
- gateway/
  - src/main/java/com/example/gateway/GatewayApplication.java
  - src/main/resources/application.properties
  - pom.xml
  - HELP.md
- userservice/
  - src/main/java/com/example/userservice/UserserviceApplication.java
  - src/main/resources/application.properties
  - pom.xml
  - HELP.md
- ideaservice/
  - src/main/java/com/example/ideaservice/IdeaserviceApplication.java
  - src/main/resources/application.properties
  - pom.xml
  - HELP.md
- voteservice/
  - src/main/java/com/example/voteservice/VoteserviceApplication.java
  - src/main/resources/application.properties
  - pom.xml
  - HELP.md
- workflowservice/
  - src/main/java/com/example/workflow/WorkflowApplication.java
  - src/main/resources/application.properties
  - pom.xml
  - HELP.md

## Known Issues / TODOs
- Version alignment: Modules currently declare different Spring Boot and Spring Cloud versions (e.g., root 3.2.0 vs eureka 4.0.0 with Spring Cloud 2025.1.0-RC1). Align versions across modules to avoid classpath conflicts.
- Database credentials: Hard-coded defaults (root/root). Externalize via env vars or config server for security.
- Docker/Containers: No Dockerfiles or compose present. TODO: Add containerization for local/dev deployments.
- CI/CD: No pipeline configuration found. TODO: Add GitHub Actions or similar.
- Security/Auth: Not configured. TODO: Add authentication/authorization if required.
- Migrations: Using `ddl-auto=create-drop` for all services. TODO: Add Flyway/Liquibase with proper schema migrations.

## License
No license file was found in the repository. TODO: Choose and add a LICENSE file (e.g., MIT, Apache-2.0) and update this section.

---
For module-specific details, check each service's HELP.md and source code. If something in this README appears outdated, please open an issue or submit a PR with corrections.
