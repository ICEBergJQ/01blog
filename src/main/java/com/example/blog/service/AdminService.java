package com.example.blog.service;

import com.example.blog.dto.PageResponse;
import com.example.blog.dto.ReportResponse;
import com.example.blog.model.Report;
import com.example.blog.model.User;
import com.example.blog.repository.ReportRepository;
import com.example.blog.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final ReportRepository reportRepository;
    private final com.example.blog.repository.PostRepository postRepository;

    public PageResponse<com.example.blog.dto.UserResponse> getAllUsers(int page, int size) {
        Page<User> usersPage = userRepository.findAll(PageRequest.of(page, size));
        
        List<com.example.blog.dto.UserResponse> content = usersPage.getContent().stream()
                .map(user -> com.example.blog.dto.UserResponse.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .email(user.getEmail())
                        .role(user.getRole())
                        .enabled(user.isEnabled())
                        .profilePictureUrl(user.getProfilePictureUrl())
                        .bio(user.getBio())
                        .followersCount(user.getFollowers() != null ? user.getFollowers().size() : 0)
                        .followingCount(user.getFollowing() != null ? user.getFollowing().size() : 0)
                        .postsCount(postRepository.countByUserIdAndHiddenFalse(user.getId()))
                        .build())
                .collect(Collectors.toList());
                
        return new PageResponse<>(content, usersPage.getNumber(), usersPage.getSize(), usersPage.getTotalElements(), usersPage.getTotalPages(), usersPage.isLast());
    }

    public PageResponse<ReportResponse> getAllReports(int page, int size) {
        Page<Report> reportsPage = reportRepository.findAllByOrderByTimestampDesc(PageRequest.of(page, size));
        
        List<ReportResponse> content = reportsPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
                
        return new PageResponse<>(content, reportsPage.getNumber(), reportsPage.getSize(), reportsPage.getTotalElements(), reportsPage.getTotalPages(), reportsPage.isLast());
    }

    public void banUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (user.getRole().name().equals("ADMIN")) {
            throw new RuntimeException("You cannot ban an admin");
        }
        
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
                .postHidden(report.getReportedPost() != null && report.getReportedPost().isHidden())
                .build();
    }
}
