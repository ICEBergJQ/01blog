package com.example.blog.repository;

import com.example.blog.model.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findByUserIdOrderByTimestampDesc(Long userId);
    
    @Query("SELECT p FROM Post p WHERE (:cursor IS NULL OR p.id < :cursor) AND p.hidden = false ORDER BY p.id DESC")
    List<Post> findVisiblePostsCursor(Long cursor, Pageable pageable);

    @Query("SELECT p FROM Post p WHERE (:cursor IS NULL OR p.id < :cursor) ORDER BY p.id DESC")
    List<Post> findAllPostsCursor(Long cursor, Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.user.id = :userId AND (:cursor IS NULL OR p.id < :cursor) ORDER BY p.id DESC")
    List<Post> findUserPostsCursor(Long userId, Long cursor, Pageable pageable);

    int countByUserId(Long userId);
    
    int countByUserIdAndHiddenFalse(Long userId);
}