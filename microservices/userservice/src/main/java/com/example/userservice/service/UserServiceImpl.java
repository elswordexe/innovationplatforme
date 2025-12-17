package com.example.userservice.service;

import com.example.userservice.dto.UserCreateRequest;
import com.example.userservice.dto.UserDTO;
import com.example.userservice.dto.UserUpdateRequest;
import com.example.userservice.entities.User;
import com.example.userservice.exceptions.ResourceNotFoundException;
import com.example.userservice.mapper.UserMapper;
import com.example.userservice.repositories.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @Override
    public UserDTO create(UserCreateRequest request) {
        User user = userMapper.toEntity(request);
        User saved = userRepository.save(user);
        return userMapper.toDTO(saved);
    }

    @Override
    public UserDTO getById(Long id) throws ResourceNotFoundException {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return userMapper.toDTO(user);
    }

    @Override
    public List<UserDTO> getAll() {
        return userMapper.toDTOList(userRepository.findAll());
    }

    @Override
    public UserDTO update(Long id, UserUpdateRequest request) throws ResourceNotFoundException {
        User existing = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        userMapper.updateEntityFromDTO(request, existing);
        User saved = userRepository.save(existing);
        return userMapper.toDTO(saved);
    }

    @Override
    public void delete(Long id) throws ResourceNotFoundException {
        User existing = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        userRepository.delete(existing);
    }

    @Override
    public UserDTO getByEmail(String email) throws ResourceNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return userMapper.toDTO(user);
    }

    @Override
    public List<UserDTO> searchByName(String keyword) {
        return userMapper.toDTOList(userRepository.findByFullnameContainingIgnoreCase(keyword));
    }

    @Override
    public List<UserDTO> getByRole(String role) {
        return userMapper.toDTOList(userRepository.findByRole(role));
    }
}

