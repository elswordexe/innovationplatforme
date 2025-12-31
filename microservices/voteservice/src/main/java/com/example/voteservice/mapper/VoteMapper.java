package com.example.voteservice.mapper;

import com.example.voteservice.Model.Dto.VoteDto;
import com.example.voteservice.Model.entities.Vote;

public interface VoteMapper {
    Vote toEntity(VoteDto dto);
    VoteDto toDto(Vote vote);
}
