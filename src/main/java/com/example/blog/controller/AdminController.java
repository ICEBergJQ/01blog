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

    @GetMapping("/users")
    public ResponseEntity<List<com.example.blog.dto.UserResponse>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PostMapping("/users/{userId}/ban")
    public ResponseEntity<Void> banUser(@PathVariable Long userId) {
        adminService.banUser(userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/users/{userId}/unban")
    public ResponseEntity<Void> unbanUser(@PathVariable Long userId) {
        adminService.unbanUser(userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/posts/{postId}/hide")
    public ResponseEntity<Void> hidePost(@PathVariable Long postId) {
        adminService.setPostVisibility(postId, true);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/posts/{postId}/unhide")
    public ResponseEntity<Void> unhidePost(@PathVariable Long postId) {
        adminService.setPostVisibility(postId, false);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/reports/{reportId}")
    public ResponseEntity<Void> dismissReport(@PathVariable Long reportId) {
        adminService.dismissReport(reportId);
        return ResponseEntity.ok().build();
    }
}
