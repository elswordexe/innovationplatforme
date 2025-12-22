package com.example.userservice.service;

import com.example.userservice.dto.UserCreateRequest;
import com.example.userservice.dto.UserDTO;
import com.example.userservice.dto.UserUpdateRequest;
import com.example.userservice.exceptions.ResourceNotFoundException;

import java.util.List;

public interface UserService {
    UserDTO createUser(UserCreateRequest request);
    UserDTO getById(Long id) throws ResourceNotFoundException;
    List<UserDTO> getAll();
    UserDTO update(Long id, UserUpdateRequest request) throws ResourceNotFoundException;
    void delete(Long id) throws ResourceNotFoundException;
    UserDTO getByEmail(String email) throws ResourceNotFoundException;
    List<UserDTO> searchByName(String keyword);
    List<UserDTO> getByRole(String role);
}

