package com.example.blog.service;

import com.example.blog.dto.ReportRequest;
import com.example.blog.model.Post;
import com.example.blog.model.Report;
import com.example.blog.model.User;
import com.example.blog.repository.PostRepository;
import com.example.blog.repository.ReportRepository;
import com.example.blog.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;

    public void submitReport(ReportRequest request, String reporterUsername) {
        User reporter = userRepository.findByUsername(reporterUsername)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        Report.ReportBuilder reportBuilder = Report.builder()
                .reason(request.getReason())
                .reporter(reporter);

        if (request.getReportedUserId() != null) {
            User reportedUser = userRepository.findById(request.getReportedUserId())
                    .orElseThrow(() -> new RuntimeException("Reported user not found"));
            reportBuilder.reportedUser(reportedUser);
        }

        if (request.getReportedPostId() != null) {
            Post reportedPost = postRepository.findById(request.getReportedPostId())
                    .orElseThrow(() -> new RuntimeException("Reported post not found"));
            reportBuilder.reportedPost(reportedPost);
        }

        reportRepository.save(reportBuilder.build());
    }
}
