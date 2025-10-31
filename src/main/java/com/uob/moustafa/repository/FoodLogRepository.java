package com.uob.moustafa.repository;

import com.uob.moustafa.model.FoodLog;
import com.uob.moustafa.model.User; // --- IMPORT THIS ---
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FoodLogRepository extends JpaRepository<FoodLog, Long> {

    /**
     * Finds all food log entries for a specific date (less useful in a multi-user app).
     */
    List<FoodLog> findByLogDate(String logDate);

    // --- NEW METHOD STARTS HERE ---
    /**
     * Finds all food log entries that belong to a specific user on a specific date.
     * Spring Data JPA automatically builds the database query from this method name.
     * @param user The user entity to search for.
     * @param logDate The date string (e.g., "2025-10-16") to search for.
     * @return A list of food logs matching the criteria.
     */
    List<FoodLog> findByUserAndLogDate(User user, String logDate);
    // --- NEW METHOD ENDS HERE ---
}