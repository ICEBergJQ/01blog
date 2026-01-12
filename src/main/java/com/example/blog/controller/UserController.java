package com.example.blog.controller;

import com.example.blog.dto.UserResponse;
import com.example.blog.model.User;
import com.example.blog.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final com.example.blog.service.UserService userService;
    private final com.example.blog.repository.PostRepository postRepository;

    @GetMapping("/search")
    public ResponseEntity<List<UserResponse>> searchUsers(@RequestParam String query) {
        return ResponseEntity.ok(userService.searchUsers(query));
    }

    @PutMapping("/profile-picture")
    public ResponseEntity<Void> updateProfilePicture(
            @RequestBody com.example.blog.dto.UpdateProfilePictureRequest request,
            org.springframework.security.core.Authentication authentication
    ) {
        System.out.println("Updating profile picture for: " + authentication.getName());
        System.out.println("URL: " + request.getProfilePictureUrl());
        userService.updateProfilePicture(authentication.getName(), request.getProfilePictureUrl());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/bio")
    public ResponseEntity<Void> updateBio(
            @jakarta.validation.Valid @RequestBody com.example.blog.dto.UpdateBioRequest request,
            org.springframework.security.core.Authentication authentication
    ) {
        System.out.println("Updating bio for: " + authentication.getName());
        System.out.println("Bio: " + request.getBio());
        userService.updateBio(authentication.getName(), request.getBio());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUser(@PathVariable Long id, org.springframework.security.core.Authentication authentication) {
        String username = authentication != null ? authentication.getName() : null;
        return ResponseEntity.ok(userService.getUser(id, username));
    }
}
