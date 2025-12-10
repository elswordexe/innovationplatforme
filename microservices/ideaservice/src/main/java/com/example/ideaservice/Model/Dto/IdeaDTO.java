package com.example.ideaservice.Model.Dto;


import com.example.ideaservice.Model.entities.Attachment;
import com.example.ideaservice.Model.enums.IdeaStatus;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IdeaDTO {
    private Long id;
    private String title;
    private String description;
    private Long creatorId;
    private String creatorName;
    private Long organizationId;
    private String organizationName;
    private LocalDateTime creationDate;
    private IdeaStatus status;
    private Integer totalScore;
    private Boolean budgetApproved;
    private List<Long> assignedTeamIds;
    private List<Attachment> attachments;
    private Integer voteCount;
    private Boolean isInTop10;
}