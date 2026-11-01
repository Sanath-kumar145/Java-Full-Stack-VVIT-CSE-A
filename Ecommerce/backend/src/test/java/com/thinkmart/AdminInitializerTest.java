package com.thinkmart;

import com.thinkmart.entity.User;
import com.thinkmart.repository.UserRepository;
import com.thinkmart.security.AdminInitializer;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AdminInitializerTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private Environment environment;

    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        passwordEncoder = new BCryptPasswordEncoder(10);
    }

    @Test
    void testRun_AdminAlreadyExists() {
        User existingAdmin = new User("admin@thinkmart.in", "hash", "Admin", "0000000000", "ROLE_ADMIN");
        when(userRepository.findByRole("ROLE_ADMIN")).thenReturn(List.of(existingAdmin));

        AdminInitializer initializer = new AdminInitializer(userRepository, passwordEncoder, "admin@thinkmart.in", "AdminPass123");
        initializer.run();

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testRun_AdminDoesNotExist_CreatesAdminWithConfiguredPassword() {
        when(userRepository.findByRole("ROLE_ADMIN")).thenReturn(Collections.emptyList());

        AdminInitializer initializer = new AdminInitializer(userRepository, passwordEncoder, "admin@thinkmart.in", "AdminPass123");
        initializer.run();

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository, times(1)).save(captor.capture());

        User createdAdmin = captor.getValue();
        assertEquals("admin@thinkmart.in", createdAdmin.getEmail());
        assertEquals("ROLE_ADMIN", createdAdmin.getRole());
        assertTrue(passwordEncoder.matches("AdminPass123", createdAdmin.getPasswordHash()));
    }

    @Test
    void testRun_AdminDoesNotExist_CreatesAdminWithGeneratedPassword_InDev() {
        when(userRepository.findByRole("ROLE_ADMIN")).thenReturn(Collections.emptyList());

        AdminInitializer initializer = new AdminInitializer(userRepository, passwordEncoder, "customadmin@thinkmart.in", "");
        initializer.run();

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository, times(1)).save(captor.capture());

        User createdAdmin = captor.getValue();
        assertEquals("customadmin@thinkmart.in", createdAdmin.getEmail());
        assertEquals("ROLE_ADMIN", createdAdmin.getRole());
        assertNotNull(createdAdmin.getPasswordHash());
        assertTrue(createdAdmin.getPasswordHash().startsWith("$2a$10$") || createdAdmin.getPasswordHash().startsWith("$2b$10$"));
    }

    @Test
    void testRun_ProductionProfile_FailsStartupWhenPasswordMissing() {
        when(environment.getActiveProfiles()).thenReturn(new String[]{"prod"});
        when(userRepository.findByRole("ROLE_ADMIN")).thenReturn(Collections.emptyList());

        AdminInitializer initializer = new AdminInitializer(userRepository, passwordEncoder, "admin@thinkmart.in", "", environment);

        IllegalStateException ex = assertThrows(IllegalStateException.class, initializer::run);
        assertTrue(ex.getMessage().contains("app.admin.initial-password must be configured in production"));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testRun_ProductionProfile_SucceedsWhenPasswordConfigured() {
        when(environment.getActiveProfiles()).thenReturn(new String[]{"production"});
        when(userRepository.findByRole("ROLE_ADMIN")).thenReturn(Collections.emptyList());

        AdminInitializer initializer = new AdminInitializer(userRepository, passwordEncoder, "admin@thinkmart.in", "StrongProdPassword123!", environment);
        initializer.run();

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository, times(1)).save(captor.capture());

        User createdAdmin = captor.getValue();
        assertEquals("admin@thinkmart.in", createdAdmin.getEmail());
        assertEquals("ROLE_ADMIN", createdAdmin.getRole());
        assertTrue(passwordEncoder.matches("StrongProdPassword123!", createdAdmin.getPasswordHash()));
    }

    @Test
    void testRun_ProductionProfile_FailsStartupWhenDatabaseFails() {
        when(environment.getActiveProfiles()).thenReturn(new String[]{"prod"});
        when(userRepository.findByRole("ROLE_ADMIN")).thenThrow(new RuntimeException("Database offline"));

        AdminInitializer initializer = new AdminInitializer(userRepository, passwordEncoder, "admin@thinkmart.in", "ProdPass123!", environment);

        IllegalStateException ex = assertThrows(IllegalStateException.class, initializer::run);
        assertTrue(ex.getMessage().contains("Database unreachable"));
    }
}
