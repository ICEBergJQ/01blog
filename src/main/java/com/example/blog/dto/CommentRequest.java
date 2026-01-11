package com.example.blog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CommentRequest {
    @NotBlank(message = "Comment cannot be empty")
    @Size(max = 500, message = "Comment cannot exceed 500 characters")
    private String content;
    
    @NotNull(message = "Post ID is required")
    private Long postId;
}