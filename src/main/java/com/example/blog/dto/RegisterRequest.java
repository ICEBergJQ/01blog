package com.example.blog.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {
    @NotBlank(message = "Username is required")
    @Size(max = 50, message = "Username cannot exceed 50 characters")
    private String username;

    @Email(message = "Invalid email format")
    @jakarta.validation.constraints.Pattern(
        regexp = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$", 
        message = "Please provide a valid email address with a domain (e.g. .com)"
    )
    @NotBlank(message = "Email is required")
    @Size(max = 100, message = "Email cannot exceed 100 characters")
    private String email;

    @NotBlank(message = "Password is required")
    @jakarta.validation.constraints.Pattern(
        regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,}$",
        message = "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number"
    )
    private String password;
    
    @jakarta.validation.constraints.Size(max = 200, message = "Bio cannot exceed 200 characters")
    private String bio;
    
    private String profilePictureUrl;
}
