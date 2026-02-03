package com.example.ideaservice.Controller;

import com.example.ideaservice.Repository.AttachementRepository;
import com.example.ideaservice.Model.entities.Attachment;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ideas/attachments")
@Slf4j
public class AttachmentController {

    private final AttachementRepository attachementRepository;

    public AttachmentController(AttachementRepository attachementRepository) {
        this.attachementRepository = attachementRepository;
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> download(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-Tenant-Id", required = false) Long tenantId,
            @RequestParam(value = "userId", required = false) String queryUserId,
            @RequestParam(value = "tenantId", required = false) String queryTenantId) {
        
        log.info("Attachment download request - ID: {}, Headers - userId: {}, tenantId: {}, Query - userId: {}, tenantId: {}", 
                id, userId, tenantId, queryUserId, queryTenantId);
        
        // Check authentication (headers first, then query params)
        Long finalUserId = userId != null ? userId : (queryUserId != null ? Long.parseLong(queryUserId) : null);
        Long finalTenantId = tenantId != null ? tenantId : (queryTenantId != null ? Long.parseLong(queryTenantId) : null);
        
        log.info("Final auth - userId: {}, tenantId: {}", finalUserId, finalTenantId);
        
        if (finalUserId == null || finalTenantId == null) {
            log.warn("Authentication failed - missing userId or tenantId");
            return ResponseEntity.status(401).build();
        }
        
        Attachment att = attachementRepository.findById(id).orElse(null);
        if (att == null) {
            log.warn("Attachment not found with ID: {}", id);
            return ResponseEntity.notFound().build();
        }

        if (att.getData() == null || att.getData().length == 0) {
            log.warn("Attachment data is empty for ID: {}", id);
            return ResponseEntity.notFound().build();
        }

        Resource res = new ByteArrayResource(att.getData());

        String contentType = att.getFileType() == null ? MediaType.APPLICATION_OCTET_STREAM_VALUE : att.getFileType();
        String filename = att.getFileName() == null ? "file" : att.getFileName();

        log.info("Successfully serving attachment: {}, size: {} bytes", filename, att.getData().length);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename.replace("\"", "") + "\"")
                .body(res);
    }

    // Temporary endpoint for testing without authentication
    @GetMapping("/{id}/download-public")
    public ResponseEntity<Resource> downloadPublic(@PathVariable Long id) {
        log.info("Public attachment download request - ID: {}", id);
        
        Attachment att = attachementRepository.findById(id).orElse(null);
        if (att == null) {
            log.warn("Attachment not found with ID: {}", id);
            return ResponseEntity.notFound().build();
        }

        if (att.getData() == null || att.getData().length == 0) {
            log.warn("Attachment data is empty for ID: {}", id);
            return ResponseEntity.notFound().build();
        }

        Resource res = new ByteArrayResource(att.getData());

        String contentType = att.getFileType() == null ? MediaType.APPLICATION_OCTET_STREAM_VALUE : att.getFileType();
        String filename = att.getFileName() == null ? "file" : att.getFileName();

        log.info("Successfully serving public attachment: {}, size: {} bytes", filename, att.getData().length);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename.replace("\"", "") + "\"")
                .body(res);
    }
}
