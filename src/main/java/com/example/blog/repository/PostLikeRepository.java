package com.example.blog.repository;

import com.example.blog.model.PostLike;
import com.example.blog.model.User;
import com.example.blog.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PostLikeRepository extends JpaRepository<PostLike, Long> {
    Optional<PostLike> findByUserAndPost(User user, Post post);
    long countByPost(Post post);
    boolean existsByUserAndPost(User user, Post post);
}
