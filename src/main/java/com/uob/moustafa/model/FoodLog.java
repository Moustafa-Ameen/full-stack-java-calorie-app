package com.uob.moustafa.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "food_logs")
public class FoodLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String foodName;
    private int calories;
    private int protein; // in grams
    private int carbs;   // in grams
    private int fat;     // in grams

    private String logDate;

    // --- NEW CODE STARTS HERE ---
    // This creates a "many-to-one" relationship: many food logs can belong to one user.
    // fetch = FetchType.LAZY means we only load the user data when we explicitly need it.
    // @JsonIgnore prevents sending the user's sensitive data back to the frontend.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;
    // --- NEW CODE ENDS HERE ---


    // --- CONSTRUCTORS, GETTERS, AND SETTERS ---
    public FoodLog() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getFoodName() { return foodName; }
    public void setFoodName(String foodName) { this.foodName = foodName; }
    public int getCalories() { return calories; }
    public void setCalories(int calories) { this.calories = calories; }
    public String getLogDate() { return logDate; }
    public void setLogDate(String logDate) { this.logDate = logDate; }
    public int getProtein() { return protein; }
    public void setProtein(int protein) { this.protein = protein; }
    public int getCarbs() { return carbs; }
    public void setCarbs(int carbs) { this.carbs = carbs; }
    public int getFat() { return fat; }
    public void setFat(int fat) { this.fat = fat; }

    // --- NEW GETTER AND SETTER FOR THE USER ---
    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
    // --- END OF NEW GETTER AND SETTER ---
}