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
    private final FileService fileService;

    public UserResponse getUser(Long id, String requestingUsername) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        boolean isAdmin = false;
        if (requestingUsername != null) {
             User requester = userRepository.findByUsername(requestingUsername).orElse(null);
             if (requester != null && requester.getRole().name().equals("ADMIN")) {
                 isAdmin = true;
             }
        }

        return mapToResponse(user, isAdmin);
    }

    public List<UserResponse> searchUsers(String query) {
        return userRepository.findByUsernameContainingIgnoreCase(query).stream()
                .map(u -> mapToResponse(u, false)) // Search usually public, show visible count
                .collect(Collectors.toList());
    }

    public void updateProfilePicture(String username, String profilePictureUrl) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String oldProfilePictureUrl = user.getProfilePictureUrl();
        if (oldProfilePictureUrl != null) {
            String[] urlParts = oldProfilePictureUrl.split("/");
            String filename = urlParts[urlParts.length - 1];
            fileService.deleteFile(filename);
        }

        user.setProfilePictureUrl(profilePictureUrl);
        userRepository.save(user);
    }

    public void updateBio(String username, String bio) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setBio(bio);
        userRepository.save(user);
    }

    private UserResponse mapToResponse(User user, boolean isAdmin) {
        int postCount = isAdmin ? postRepository.countByUserId(user.getId()) : postRepository.countByUserIdAndHiddenFalse(user.getId());
        
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
                .postsCount(postCount)
                .build();
    }
}
