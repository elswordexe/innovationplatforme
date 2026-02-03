package com.example.ideaservice.Model.Dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttachmentUploadRequest {
    private String fileName;
    private String fileType;
    private String dataBase64;
}
