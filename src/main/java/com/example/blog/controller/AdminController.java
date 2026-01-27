package com.example.blog.controller;

import com.example.blog.dto.CursorResponse;
import com.example.blog.dto.PageResponse;
import com.example.blog.dto.ReportResponse;
import com.example.blog.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/reports")
    public ResponseEntity<CursorResponse<ReportResponse>> getAllReports(
            @RequestParam(required = false) Long cursor,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(adminService.getAllReports(cursor, size));
    }

    @GetMapping("/users")
    public ResponseEntity<PageResponse<com.example.blog.dto.UserResponse>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(adminService.getAllUsers(page, size));
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

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long userId) {
        adminService.deleteUser(userId);
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