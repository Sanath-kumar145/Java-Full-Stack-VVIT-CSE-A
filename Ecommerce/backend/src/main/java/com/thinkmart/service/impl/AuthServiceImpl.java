package com.thinkmart.service.impl;

import com.thinkmart.dto.AuthResponse;
import com.thinkmart.dto.LoginRequest;
import com.thinkmart.dto.RegisterRequest;
import com.thinkmart.dto.UserDTO;
import com.thinkmart.entity.User;
import com.thinkmart.exception.BadRequestException;
import com.thinkmart.exception.ResourceNotFoundException;
import com.thinkmart.repository.UserRepository;
import com.thinkmart.security.JwtTokenProvider;
import com.thinkmart.service.AuthService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthServiceImpl(UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new BadRequestException("An account with email '" + request.getEmail() + "' already exists.");
        }

        String hashedPassword = passwordEncoder.encode(request.getPassword());

        User user = new User(
                normalizedEmail,
                hashedPassword,
                request.getFullName().trim(),
                request.getPhone() != null ? request.getPhone().trim() : null,
                "ROLE_CUSTOMER"
        );

        User savedUser = userRepository.save(user);

        String token = jwtTokenProvider.generateToken(
                savedUser.getEmail(),
                savedUser.getRole(),
                savedUser.getId(),
                savedUser.getFullName()
        );

        UserDTO userDTO = mapToUserDTO(savedUser);
        return new AuthResponse(token, userDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new BadRequestException("Invalid email or password."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Invalid email or password.");
        }

        if (Boolean.FALSE.equals(user.getEnabled())) {
            throw new BadRequestException("User account is disabled. Please contact support.");
        }

        String token = jwtTokenProvider.generateToken(
                user.getEmail(),
                user.getRole(),
                user.getId(),
                user.getFullName()
        );

        UserDTO userDTO = mapToUserDTO(user);
        return new AuthResponse(token, userDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public UserDTO getCurrentUser(String email) {
        if (email == null || email.trim().isEmpty()) {
            throw new BadRequestException("Email identifier cannot be empty.");
        }

        User user = userRepository.findByEmailIgnoreCase(email.trim().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("User profile not found for email: " + email));

        return mapToUserDTO(user);
    }

    private UserDTO mapToUserDTO(User user) {
        return new UserDTO(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getPhone(),
                user.getRole()
        );
    }
}

