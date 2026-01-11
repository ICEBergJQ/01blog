package com.example.blog.dto;

import com.example.blog.model.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserResponse {
    private Long id;
    private String username;
    private String email;
    private Role role;
    private boolean enabled;
    private String profilePictureUrl;
    private String bio;
    private int followersCount;
    private int followingCount;
    private int postsCount;
}
