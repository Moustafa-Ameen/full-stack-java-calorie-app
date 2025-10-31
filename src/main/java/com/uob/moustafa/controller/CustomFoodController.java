package com.uob.moustafa.controller;

import com.uob.moustafa.model.CustomFood;
import com.uob.moustafa.model.User;
import com.uob.moustafa.repository.CustomFoodRepository;
import com.uob.moustafa.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller to manage a user's custom food items.
 */
@RestController
@RequestMapping("/api/custom-foods")
public class CustomFoodController {

    @Autowired
    private CustomFoodRepository customFoodRepository;

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
     * Gets all custom food items for the demo user.
     */
    @GetMapping
    public ResponseEntity<List<CustomFood>> getUserCustomFoods() {
        User user = getDemoUser();
        List<CustomFood> customFoods = customFoodRepository.findByUser(user);
        return ResponseEntity.ok(customFoods);
    }

    /**
     * Creates a new custom food item for the demo user.
     */
    @PostMapping
    public ResponseEntity<CustomFood> createCustomFood(@RequestBody CustomFood customFood) {
        User user = getDemoUser();
        // Associate the new custom food with the demo user
        customFood.setUser(user);
        CustomFood savedFood = customFoodRepository.save(customFood);
        return ResponseEntity.ok(savedFood);
    }

    /**
     * Updates an existing custom food item for the demo user.
     */
    @PutMapping("/{id}")
    public ResponseEntity<CustomFood> updateCustomFood(@PathVariable Long id, @RequestBody CustomFood customFood) {
        User user = getDemoUser();

        // Find the existing custom food
        CustomFood existingFood = customFoodRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Custom food not found with id: " + id));

        // Verify it belongs to the demo user
        if (!existingFood.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized: Custom food does not belong to the demo user");
        }

        // Update the fields
        existingFood.setFoodName(customFood.getFoodName());
        existingFood.setCalories(customFood.getCalories());
        existingFood.setProtein(customFood.getProtein());
        existingFood.setCarbs(customFood.getCarbs());
        existingFood.setFat(customFood.getFat());

        // Save and return
        CustomFood updatedFood = customFoodRepository.save(existingFood);
        return ResponseEntity.ok(updatedFood);
    }

    /**
     * Deletes a custom food item for the demo user.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCustomFood(@PathVariable Long id) {
        User user = getDemoUser();

        // Find the existing custom food
        CustomFood existingFood = customFoodRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Custom food not found with id: " + id));

        // Verify it belongs to the demo user
        if (!existingFood.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized: Custom food does not belong to the demo user");
        }

        // Delete the food
        customFoodRepository.delete(existingFood);
        return ResponseEntity.ok().build();
    }
}