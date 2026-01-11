package com.example.blog.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PostRequest {
    @Size(max = 2000, message = "Post content cannot exceed 2000 characters")
    private String content;
    private String mediaUrl;
    private String mediaType;
}
