package com.example.userservice.mapper;

import com.example.userservice.dto.UserCreateRequest;
import com.example.userservice.dto.UserDTO;
import com.example.userservice.dto.UserUpdateRequest;
import com.example.userservice.entities.Tenant;
import com.example.userservice.entities.TenantType;
import com.example.userservice.entities.User;
import com.example.userservice.repositories.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class UserMapperImpl implements UserMapper {
    
    private final TenantRepository tenantRepository;
    
    @Override
    public UserDTO toDTO(User user) {
        if (user == null) return null;
        
        String tenantName = null;
        if (user.getTenantId() != null) {
            Optional<Tenant> tenant = tenantRepository.findById(user.getTenantId());
            tenantName = tenant.map(Tenant::getName).orElse(null);
        }
        
        return UserDTO.builder()
                .id(user.getId())
                .fullname(user.getFullname())
                .email(user.getEmail())
                .role(user.getRole())
                .profilePicture(user.getProfilePicture())
                .entityType(user.getEntityType())
                .tenantId(user.getTenantId())
                .tenantType(user.getTenantType())
                .tenantName(tenantName)
                .build();
    }

    @Override
    public List<UserDTO> toDTOList(List<User> users) {
        if (users == null) return List.of();
        return users.stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public User toEntity(UserCreateRequest request) {
        if (request == null) return null;
        User user = new User();
        user.setFullname(request.getFullname());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());
        user.setRole(request.getRole());
        user.setProfilePicture(request.getProfilePicture());
        // Map entityType string to enum if provided
        if (request.getEntityType() != null && !request.getEntityType().isBlank()) {
            String et = request.getEntityType().trim().toLowerCase();
            switch (et) {
                case "startup" -> user.setEntityType(TenantType.STARTUP);
                case "organization" -> user.setEntityType(TenantType.ORGANIZATION);
                case "individual" -> user.setEntityType(TenantType.INDIVIDUAL);
                default -> user.setEntityType(null);
            }
        }
        return user;
    }

    @Override
    public void updateEntityFromDTO(UserUpdateRequest request, User user) {
        if (request == null || user == null) return;
        if (request.getFullname() != null) user.setFullname(request.getFullname());
        if (request.getEmail() != null) user.setEmail(request.getEmail());
        if (request.getPassword() != null) user.setPassword(request.getPassword());
        if (request.getRole() != null) user.setRole(request.getRole());
        if (request.getProfilePicture() != null) user.setProfilePicture(request.getProfilePicture());
    }
}

