package com.ecommerce.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.Instant;
import java.util.UUID;

@Service
public class FileStorageService {
    
    @Value("${file.upload-dir}")
    private String uploadDir;

    @Value("${cloudflare.r2.enabled:false}")
    private boolean r2Enabled;

    @Value("${cloudflare.r2.account-id:}")
    private String r2AccountId;

    @Value("${cloudflare.r2.access-key-id:}")
    private String r2AccessKeyId;

    @Value("${cloudflare.r2.secret-access-key:}")
    private String r2SecretAccessKey;

    @Value("${cloudflare.r2.bucket:}")
    private String r2Bucket;

    @Value("${cloudflare.r2.endpoint:}")
    private String r2Endpoint;

    @Value("${cloudflare.r2.public-base-url:}")
    private String r2PublicBaseUrl;

    @Value("${cloudflare.r2.key-prefix:products}")
    private String r2KeyPrefix;
    
    private Path fileStorageLocation;

    private volatile S3Client r2Client;
    
    @PostConstruct
    public void init() {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create upload directory", ex);
        }
    }
    
    public String storeFile(MultipartFile file) {
        if (isR2Enabled()) {
            return storeInR2(file);
        }

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        
        // Check for invalid characters
        if (originalFilename.contains("..")) {
            throw new RuntimeException("Invalid file path: " + originalFilename);
        }
        
        // Generate unique filename
        String fileExtension = "";
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex > 0) {
            fileExtension = originalFilename.substring(dotIndex);
        }
        String newFilename = UUID.randomUUID().toString() + fileExtension;
        
        try {
            Path targetLocation = this.fileStorageLocation.resolve(newFilename);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            return newFilename;
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + originalFilename, ex);
        }
    }
    
    public Resource loadFileAsResource(String filename) {
        try {
            if (isR2Key(filename)) {
                throw new RuntimeException("R2 objects are not stored on this server");
            }

            Path filePath = this.fileStorageLocation.resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists()) {
                return resource;
            } else {
                throw new RuntimeException("File not found: " + filename);
            }
        } catch (MalformedURLException ex) {
            throw new RuntimeException("File not found: " + filename, ex);
        }
    }
    
    public void deleteFile(String filename) {
        try {
            if (isR2Key(filename)) {
                deleteFromR2(filename);
                return;
            }

            Path filePath = this.fileStorageLocation.resolve(filename).normalize();
            Files.deleteIfExists(filePath);
        } catch (IOException ex) {
            throw new RuntimeException("Could not delete file: " + filename, ex);
        }
    }
    
    public String getFileUrl(String filename) {
        if (isR2Key(filename)) {
            if (!StringUtils.hasText(r2PublicBaseUrl)) {
                throw new RuntimeException("R2 is enabled but cloudflare.r2.public-base-url is not configured");
            }

            String objectKey = filename.substring("r2:".length());
            String base = r2PublicBaseUrl.endsWith("/") ? r2PublicBaseUrl.substring(0, r2PublicBaseUrl.length() - 1) : r2PublicBaseUrl;
            String key = objectKey.startsWith("/") ? objectKey.substring(1) : objectKey;
            return UriComponentsBuilder.fromHttpUrl(base).path("/").path(key).build().toUriString();
        }
        return "/api/files/" + filename;
    }

    private boolean isR2Enabled() {
        return r2Enabled
                && StringUtils.hasText(r2AccountId)
                && StringUtils.hasText(r2AccessKeyId)
                && StringUtils.hasText(r2SecretAccessKey)
                && StringUtils.hasText(r2Bucket);
    }

    private boolean isR2Key(String key) {
        return key != null && key.startsWith("r2:");
    }

    private String storeInR2(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("No file provided");
        }

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        if (originalFilename.contains("..")) {
            throw new RuntimeException("Invalid file path: " + originalFilename);
        }

        String fileExtension = "";
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex > 0) {
            fileExtension = originalFilename.substring(dotIndex);
        }

        String prefix = normalizeKeyPrefix(r2KeyPrefix);
        String objectKey = prefix + UUID.randomUUID() + "-" + Instant.now().toEpochMilli() + fileExtension;

        try {
            PutObjectRequest request = PutObjectRequest.builder()
                    .bucket(r2Bucket)
                    .key(objectKey)
                    .contentType(file.getContentType())
                    .build();

            getR2Client().putObject(request, RequestBody.fromBytes(file.getBytes()));
            return "r2:" + objectKey;
        } catch (IOException ex) {
            throw new RuntimeException("Could not read uploaded file", ex);
        } catch (Exception ex) {
            throw new RuntimeException("Could not upload file to R2", ex);
        }
    }

    private void deleteFromR2(String key) {
        if (!isR2Enabled()) {
            // If R2 is disabled, don't hard-fail deletes for old keys.
            return;
        }

        String objectKey = key.substring("r2:".length());
        try {
            DeleteObjectRequest request = DeleteObjectRequest.builder()
                    .bucket(r2Bucket)
                    .key(objectKey)
                    .build();
            getR2Client().deleteObject(request);
        } catch (Exception ex) {
            // Don't block app flow on delete failures.
        }
    }

    private String normalizeKeyPrefix(String prefix) {
        if (!StringUtils.hasText(prefix)) {
            return "";
        }
        String trimmed = prefix.trim();
        while (trimmed.startsWith("/")) {
            trimmed = trimmed.substring(1);
        }
        while (trimmed.endsWith("/")) {
            trimmed = trimmed.substring(0, trimmed.length() - 1);
        }
        return trimmed.isEmpty() ? "" : trimmed + "/";
    }

    private S3Client getR2Client() {
        S3Client existing = r2Client;
        if (existing != null) {
            return existing;
        }

        synchronized (this) {
            if (r2Client != null) {
                return r2Client;
            }

            String endpoint = StringUtils.hasText(r2Endpoint)
                    ? r2Endpoint
                    : "https://" + r2AccountId + ".r2.cloudflarestorage.com";

            r2Client = S3Client.builder()
                    .endpointOverride(URI.create(endpoint))
                    .region(Region.US_EAST_1)
                    .credentialsProvider(StaticCredentialsProvider.create(
                            AwsBasicCredentials.create(r2AccessKeyId, r2SecretAccessKey)
                    ))
                    .build();
            return r2Client;
        }
    }
}
