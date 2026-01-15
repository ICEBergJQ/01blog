package com.example.blog.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class FileService {

    private final Path fileStorageLocation;

    public FileService(@Value("${file.upload-dir:uploads}") String uploadDir) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    public void deleteFile(String filename) {
        if (filename == null || filename.isBlank() || filename.contains("default-avatar.png")) {
            return;
        }

        try {
            Path filePath = this.fileStorageLocation.resolve(filename).normalize();
            if (Files.exists(filePath)) {
                Files.delete(filePath);
            }
        } catch (IOException ex) {
            // Log this exception or handle it as per application's error handling strategy
            System.err.println("Could not delete file: " + filename);
            ex.printStackTrace();
        }
    }
}
