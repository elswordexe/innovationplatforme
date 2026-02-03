package com.example.ideaservice.Service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path uploadDir;

    public FileStorageService(@Value("${app.upload.dir:uploads}") String uploadDir) {
        this.uploadDir = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    public StoredFile storeIdeaFile(Long ideaId, MultipartFile file, String subFolder) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IOException("Empty file");
        }

        String originalName = StringUtils.cleanPath(file.getOriginalFilename() == null ? "file" : file.getOriginalFilename());
        String ext = "";
        int idx = originalName.lastIndexOf('.');
        if (idx >= 0 && idx < originalName.length() - 1) {
            ext = originalName.substring(idx);
        }

        String safeName = UUID.randomUUID() + ext;
        Path ideaFolder = uploadDir.resolve("ideas").resolve(String.valueOf(ideaId));
        if (subFolder != null && !subFolder.isBlank()) {
            ideaFolder = ideaFolder.resolve(subFolder);
        }

        Files.createDirectories(ideaFolder);
        Path target = ideaFolder.resolve(safeName);

        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

        return new StoredFile(target.toString(), safeName);
    }

    public Resource loadAsResource(String absolutePath) {
        if (absolutePath == null || absolutePath.isBlank()) {
            return null;
        }
        return new FileSystemResource(absolutePath);
    }

    public record StoredFile(String absolutePath, String storedName) {}
}
