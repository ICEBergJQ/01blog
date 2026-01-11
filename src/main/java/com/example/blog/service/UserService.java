package com.example.blog.service;

import com.example.blog.dto.UserResponse;
import com.example.blog.model.User;
import com.example.blog.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final com.example.blog.repository.PostRepository postRepository;

    public List<UserResponse> searchUsers(String query) {
        return userRepository.findByUsernameContainingIgnoreCase(query).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public void updateProfilePicture(String username, String profilePictureUrl) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setProfilePictureUrl(profilePictureUrl);
        userRepository.save(user);
    }

    public void updateBio(String username, String bio) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setBio(bio);
        userRepository.save(user);
    }

    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .enabled(user.isEnabled())
                .profilePictureUrl(user.getProfilePictureUrl())
                .bio(user.getBio())
                .followersCount(user.getFollowers() != null ? user.getFollowers().size() : 0)
                .followingCount(user.getFollowing() != null ? user.getFollowing().size() : 0)
                .postsCount(postRepository.countByUserIdAndHiddenFalse(user.getId()))
                .build();
    }
}
