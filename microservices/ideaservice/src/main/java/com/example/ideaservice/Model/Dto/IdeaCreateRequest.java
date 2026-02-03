package com.example.ideaservice.Model.Dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IdeaCreateRequest {

    private String title;

    private String description;

    private Long organizationId;

    private String imageBase64;

    private List<AttachmentUploadRequest> attachments;

    private String category;

    private String priority;
}
