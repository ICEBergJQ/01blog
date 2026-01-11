package com.example.blog.controller;

import com.example.blog.dto.ReportRequest;
import com.example.blog.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @PostMapping
    public ResponseEntity<Void> submitReport(
            @jakarta.validation.Valid @RequestBody ReportRequest request,
            Authentication authentication
    ) {
        reportService.submitReport(request, authentication.getName());
        return ResponseEntity.ok().build();
    }
}
