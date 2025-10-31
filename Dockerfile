#
# Stage 1: Build the application
#
# Use an official Maven image that includes Java 17 (as specified in your pom.xml)
FROM maven:3.9.6-eclipse-temurin-17 AS build

# Set the working directory inside the container
WORKDIR /app

# Copy the Maven project file first. This optimizes Docker's cache.
COPY pom.xml .

# Download all the dependencies
RUN mvn dependency:go-offline

# Copy the rest of your source code
COPY src ./src

# Build the application and create the executable .jar file
# We skip tests to make the build faster on the free server
RUN mvn clean package -DskipTests

#
# Stage 2: Create the final, lightweight image
#
# Use a minimal Java runtime image
FROM eclipse-temurin:17-jre-focal

# Set the working directory
WORKDIR /app

# Copy the .jar file that was created in Stage 1
# NOTE: Make sure your pom.xml artifactId and version match this filename.
# Your current pom.xml builds 'calorie-tracker-api-0.0.1-SNAPSHOT.jar'.
COPY --from=build /app/target/calorie-tracker-api-0.0.1-SNAPSHOT.jar app.jar

# Expose port 8080 (the port Spring Boot runs on)
EXPOSE 8080

# The command to run your application
ENTRYPOINT ["java", "-jar", "app.jar"]
