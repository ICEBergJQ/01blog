package com.example.blog.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PostResponse {
    private Long id;
    private String content;
    private String mediaUrl;
    private String mediaType;
    private LocalDateTime timestamp;
    private String username;
    private Long userId;
    private String userProfilePictureUrl;
    private boolean hidden;
}
