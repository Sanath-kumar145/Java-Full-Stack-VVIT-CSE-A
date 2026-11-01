package com.thinkmart;

import com.thinkmart.dto.AuthResponse;
import com.thinkmart.dto.LoginRequest;
import com.thinkmart.dto.RegisterRequest;
import com.thinkmart.dto.UserDTO;
import com.thinkmart.entity.User;
import com.thinkmart.exception.BadRequestException;
import com.thinkmart.exception.ResourceNotFoundException;
import com.thinkmart.repository.UserRepository;
import com.thinkmart.security.JwtTokenProvider;
import com.thinkmart.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    private PasswordEncoder passwordEncoder;
    private AuthServiceImpl authService;

    @BeforeEach
    void setUp() {
        passwordEncoder = new BCryptPasswordEncoder(10);
        authService = new AuthServiceImpl(userRepository, passwordEncoder, jwtTokenProvider);
    }

    @Test
    void testRegister_Success() {
        RegisterRequest request = new RegisterRequest("Test User", "test@thinkmart.in", "Password123", "9876543210");

        when(userRepository.existsByEmailIgnoreCase("test@thinkmart.in")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(10L);
            return user;
        });
        when(jwtTokenProvider.generateToken(any(), any(), any(), any())).thenReturn("mocked-jwt-token");

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("mocked-jwt-token", response.getToken());
        assertEquals("test@thinkmart.in", response.getUser().getEmail());
        assertEquals("Test User", response.getUser().getFullName());
        assertEquals("ROLE_CUSTOMER", response.getUser().getRole());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void testRegister_DuplicateEmail() {
        RegisterRequest request = new RegisterRequest("Duplicate User", "existing@thinkmart.in", "Password123", "9876543210");

        when(userRepository.existsByEmailIgnoreCase("existing@thinkmart.in")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testLogin_Success() {
        String rawPassword = "Password123";
        String hashedPassword = passwordEncoder.encode(rawPassword);

        User user = new User("user@thinkmart.in", hashedPassword, "Valid User", "9876543210", "ROLE_CUSTOMER");
        user.setId(1L);

        when(userRepository.findByEmailIgnoreCase("user@thinkmart.in")).thenReturn(Optional.of(user));
        when(jwtTokenProvider.generateToken(any(), any(), any(), any())).thenReturn("mocked-login-token");

        LoginRequest request = new LoginRequest("user@thinkmart.in", rawPassword);
        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("mocked-login-token", response.getToken());
        assertEquals("user@thinkmart.in", response.getUser().getEmail());
    }

    @Test
    void testLogin_InvalidPassword() {
        String rawPassword = "Password123";
        String hashedPassword = passwordEncoder.encode(rawPassword);

        User user = new User("user@thinkmart.in", hashedPassword, "Valid User", "9876543210", "ROLE_CUSTOMER");

        when(userRepository.findByEmailIgnoreCase("user@thinkmart.in")).thenReturn(Optional.of(user));

        LoginRequest request = new LoginRequest("user@thinkmart.in", "WrongPassword");
        assertThrows(BadRequestException.class, () -> authService.login(request));
    }

    @Test
    void testLogin_UserNotFound() {
        when(userRepository.findByEmailIgnoreCase("nonexistent@thinkmart.in")).thenReturn(Optional.empty());

        LoginRequest request = new LoginRequest("nonexistent@thinkmart.in", "Password123");
        assertThrows(BadRequestException.class, () -> authService.login(request));
    }

    @Test
    void testLogin_UserDisabled() {
        String rawPassword = "Password123";
        String hashedPassword = passwordEncoder.encode(rawPassword);

        User user = new User("disabled@thinkmart.in", hashedPassword, "Disabled User", "9876543210", "ROLE_CUSTOMER");
        user.setEnabled(false);

        when(userRepository.findByEmailIgnoreCase("disabled@thinkmart.in")).thenReturn(Optional.of(user));

        LoginRequest request = new LoginRequest("disabled@thinkmart.in", rawPassword);
        assertThrows(BadRequestException.class, () -> authService.login(request));
    }

    @Test
    void testGetCurrentUser_Success() {
        User user = new User("user@thinkmart.in", "hash", "Valid User", "9876543210", "ROLE_CUSTOMER");
        user.setId(1L);

        when(userRepository.findByEmailIgnoreCase("user@thinkmart.in")).thenReturn(Optional.of(user));

        UserDTO result = authService.getCurrentUser("user@thinkmart.in");

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("user@thinkmart.in", result.getEmail());
    }

    @Test
    void testGetCurrentUser_NotFound() {
        when(userRepository.findByEmailIgnoreCase("missing@thinkmart.in")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> authService.getCurrentUser("missing@thinkmart.in"));
    }
}

