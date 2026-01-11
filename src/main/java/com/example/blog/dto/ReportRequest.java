package com.example.blog.dto;

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
public class ReportRequest {
    @NotBlank(message = "Reason is required")
    @Size(max = 500, message = "Reason cannot exceed 500 characters")
    private String reason;
    
    private Long reportedUserId;
    private Long reportedPostId;
}