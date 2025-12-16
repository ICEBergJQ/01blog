package com.example.blog.controller;

import com.example.blog.dto.ReportResponse;
import com.example.blog.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/reports")
    public ResponseEntity<List<ReportResponse>> getAllReports() {
        return ResponseEntity.ok(adminService.getAllReports());
    }

    @PostMapping("/users/{userId}/ban")
    public ResponseEntity<Void> banUser(@PathVariable Long userId) {
        adminService.banUser(userId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/reports/{reportId}")
    public ResponseEntity<Void> dismissReport(@PathVariable Long reportId) {
        adminService.dismissReport(reportId);
        return ResponseEntity.ok().build();
    }
}
