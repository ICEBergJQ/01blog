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
    
    @Query("SELECT p FROM Post p WHERE p.hidden = false ORDER BY p.timestamp DESC")
    Page<Post> findAllVisibleByOrderByTimestampDesc(Pageable pageable);

    Page<Post> findAllByOrderByTimestampDesc(Pageable pageable);
    
    int countByUserId(Long userId);
    
    int countByUserIdAndHiddenFalse(Long userId);
}