package com.example.blog.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReportResponse {
    private Long id;
    private String reason;
    private LocalDateTime timestamp;
    private String reporterUsername;
    private String reportedUsername;
    private Long reportedUserId;
    private Long reportedPostId;
    private boolean postHidden;
}
