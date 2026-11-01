package com.thinkmart;

import com.thinkmart.controller.AuthController;
import com.thinkmart.dto.AuthResponse;
import com.thinkmart.dto.LoginRequest;
import com.thinkmart.dto.RegisterRequest;
import com.thinkmart.dto.UserDTO;
import com.thinkmart.exception.UnauthorizedException;
import com.thinkmart.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthControllerTest {

    @Mock
    private AuthService authService;

    private AuthController authController;

    @BeforeEach
    void setUp() {
        authController = new AuthController(authService);
    }

    @Test
    void testRegisterEndpoint() {
        RegisterRequest request = new RegisterRequest("Sanath Kumar", "sanath@thinkmart.in", "Password123", "9876543210");
        UserDTO userDTO = new UserDTO(1L, "sanath@thinkmart.in", "Sanath Kumar", "9876543210", "ROLE_CUSTOMER");
        AuthResponse mockResponse = new AuthResponse("jwt-token-123", userDTO);

        when(authService.register(any(RegisterRequest.class))).thenReturn(mockResponse);

        ResponseEntity<AuthResponse> response = authController.register(request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("jwt-token-123", response.getBody().getToken());
        assertEquals("sanath@thinkmart.in", response.getBody().getUser().getEmail());
    }

    @Test
    void testLoginEndpoint() {
        LoginRequest request = new LoginRequest("sanath@thinkmart.in", "Password123");
        UserDTO userDTO = new UserDTO(1L, "sanath@thinkmart.in", "Sanath Kumar", "9876543210", "ROLE_CUSTOMER");
        AuthResponse mockResponse = new AuthResponse("jwt-login-token", userDTO);

        when(authService.login(any(LoginRequest.class))).thenReturn(mockResponse);

        ResponseEntity<AuthResponse> response = authController.login(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("jwt-login-token", response.getBody().getToken());
    }

    @Test
    void testGetCurrentUserEndpoint_Authenticated() {
        Authentication auth = new UsernamePasswordAuthenticationToken(
                "sanath@thinkmart.in",
                null,
                java.util.Collections.singletonList(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_CUSTOMER"))
        );
        UserDTO userDTO = new UserDTO(1L, "sanath@thinkmart.in", "Sanath Kumar", "9876543210", "ROLE_CUSTOMER");

        when(authService.getCurrentUser("sanath@thinkmart.in")).thenReturn(userDTO);

        ResponseEntity<UserDTO> response = authController.getCurrentUser(auth);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("sanath@thinkmart.in", response.getBody().getEmail());
    }

    @Test
    void testGetCurrentUserEndpoint_Unauthenticated() {
        assertThrows(UnauthorizedException.class, () -> authController.getCurrentUser(null));
    }
}
