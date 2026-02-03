package com.example.userservice.mapper;

import com.example.userservice.dto.UserCreateRequest;
import com.example.userservice.dto.UserDTO;
import com.example.userservice.dto.UserUpdateRequest;
import com.example.userservice.entities.User;

import java.util.List;

public interface UserMapper {
    UserDTO toDTO(User user);
    List<UserDTO> toDTOList(List<User> users);
    User toEntity(UserCreateRequest request);
    void updateEntityFromDTO(UserUpdateRequest request, User user);
}

