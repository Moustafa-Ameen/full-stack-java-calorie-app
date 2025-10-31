package com.uob.moustafa.controller;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/food")
public class FoodDataController {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private List<FoodItem> foodDatabase = new ArrayList<>();

    public FoodDataController() {
        loadFoodDatabase();
    }

    /**
     * Load the food database from the JSON file on startup
     */
    private void loadFoodDatabase() {
        try {
            ClassPathResource resource = new ClassPathResource("foods-database.json");
            foodDatabase = objectMapper.readValue(
                    resource.getInputStream(),
                    new TypeReference<List<FoodItem>>() {}
            );
            System.out.println("✅ Loaded " + foodDatabase.size() + " foods from local database");
        } catch (IOException e) {
            System.err.println("❌ Failed to load food database: " + e.getMessage());
            foodDatabase = new ArrayList<>();
        }
    }

    /**
     * Internal class to parse the JSON food database
     */
    public static class FoodItem {
        private String name;
        private double calories;
        private double protein_g;
        private double carbohydrates_total_g;
        private double fat_total_g;
        private double serving_size_g;

        // Getters and Setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public double getCalories() { return calories; }
        public void setCalories(double calories) { this.calories = calories; }
        public double getProtein_g() { return protein_g; }
        public void setProtein_g(double protein_g) { this.protein_g = protein_g; }
        public double getCarbohydrates_total_g() { return carbohydrates_total_g; }
        public void setCarbohydrates_total_g(double carbohydrates_total_g) { this.carbohydrates_total_g = carbohydrates_total_g; }
        public double getFat_total_g() { return fat_total_g; }
        public void setFat_total_g(double fat_total_g) { this.fat_total_g = fat_total_g; }
        public double getServing_size_g() { return serving_size_g; }
        public void setServing_size_g(double serving_size_g) { this.serving_size_g = serving_size_g; }
    }

    /**
     * This class defines the JSON structure that the frontend expects
     */
    public static class FoodSearchResult {
        private String foodName;
        private int calories;
        private int protein;
        private int carbs;
        private int fat;
        private double servingWeightGrams;

        @JsonProperty("food_name")
        public String getFoodName() { return foodName; }
        @JsonProperty("nf_calories")
        public int getCalories() { return calories; }
        @JsonProperty("nf_protein")
        public int getProtein() { return protein; }
        @JsonProperty("nf_total_carbohydrate")
        public int getCarbs() { return carbs; }
        @JsonProperty("nf_total_fat")
        public int getFat() { return fat; }
        @JsonProperty("serving_weight_grams")
        public double getServingWeightGrams() { return servingWeightGrams; }

        public void setFoodName(String foodName) { this.foodName = foodName; }
        public void setCalories(int calories) { this.calories = calories; }
        public void setProtein(int protein) { this.protein = protein; }
        public void setCarbs(int carbs) { this.carbs = carbs; }
        public void setFat(int fat) { this.fat = fat; }
        public void setServingWeightGrams(double servingWeightGrams) { this.servingWeightGrams = servingWeightGrams; }
    }

    @GetMapping("/search")
    public ResponseEntity<List<FoodSearchResult>> searchFood(@RequestParam String query) {
        System.out.println("🔍 Searching for: " + query);

        // Search the local database for foods matching the query
        String searchTerm = query.toLowerCase().trim();

        List<FoodSearchResult> results = foodDatabase.stream()
                .filter(food -> food.getName().toLowerCase().contains(searchTerm))
                .map(food -> {
                    FoodSearchResult result = new FoodSearchResult();
                    result.setFoodName(food.getName());
                    result.setCalories((int) Math.round(food.getCalories()));
                    result.setProtein((int) Math.round(food.getProtein_g()));
                    result.setCarbs((int) Math.round(food.getCarbohydrates_total_g()));
                    result.setFat((int) Math.round(food.getFat_total_g()));
                    result.setServingWeightGrams(food.getServing_size_g());
                    return result;
                })
                .limit(10) // Limit to 10 results
                .collect(Collectors.toList());

        System.out.println("✅ Found " + results.size() + " results");
        return ResponseEntity.ok(results);
    }
}