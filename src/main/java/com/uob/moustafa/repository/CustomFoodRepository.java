package com.uob.moustafa.repository;

import com.uob.moustafa.model.CustomFood;
import com.uob.moustafa.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for the CustomFood entity.
 */
@Repository
public interface CustomFoodRepository extends JpaRepository<CustomFood, Long> {

    /**
     * Finds all custom food items created by a specific user.
     * Spring Data JPA automatically builds the query from this method name.
     */
    List<CustomFood> findByUser(User user);
}