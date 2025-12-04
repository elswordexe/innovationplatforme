package com.example.ideaservice.Model.Dto;

import com.example.ideaservice.Model.enums.IdeaStatus;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IdeaUpdateRequest {
    private String title;
    private String description;
    private IdeaStatus status;
    private Boolean budgetApproved;
}