package com.uob.moustafa.repository;

import com.uob.moustafa.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for the User entity. It provides CRUD operations
 * and a custom method to find a user by their username.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Custom method to find a user by their username.
     * Spring Data JPA automatically creates the implementation for this method
     * based on its name. 'Optional' is used because a user might not exist.
     */
    Optional<User> findByUsername(String username);
}