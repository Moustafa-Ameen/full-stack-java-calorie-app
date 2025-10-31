package com.uob.moustafa.controller;

import com.uob.moustafa.model.User;
import com.uob.moustafa.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class UserController {

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
     * Gets the profile information for the demo user.
     * @return The User object (excluding the password).
     */
    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser() {
        User user = getDemoUser();
        // IMPORTANT: Never send the password back to the frontend
        user.setPassword(null);
        return ResponseEntity.ok(user);
    }

    /**
     * Sets or updates the calorie goal for the demo user.
     * @param payload The request body containing the new goal.
     * @return An OK response.
     */
    @PutMapping("/goal")
    public ResponseEntity<Void> setCalorieGoal(@RequestBody Map<String, Integer> payload) {
        Integer goal = payload.get("goal");
        User user = getDemoUser();

        user.setCalorieGoal(goal);
        userRepository.save(user);

        return ResponseEntity.ok().build();
    }
}