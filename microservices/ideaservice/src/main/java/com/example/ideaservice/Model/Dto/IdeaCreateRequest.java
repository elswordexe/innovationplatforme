package com.example.ideaservice.Model.Dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IdeaCreateRequest {

    private String title;

    private String description;

    private Long organizationId;
}
