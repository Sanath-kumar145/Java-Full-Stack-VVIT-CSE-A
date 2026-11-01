package com.thinkmart;

import com.thinkmart.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;
    private final String secretKey = "thinkmart-test-secret-key-that-is-at-least-256-bits-long-123456";

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider(secretKey, 3600000); // 1 hour expiration
    }

    @Test
    void testGenerateTokenAndValidate() {
        String token = jwtTokenProvider.generateToken("test@thinkmart.in", "ROLE_CUSTOMER", 1L, "Test User");

        assertNotNull(token);
        assertTrue(jwtTokenProvider.validateToken(token));
        assertEquals("test@thinkmart.in", jwtTokenProvider.getEmailFromToken(token));
        assertEquals("ROLE_CUSTOMER", jwtTokenProvider.getRoleFromToken(token));
    }

    @Test
    void testValidateToken_Expired() {
        // Create a provider with negative expiration to simulate an already expired token
        JwtTokenProvider expiredProvider = new JwtTokenProvider(secretKey, -1000);
        String expiredToken = expiredProvider.generateToken("expired@thinkmart.in", "ROLE_CUSTOMER", 2L, "Expired User");

        assertFalse(jwtTokenProvider.validateToken(expiredToken));
    }

    @Test
    void testValidateToken_Tampered() {
        String token = jwtTokenProvider.generateToken("test@thinkmart.in", "ROLE_CUSTOMER", 1L, "Test User");
        String tamperedToken = token + "xyz";

        assertFalse(jwtTokenProvider.validateToken(tamperedToken));
    }

    @Test
    void testValidateToken_NullOrEmpty() {
        assertFalse(jwtTokenProvider.validateToken(null));
        assertFalse(jwtTokenProvider.validateToken(""));
        assertFalse(jwtTokenProvider.validateToken("   "));
    }
}

