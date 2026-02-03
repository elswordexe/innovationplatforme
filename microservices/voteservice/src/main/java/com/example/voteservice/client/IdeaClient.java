package com.example.voteservice.client;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
@RequiredArgsConstructor
public class IdeaClient {

    private final RestTemplate restTemplate;

    public Long getIdeaOwnerId(Long ideaId) {
        var idea = restTemplate.getForObject("http://ideaservice/api/ideas/" + ideaId, IdeaSummary.class);
        return idea != null ? idea.getCreatorId() : null;
    }

    public void updateVoteCount(Long ideaId, int voteCount) {
        restTemplate.put("http://ideaservice/api/ideas/" + ideaId + "/voteCount", voteCount);
    }

    @lombok.Data
    public static class IdeaSummary {
        private Long id;
        private Long creatorId;
    }
}
