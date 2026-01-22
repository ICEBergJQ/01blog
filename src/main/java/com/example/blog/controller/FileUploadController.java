package com.example.blog.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import javax.imageio.ImageIO;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
// import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/files")
public class FileUploadController {

    private final Path fileStorageLocation;
    private final org.apache.tika.Tika tika = new org.apache.tika.Tika();

    public FileUploadController(@Value("${file.upload-dir:uploads}") String uploadDir) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) {
        return upload(file, Arrays.asList(
            // Images
            "image/jpeg", "image/png", "image/gif", "image/webp",
            "image/bmp", "image/x-ms-bmp", "image/tiff", "image/heic", "image/heif", "image/x-icon", "image/vnd.microsoft.icon",
            // Videos
            "video/mp4", "video/webm", "video/quicktime", "video/x-matroska", "application/x-matroska",
            "video/x-msvideo", "video/x-ms-wmv", "video/x-flv", "video/mpeg", "video/3gpp", "video/ogg"
        ), "Only images and videos are allowed.", false);
    }

    @PostMapping("/upload-profile-picture")
    public ResponseEntity<Map<String, String>> uploadProfilePicture(@RequestParam("file") MultipartFile file) {
        return upload(file, Arrays.asList(
            "image/jpeg", "image/png", "image/gif", "image/webp",
            "image/bmp", "image/x-ms-bmp", "image/tiff", "image/heic", "image/heif", "image/x-icon", "image/vnd.microsoft.icon"
        ), "Invalid file type. Only images are allowed for profile pictures.", true);
    }

    private ResponseEntity<Map<String, String>> upload(MultipartFile file, List<String> allowedTypes, String errorMessage, boolean isProfilePicture) {
        try {
            byte[] fileBytes = file.getBytes();
            String detectedType = tika.detect(fileBytes);
            long fileSize = file.getSize();

            // Enforce size limits based on type
            if (isProfilePicture) {
                if (fileSize > 10 * 1024 * 1024) { // 10MB for profiles
                    throw new RuntimeException("Profile picture exceeds the 10MB limit.");
                }
            } else if (detectedType.startsWith("image/")) {
                if (fileSize > 20 * 1024 * 1024) { // 20MB for post images
                    throw new RuntimeException("Image exceeds the 20MB limit.");
                }
            } else if (detectedType.startsWith("video/") || detectedType.equals("application/x-matroska")) {
                if (fileSize > 100 * 1024 * 1024) { // 100MB for post videos
                    throw new RuntimeException("Video exceeds the 100MB limit.");
                }
            }

            if (detectedType == null || !allowedTypes.contains(detectedType)) {
                throw new RuntimeException(errorMessage + " (Detected type: " + detectedType + ")");
            }

            // Resize Profile Pictures
            if (isProfilePicture && detectedType.startsWith("image/")) {
                String formatName = "jpg";
                if (detectedType.contains("png")) formatName = "png";
                else if (detectedType.contains("gif")) formatName = "gif";
                else if (detectedType.contains("bmp")) formatName = "bmp";
                
                try {
                    fileBytes = resizeImage(fileBytes, 400, formatName); // Resize to 400px width
                } catch (Exception e) {
                    System.err.println("Failed to resize image: " + e.getMessage());
                    // Continue with original bytes if resize fails
                }
            }

            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();

            if (fileName.contains("..")) {
                throw new RuntimeException("Sorry! Filename contains invalid path sequence " + fileName);
            }

            Path targetLocation = this.fileStorageLocation.resolve(fileName);
            Files.write(targetLocation, fileBytes);

            String fileDownloadUri = "/api/files/download/" + fileName;

            Map<String, String> response = new HashMap<>();
            response.put("fileName", fileName);
            response.put("fileUrl", fileDownloadUri);
            
            return ResponseEntity.ok(response);
        } catch (IOException ex) {
             throw new RuntimeException("Could not process file. " + ex.getMessage(), ex);
        }
    }

    private byte[] resizeImage(byte[] originalImage, int targetWidth, String format) throws IOException {
        BufferedImage image = ImageIO.read(new ByteArrayInputStream(originalImage));
        if (image == null) return originalImage; // Could not read image

        int originalWidth = image.getWidth();
        int originalHeight = image.getHeight();
        
        // Don't resize if already smaller
        if (originalWidth <= targetWidth) {
            return originalImage;
        }

        int targetHeight = (int) ((double) originalHeight / originalWidth * targetWidth);

        // Use ARGB for PNG/GIF to preserve transparency, RGB for others
        int type = (format.equalsIgnoreCase("png") || format.equalsIgnoreCase("gif")) 
                   ? BufferedImage.TYPE_INT_ARGB : BufferedImage.TYPE_INT_RGB;

        BufferedImage resizedImage = new BufferedImage(targetWidth, targetHeight, type);
        Graphics2D graphics = resizedImage.createGraphics();
        graphics.drawImage(image, 0, 0, targetWidth, targetHeight, null);
        graphics.dispose();

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(resizedImage, format, baos);
        return baos.toByteArray();
    }

    @GetMapping("/download/{fileName:.+}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String fileName) {
        try {
            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists()) {
                String contentType = "application/octet-stream"; 
                // Simple content type detection could be added here
                if(fileName.endsWith(".jpg") || fileName.endsWith(".png")) contentType = "image/jpeg";
                if(fileName.endsWith(".mp4")) contentType = "video/mp4";

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                throw new RuntimeException("File not found " + fileName);
            }
        } catch (MalformedURLException ex) {
            throw new RuntimeException("File not found " + fileName, ex);
        }
    }
}