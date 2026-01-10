package com.example.blog.service;

import com.example.blog.dto.ReportResponse;
import com.example.blog.model.Report;
import com.example.blog.model.User;
import com.example.blog.repository.ReportRepository;
import com.example.blog.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final ReportRepository reportRepository;
    private final com.example.blog.repository.PostRepository postRepository; // Need to inject this

    public void banUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setEnabled(false);
        userRepository.save(user);
    }

    public void unbanUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setEnabled(true);
        userRepository.save(user);
    }

    public void setPostVisibility(Long postId, boolean hidden) {
        com.example.blog.model.Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        post.setHidden(hidden);
        postRepository.save(post);
    }

    public List<com.example.blog.dto.UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(user -> com.example.blog.dto.UserResponse.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .email(user.getEmail())
                        .role(user.getRole())
                        .enabled(user.isEnabled())
                        .profilePictureUrl(user.getProfilePictureUrl())
                        .bio(user.getBio())
                        .build())
                .collect(Collectors.toList());
    }

    public List<ReportResponse> getAllReports() {
        return reportRepository.findAllByOrderByTimestampDesc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public void dismissReport(Long reportId) {
        reportRepository.deleteById(reportId);
    }

    private ReportResponse mapToResponse(Report report) {
        String reportedUsername = null;
        Long reportedUserId = null;

        if (report.getReportedUser() != null) {
            reportedUsername = report.getReportedUser().getUsername();
            reportedUserId = report.getReportedUser().getId();
        } else if (report.getReportedPost() != null) {
            reportedUsername = report.getReportedPost().getUser().getUsername();
            reportedUserId = report.getReportedPost().getUser().getId();
        }

        return ReportResponse.builder()
                .id(report.getId())
                .reason(report.getReason())
                .timestamp(report.getTimestamp())
                .reporterUsername(report.getReporter().getUsername())
                .reportedUsername(reportedUsername)
                .reportedUserId(reportedUserId)
                .reportedPostId(report.getReportedPost() != null ? report.getReportedPost().getId() : null)
                .build();
    }
}
