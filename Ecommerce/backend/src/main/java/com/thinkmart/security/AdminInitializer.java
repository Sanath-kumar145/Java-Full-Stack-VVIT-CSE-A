package com.thinkmart.security;

import com.thinkmart.entity.User;
import com.thinkmart.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.util.List;

@Component
public class AdminInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(AdminInitializer.class);
    private static final String CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final String initialAdminEmail;
    private final String initialAdminPassword;
    private final Environment environment;

    public AdminInitializer(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.admin.initial-email:admin@thinkmart.in}") String initialAdminEmail,
            @Value("${app.admin.initial-password:}") String initialAdminPassword,
            Environment environment
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.initialAdminEmail = initialAdminEmail;
        this.initialAdminPassword = initialAdminPassword;
        this.environment = environment;
    }

    // Secondary constructor for convenient programmatic testing
    public AdminInitializer(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            String initialAdminEmail,
            String initialAdminPassword
    ) {
        this(userRepository, passwordEncoder, initialAdminEmail, initialAdminPassword, null);
    }

    @Override
    public void run(String... args) {
        boolean prod = isProductionEnvironment();
        List<User> existingAdmins;
        try {
            existingAdmins = userRepository.findByRole("ROLE_ADMIN");
        } catch (Exception ex) {
            if (prod) {
                logger.error("Production startup failed: Unable to verify administrator accounts from database: {}", ex.getMessage());
                throw new IllegalStateException("Production startup failed: Database unreachable for administrator check.", ex);
            } else {
                logger.warn("AdminInitializer could not verify administrator accounts (database may not yet be available): {}", ex.getMessage());
                return;
            }
        }

        if (existingAdmins != null && !existingAdmins.isEmpty()) {
            logger.info("Administrator account already provisioned. Initializer skipping creation.");
            return;
        }

        String email = (initialAdminEmail != null && !initialAdminEmail.trim().isEmpty())
                ? initialAdminEmail.trim().toLowerCase()
                : "admin@thinkmart.in";

        String rawPassword;
        if (initialAdminPassword != null && !initialAdminPassword.trim().isEmpty()) {
            rawPassword = initialAdminPassword.trim();
            logger.info("Provisioning initial administrator account for '{}' from environment configuration.", email);
        } else if (prod) {
            logger.error("Production startup failed: Required initial administrator password (INITIAL_ADMIN_PASSWORD / app.admin.initial-password) is missing.");
            throw new IllegalStateException("Production startup failed: app.admin.initial-password must be configured in production.");
        } else {
            rawPassword = generateSecureRandomPassword();
            logger.info("Provisioning initial administrator account for '{}' with generated temporary password: {}", email, rawPassword);
        }

        String hashedPassword = passwordEncoder.encode(rawPassword);

        User adminUser = new User(
                email,
                hashedPassword,
                "ThinkMart Administrator",
                "0000000000",
                "ROLE_ADMIN"
        );

        try {
            userRepository.save(adminUser);
            logger.info("Initial administrator account successfully provisioned for '{}'.", email);
        } catch (Exception ex) {
            if (prod) {
                logger.error("Production startup failed: Unable to persist initial administrator account: {}", ex.getMessage());
                throw new IllegalStateException("Production startup failed: Unable to persist administrator.", ex);
            } else {
                logger.warn("AdminInitializer could not persist initial administrator: {}", ex.getMessage());
            }
        }
    }

    private boolean isProductionEnvironment() {
        if (environment == null) {
            return false;
        }
        for (String profile : environment.getActiveProfiles()) {
            if ("prod".equalsIgnoreCase(profile) || "production".equalsIgnoreCase(profile)) {
                return true;
            }
        }
        return false;
    }

    private String generateSecureRandomPassword() {
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder(16);
        for (int i = 0; i < 16; i++) {
            sb.append(CHARACTERS.charAt(random.nextInt(CHARACTERS.length())));
        }
        return sb.toString();
    }
}
