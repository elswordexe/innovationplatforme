package com.example.ideaservice.Model.Dto;


import com.example.ideaservice.Model.enums.IdeaStatus;
import lombok.*;

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
    private Date creationDate;
    private IdeaStatus status;
    private Integer totalScore;
    private Boolean budgetApproved;
    private List<Long> assignedTeamIds;
    private List<AttachmentDTO> attachments;
    private Integer voteCount;
    private Boolean isInTop10;
}