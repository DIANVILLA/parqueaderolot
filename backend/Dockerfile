# Etapa 1: compilar el proyecto con Maven (JDK completo, mas pesado, no llega a la imagen final)
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

# Copiar primero solo lo necesario para resolver dependencias — Docker cachea esta capa
# y no la vuelve a bajar mientras pom.xml no cambie, aunque el codigo fuente sí cambie despues.
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw -q dependency:go-offline

COPY src ./src
RUN ./mvnw -q clean package -DskipTests

# Etapa 2: imagen final, solo JRE (sin Maven ni codigo fuente) + el jar ya compilado
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/parqueadero-lot-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8090
ENTRYPOINT ["java", "-jar", "app.jar"]
