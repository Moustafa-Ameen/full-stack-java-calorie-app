package com.uob.moustafa;

import com.uob.moustafa.model.User;
import com.uob.moustafa.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

/**
 * Main application class. This file tells the Java Runtime and Spring Boot
 * framework where to start. The @SpringBootApplication annotation handles
 * configuration and automatically starts the embedded web server (Tomcat).
 */
@SpringBootApplication
public class CalorieTrackerApplication {

    public static void main(String[] args) {
        // This method launches the Spring Boot application and starts the server.
        SpringApplication.run(CalorieTrackerApplication.class, args);
    }

    /**
     * This method runs once the application has started.
     * It checks if a "demo_user" exists in the database. If not, it creates one.
     * This ensures the application always has a default user for portfolio mode.
     * @param userRepository The repository to interact with the User table.
     * @return A CommandLineRunner instance that Spring Boot will execute.
     */
    @Bean
    CommandLineRunner initDatabase(UserRepository userRepository) {
        return args -> {
            String demoUsername = "demo_user";
            // Check if the demo user already exists to avoid creating duplicates on restart
            if (userRepository.findByUsername(demoUsername).isEmpty()) {
                User demoUser = new User();
                demoUser.setUsername(demoUsername);
                demoUser.setPassword("password_not_needed"); // Password doesn't matter in demo mode
                demoUser.setCalorieGoal(2200); // Set a default calorie goal
                userRepository.save(demoUser);
                System.out.println("--- Created '" + demoUsername + "' for portfolio mode. ---");
            }
        };
    }
}