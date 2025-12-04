package com.example.ideaservice.Model.Dto.status;

import com.example.ideaservice.Model.enums.IdeaStatus;
import lombok.Data;

@Data
public class IdeaStatusUpdateRequest {
    private IdeaStatus status;
}
