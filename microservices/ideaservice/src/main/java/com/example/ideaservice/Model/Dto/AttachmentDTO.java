package com.example.ideaservice.Model.Dto;

import lombok.*;

import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttachmentDTO {

    private Long id;
    private String fileName;
    private String fileType;
    private String fileUrl;
    private Long fileSize;
    private Date uploadDate;
    private Long uploadedBy;
    private String uploadedByName;
}
