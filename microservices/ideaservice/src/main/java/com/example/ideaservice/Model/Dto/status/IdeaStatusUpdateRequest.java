package com.example.ideaservice.Model.Dto.status;

import com.example.ideaservice.Model.enums.IdeaStatus;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IdeaStatusUpdateRequest {
    private IdeaStatus status;
}
