package com.example.userservice.service;

import com.example.userservice.dto.UserCreateRequest;
import com.example.userservice.dto.UserDTO;
import com.example.userservice.dto.UserUpdateRequest;
import com.example.userservice.exceptions.ResourceNotFoundException;
import org.springframework.web.multipart.MultipartFile;

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
    
    // Profile picture management
    UserDTO uploadProfilePicture(Long userId, MultipartFile file) throws ResourceNotFoundException;
    UserDTO updateProfilePicture(Long userId, String profilePictureUrl) throws ResourceNotFoundException;
    byte[] getProfilePicture(Long userId) throws ResourceNotFoundException;
    String getUserNameById(Long userId) throws ResourceNotFoundException;
}

