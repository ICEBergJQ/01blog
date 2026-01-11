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
public class UpdateBioRequest {
    @Size(max = 200, message = "Bio cannot exceed 200 characters")
    private String bio;
}
