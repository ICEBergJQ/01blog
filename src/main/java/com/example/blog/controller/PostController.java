package com.example.blog.controller;

import com.example.blog.dto.CursorResponse;
import com.example.blog.dto.PostRequest;
import com.example.blog.dto.PostResponse;
import com.example.blog.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @PostMapping
    public ResponseEntity<PostResponse> createPost(
            @jakarta.validation.Valid @RequestBody PostRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(postService.createPost(request, authentication.getName()));
    }

    @GetMapping
    public ResponseEntity<CursorResponse<PostResponse>> getAllPosts(
            @RequestParam(required = false) Long cursor,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication
    ) {
        return ResponseEntity.ok(postService.getAllPosts(authentication.getName(), cursor, size));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<CursorResponse<PostResponse>> getPostsByUser(
            @PathVariable Long userId,
            @RequestParam(required = false) Long cursor,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication
    ) {
        return ResponseEntity.ok(postService.getPostsByUser(userId, authentication.getName(), cursor, size));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PostResponse> updatePost(
            @PathVariable Long id,
            @RequestBody PostRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(postService.updatePost(id, request, authentication.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(
            @PathVariable Long id,
            Authentication authentication
    ) {
        postService.deletePost(id, authentication.getName());
        return ResponseEntity.ok().build();
    }
}