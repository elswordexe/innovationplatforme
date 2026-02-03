package com.example.userservice.service;

import com.example.userservice.dto.RedeemRequest;
import com.example.userservice.dto.RedeemResponse;
import com.example.userservice.dto.TenantCreateRequest;
import com.example.userservice.dto.UserCreateRequest;
import com.example.userservice.dto.UserDTO;
import com.example.userservice.dto.UserUpdateRequest;
import com.example.userservice.entities.User;
import com.example.userservice.entities.TenantType;
import com.example.userservice.exceptions.ResourceNotFoundException;
import com.example.userservice.mapper.UserMapper;
import com.example.userservice.repositories.UserRepository;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Base64;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final OnboardingService onboardingService;
    private final TenantService tenantService;

    @Override
    public UserDTO createUser(UserCreateRequest request) {
        User user = userMapper.toEntity(request);
        if (request.getSsoCode() != null && !request.getSsoCode().isBlank()) {
            try {
                RedeemRequest redeemReq = new RedeemRequest();
                redeemReq.setSsoCode(request.getSsoCode().toUpperCase());
                redeemReq.setEmail(request.getEmail());
                RedeemResponse redeemed = onboardingService.redeem(redeemReq);
                user.setTenantId(redeemed.getTenantId());
                user.setTenantType(redeemed.getTenantType());
            } catch (Exception ex) {
                log.warn("SSO redeem failed for code {} - continuing user creation: {}", request.getSsoCode(), ex.getMessage());
            }
        }

        // If user is a startup/organization and provided a tenant name, create a tenant and associate.
        // (Only when tenant not already assigned via SSO.)
        if (user.getTenantId() == null
                && request.getTenantName() != null
                && !request.getTenantName().isBlank()
                && request.getEntityType() != null
                && ("startup".equalsIgnoreCase(request.getEntityType()) || "organization".equalsIgnoreCase(request.getEntityType()))) {
            String tenantType = "organization".equalsIgnoreCase(request.getEntityType()) ? "ORGANIZATION" : "STARTUP";
            TenantCreateRequest tReq = TenantCreateRequest.builder()
                    .name(request.getTenantName().trim())
                    .tenantType(tenantType)
                    .build();
            try {
                var created = tenantService.createTenant(tReq, null);
                user.setTenantId(created.getId());
                user.setTenantType(TenantType.valueOf(created.getTenantType()));
            } catch (Exception ex) {
                log.warn("Tenant creation failed for name {} - continuing user creation: {}", request.getTenantName(), ex.getMessage());
            }
        }

        user.setPassword(passwordEncoder.encode(request.getPassword()));
        // Save in its own transaction to avoid rollback caused by external failures
        User saved = saveUserTransactional(user);
        return userMapper.toDTO(saved);
    }

    @Transactional
    protected User saveUserTransactional(User user) {
        return userRepository.save(user);
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
        
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            existing.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        
        // Update profile picture if provided
        if (request.getProfilePicture() != null) {
            existing.setProfilePicture(request.getProfilePicture());
        }
        
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

    @Override
    @Transactional
    public UserDTO uploadProfilePicture(Long userId, MultipartFile file) throws ResourceNotFoundException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        try {
            // Convert image to base64 for storage
            byte[] imageBytes = file.getBytes();
            String base64Image = Base64.getEncoder().encodeToString(imageBytes);
            
            // Determine if it's a base64 image or URL
            String profilePicture = base64Image;
            if (file.getContentType() != null && file.getContentType().startsWith("image/")) {
                // It's an image file, store as data URL
                profilePicture = "data:" + file.getContentType() + ";base64," + base64Image;
            }
            
            user.setProfilePicture(profilePicture);
            User saved = userRepository.save(user);
            
            log.info("Profile picture uploaded successfully for user: {}", userId);
            return userMapper.toDTO(saved);
            
        } catch (IOException e) {
            log.error("Failed to process profile picture for user: {}", userId, e);
            throw new RuntimeException("Failed to process profile picture", e);
        }
    }

    @Override
    @Transactional
    public UserDTO updateProfilePicture(Long userId, String profilePictureUrl) throws ResourceNotFoundException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        user.setProfilePicture(profilePictureUrl);
        User saved = userRepository.save(user);
        
        log.info("Profile picture updated successfully for user: {}", userId);
        return userMapper.toDTO(saved);
    }

    @Override
    public byte[] getProfilePicture(Long userId) throws ResourceNotFoundException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        if (user.getProfilePicture() == null) {
            throw new ResourceNotFoundException("Profile picture not found for user: " + userId);
        }
        
        // If it's a data URL, extract the base64 part
        if (user.getProfilePicture().startsWith("data:")) {
            String base64Data = user.getProfilePicture().split(",")[1];
            return Base64.getDecoder().decode(base64Data);
        }
        
        // If it's a regular URL, return empty array (client should fetch the URL)
        return new byte[0];
    }

    @Override
    public String getUserNameById(Long userId) throws ResourceNotFoundException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return user.getFullname();
    }
}

