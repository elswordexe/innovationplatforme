package com.example.voteservice.mapper;

import com.example.voteservice.Model.Dto.VoteDto;
import com.example.voteservice.Model.entities.Vote;
import org.springframework.stereotype.Component;

@Component
public class VoteMapperImpl implements VoteMapper {

    @Override
    public Vote toEntity(VoteDto dto) {
        Vote vote = new Vote();

        // ❌ NE JAMAIS mapper l'id en création
        // vote.setId(dto.getId());

        vote.setUserId(dto.getUserId());
        vote.setIdeaId(dto.getIdeaId());
        vote.setVoteType(dto.getVoteType());

        return vote;
    }

    @Override
    public VoteDto toDto(Vote vote) {
        VoteDto dto = new VoteDto();
        dto.setId(vote.getId());
        dto.setUserId(vote.getUserId());
        dto.setIdeaId(vote.getIdeaId());
        dto.setVoteType(vote.getVoteType());
        return dto;
    }
}
