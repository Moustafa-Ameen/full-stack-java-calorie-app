package com.uob.moustafa.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

/**
 * Represents a custom food item created by a user.
 */
@Entity
public class CustomFood {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String foodName;
    private int calories;
    private int protein;
    private int carbs;
    private int fat;

    // --- NEW: Link to the User ---
    // This creates a "many-to-one" relationship: many custom foods can belong to one user.
    // fetch = FetchType.LAZY means we only load the user data when we explicitly need it.
    // @JsonIgnore prevents sending the user's sensitive data back to the frontend.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;

    // --- Constructors, Getters, and Setters ---
    public CustomFood() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getFoodName() { return foodName; }
    public void setFoodName(String foodName) { this.foodName = foodName; }
    public int getCalories() { return calories; }
    public void setCalories(int calories) { this.calories = calories; }
    public int getProtein() { return protein; }
    public void setProtein(int protein) { this.protein = protein; }
    public int getCarbs() { return carbs; }
    public void setCarbs(int carbs) { this.carbs = carbs; }
    public int getFat() { return fat; }
    public void setFat(int fat) { this.fat = fat; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}