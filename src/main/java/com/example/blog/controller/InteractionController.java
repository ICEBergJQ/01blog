package com.example.blog.controller;

import com.example.blog.service.InteractionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/interactions")
@RequiredArgsConstructor
public class InteractionController {

    private final InteractionService interactionService;

    @PostMapping("/like/{postId}")
    public ResponseEntity<Void> toggleLike(
            @PathVariable Long postId,
            Authentication authentication
    ) {
        interactionService.toggleLike(postId, authentication.getName());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/like/{postId}/count")
    public ResponseEntity<Long> getLikeCount(@PathVariable Long postId) {
        return ResponseEntity.ok(interactionService.getLikeCount(postId));
    }

    @GetMapping("/like/{postId}/status")
    public ResponseEntity<Map<String, Boolean>> getLikeStatus(
            @PathVariable Long postId,
            Authentication authentication
    ) {
        boolean isLiked = interactionService.isLikedBy(postId, authentication.getName());
        return ResponseEntity.ok(Map.of("liked", isLiked));
    }

    @GetMapping("/follow/{userId}/status")
    public ResponseEntity<Map<String, Boolean>> getFollowStatus(
            @PathVariable Long userId,
            Authentication authentication
    ) {
        boolean isFollowing = interactionService.isFollowing(userId, authentication.getName());
        return ResponseEntity.ok(Map.of("following", isFollowing));
    }

    @PostMapping("/follow/{userId}")
    public ResponseEntity<Void> followUser(
            @PathVariable Long userId,
            Authentication authentication
    ) {
        interactionService.followUser(userId, authentication.getName());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/unfollow/{userId}")
    public ResponseEntity<Void> unfollowUser(
            @PathVariable Long userId,
            Authentication authentication
    ) {
        interactionService.unfollowUser(userId, authentication.getName());
        return ResponseEntity.ok().build();
    }
}
