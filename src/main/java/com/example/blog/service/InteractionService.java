package com.example.blog.service;

import com.example.blog.model.NotificationType;
import com.example.blog.model.Post;
import com.example.blog.model.PostLike;
import com.example.blog.model.User;
import com.example.blog.repository.PostLikeRepository;
import com.example.blog.repository.PostRepository;
import com.example.blog.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class InteractionService {

    private final PostLikeRepository postLikeRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional
    public void toggleLike(Long postId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        if (post.isHidden()) {
            throw new RuntimeException("Interaction is disabled for hidden posts");
        }

        Optional<PostLike> existingLike = postLikeRepository.findByUserAndPost(user, post);
        if (existingLike.isPresent()) {
            postLikeRepository.delete(existingLike.get());
        } else {
            PostLike like = PostLike.builder()
                    .user(user)
                    .post(post)
                    .build();
            postLikeRepository.save(like);
            
            if (!post.getUser().getUsername().equals(username)) {
                notificationService.createNotification(post.getUser(), user, NotificationType.LIKE, null);
            }
        }
    }
    
    public long getLikeCount(Long postId) {
         Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
         return postLikeRepository.countByPost(post);
    }

    public boolean isLikedBy(Long postId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        return postLikeRepository.existsByUserAndPost(user, post);
    }

    public boolean isFollowing(Long userId, String followerUsername) {
        User follower = userRepository.findByUsername(followerUsername)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        User userToCheck = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return follower.getFollowing().contains(userToCheck);
    }

    @Transactional
    public void followUser(Long userIdToFollow, String followerUsername) {
        User follower = userRepository.findByUsername(followerUsername)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        User userToFollow = userRepository.findById(userIdToFollow)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (follower.getId().equals(userToFollow.getId())) {
            throw new RuntimeException("You cannot follow yourself");
        }
        
        if (!follower.getFollowing().contains(userToFollow)) {
            follower.getFollowing().add(userToFollow);
            userRepository.save(follower);
            notificationService.createNotification(userToFollow, follower, NotificationType.FOLLOW, null);
        }
    }

    @Transactional
    public void unfollowUser(Long userIdToUnfollow, String followerUsername) {
        User follower = userRepository.findByUsername(followerUsername)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        User userToUnfollow = userRepository.findById(userIdToUnfollow)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (follower.getFollowing().contains(userToUnfollow)) {
            follower.getFollowing().remove(userToUnfollow);
            userRepository.save(follower);
        }
    }
}
