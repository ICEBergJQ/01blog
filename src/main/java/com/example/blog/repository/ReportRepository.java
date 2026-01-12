package com.example.blog.repository;

import com.example.blog.model.Report;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    @Query("SELECT r FROM Report r WHERE (:cursor IS NULL OR r.id < :cursor) ORDER BY r.id DESC")
    List<Report> findAllReportsCursor(Long cursor, Pageable pageable);
}
