# Usa uma imagem do JDK 17
FROM eclipse-temurin:17-jdk-alpine

# Define o diretório de trabalho
WORKDIR /app

# Copia o JAR que você gerou com o mvnw
COPY target/livrolivre-0.0.1-SNAPSHOT.jar app.jar

# Expõe a porta que a sua aplicação usa
EXPOSE 8080

# Comando para rodar a aplicação
ENTRYPOINT ["java", "-jar", "app.jar"]