package com.uob.moustafa.controller;

import com.uob.moustafa.model.FoodLog;
import com.uob.moustafa.model.User;
import com.uob.moustafa.repository.FoodLogRepository;
import com.uob.moustafa.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/logs")
public class FoodLogController {

    @Autowired
    private FoodLogRepository foodLogRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Helper method to retrieve the single "demo_user" for portfolio mode.
     * @return The User object for the demo user.
     */
    private User getDemoUser() {
        return userRepository.findByUsername("demo_user")
                .orElseThrow(() -> new RuntimeException("Fatal Error: The demo_user was not found in the database."));
    }

    /**
     * Adds a new food log and assigns it to the demo user.
     */
    @PostMapping
    public FoodLog addFoodLog(@RequestBody FoodLog foodLog) {
        foodLog.setUser(getDemoUser());
        return foodLogRepository.save(foodLog);
    }

    /**
     * Gets all food logs for a specific date that belong to the demo user.
     */
    @GetMapping
    public List<FoodLog> getFoodLogsByDate(@RequestParam String date) {
        User demoUser = getDemoUser();
        return foodLogRepository.findByUserAndLogDate(demoUser, date);
    }

    /**
     * Deletes a food log by its ID.
     * In demo mode, we don't need to check who owns it.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFoodLog(@PathVariable Long id) {
        foodLogRepository.deleteById(id);
        return ResponseEntity.noContent().build(); // Standard practice to return 204 No Content on successful delete
    }

    /**
     * Updates an existing food log.
     * In demo mode, we don't need to check who owns it.
     */
    @PutMapping("/{id}")
    public ResponseEntity<FoodLog> updateFoodLog(@PathVariable Long id, @RequestBody FoodLog updatedLogDetails) {
        return foodLogRepository.findById(id)
                .map(existingLog -> {
                    // Update all fields from the request
                    existingLog.setFoodName(updatedLogDetails.getFoodName());
                    existingLog.setCalories(updatedLogDetails.getCalories());
                    existingLog.setProtein(updatedLogDetails.getProtein());
                    existingLog.setCarbs(updatedLogDetails.getCarbs());
                    existingLog.setFat(updatedLogDetails.getFat());

                    FoodLog savedLog = foodLogRepository.save(existingLog);
                    return ResponseEntity.ok(savedLog);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}