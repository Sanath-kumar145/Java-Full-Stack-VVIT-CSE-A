package com.thinkmart;

import com.thinkmart.controller.AuthController;
import com.thinkmart.controller.HealthController;
import com.thinkmart.controller.OrderController;
import com.thinkmart.controller.ProductController;
import com.thinkmart.dto.OrderItemDTO;
import com.thinkmart.dto.OrderResponseDTO;
import com.thinkmart.dto.PagedResponse;
import com.thinkmart.dto.UserDTO;
import com.thinkmart.exception.GlobalExceptionHandler;
import com.thinkmart.security.*;
import com.thinkmart.service.AuthService;
import com.thinkmart.service.OrderService;
import com.thinkmart.service.ProductService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.core.env.MapPropertySource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockServletContext;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.context.support.AnnotationConfigWebApplicationContext;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import org.springframework.security.access.AccessDeniedException;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

public class SecurityFilterIntegrationTest {

    @RestController
    @RequestMapping("/api/admin")
    public static class TestAdminController {
        @GetMapping("/dashboard")
        public ResponseEntity<Map<String, String>> getDashboard() {
            return ResponseEntity.ok(Map.of("status", "ADMIN_ACCESS_GRANTED"));
        }
    }

    @Configuration
    @EnableWebMvc
    @EnableWebSecurity
    @Import({
            SecurityConfig.class,
            JwtAuthenticationFilter.class,
            JwtAuthenticationEntryPoint.class,
            CustomAccessDeniedHandler.class,
            JwtTokenProvider.class,
            AuthController.class,
            HealthController.class,
            ProductController.class,
            OrderController.class,
            TestAdminController.class,
            GlobalExceptionHandler.class
    })
    public static class TestConfig {

        @Bean
        public AuthService authService() {
            return Mockito.mock(AuthService.class);
        }

        @Bean
        public ProductService productService() {
            return Mockito.mock(ProductService.class);
        }

        @Bean
        public OrderService orderService() {
            return Mockito.mock(OrderService.class);
        }
    }

    private AnnotationConfigWebApplicationContext context;
    private MockMvc mockMvc;
    private JwtTokenProvider jwtTokenProvider;
    private AuthService authService;
    private ProductService productService;
    private OrderService orderService;

    @BeforeEach
    void setUp() {
        context = new AnnotationConfigWebApplicationContext();
        context.setServletContext(new MockServletContext());
        Map<String, Object> props = Map.of(
                "jwt.secret", "dGhpbmttYXJ0LXNlY3VyZS1qd3Qtc2VjcmV0LWtleS1mb3ItZGV2ZWxvcG1lbnQtYXVkaXQtb25seS0yMDI2",
                "jwt.expiration-ms", "86400000"
        );
        context.getEnvironment().getPropertySources().addFirst(new MapPropertySource("testProps", props));
        context.register(TestConfig.class);
        context.refresh();

        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();

        jwtTokenProvider = context.getBean(JwtTokenProvider.class);
        authService = context.getBean(AuthService.class);
        productService = context.getBean(ProductService.class);
        orderService = context.getBean(OrderService.class);
    }

    @AfterEach
    void tearDown() {
        if (context != null) {
            context.close();
        }
    }

    @Test
    @DisplayName("Public Endpoint: GET /api/health succeeds without authentication")
    void publicHealthEndpointShouldReturn200WithoutAuth() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.service").value("thinkmart-backend"));
    }

    @Test
    @DisplayName("Public Endpoint: GET /api/products succeeds without authentication")
    void publicProductsEndpointShouldReturn200WithoutAuth() throws Exception {
        PagedResponse<com.thinkmart.dto.ProductSummaryDTO> emptyPage = new PagedResponse<>(
                Collections.emptyList(), 0, 12, 0, 0, true
        );
        when(productService.getProducts(any(), any(), any(), anyInt(), anyInt())).thenReturn(emptyPage);

        mockMvc.perform(get("/api/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    @DisplayName("Protected Endpoint: GET /api/auth/me without token returns HTTP 401 Unauthorized")
    void getMeWithoutTokenShouldReturn401Unauthorized() throws Exception {
        mockMvc.perform(get("/api/auth/me")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.error").value("Unauthorized"))
                .andExpect(jsonPath("$.message").value("Full authentication is required to access this resource. Please provide a valid Bearer token."));
    }

    @Test
    @DisplayName("Protected Endpoint: GET /api/auth/me with invalid token returns HTTP 401 Unauthorized")
    void getMeWithInvalidTokenShouldReturn401Unauthorized() throws Exception {
        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer invalid-or-malformed-jwt-token")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.error").value("Unauthorized"));
    }

    @Test
    @DisplayName("Protected Endpoint: GET /api/auth/me with valid token returns HTTP 200 OK")
    void getMeWithValidTokenShouldReturn200() throws Exception {
        String token = jwtTokenProvider.generateToken("sanath@thinkmart.in", "ROLE_CUSTOMER", 1L, "Sanath Kumar");
        UserDTO userDTO = new UserDTO(1L, "sanath@thinkmart.in", "Sanath Kumar", "9876543210", "ROLE_CUSTOMER");

        when(authService.getCurrentUser("sanath@thinkmart.in")).thenReturn(userDTO);

        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("sanath@thinkmart.in"))
                .andExpect(jsonPath("$.fullName").value("Sanath Kumar"))
                .andExpect(jsonPath("$.role").value("ROLE_CUSTOMER"));
    }

    @Test
    @DisplayName("Admin Endpoint: GET /api/admin/dashboard without token returns HTTP 401 Unauthorized")
    void getAdminDashboardWithoutTokenShouldReturn401Unauthorized() throws Exception {
        mockMvc.perform(get("/api/admin/dashboard")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.error").value("Unauthorized"));
    }

    @Test
    @DisplayName("Admin Endpoint: GET /api/admin/dashboard with customer token returns HTTP 403 Forbidden")
    void getAdminDashboardWithCustomerTokenShouldReturn403Forbidden() throws Exception {
        String customerToken = jwtTokenProvider.generateToken("customer@thinkmart.in", "ROLE_CUSTOMER", 2L, "Customer User");

        mockMvc.perform(get("/api/admin/dashboard")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.error").value("Forbidden"))
                .andExpect(jsonPath("$.message").value("Access is denied. You do not have the required permissions for this resource."));
    }

    @Test
    @DisplayName("Admin Endpoint: GET /api/admin/dashboard with admin token returns HTTP 200 OK")
    void getAdminDashboardWithAdminTokenShouldReturn200Ok() throws Exception {
        String adminToken = jwtTokenProvider.generateToken("admin@thinkmart.in", "ROLE_ADMIN", 1L, "Administrator");

        mockMvc.perform(get("/api/admin/dashboard")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ADMIN_ACCESS_GRANTED"));
    }

    @Test
    @DisplayName("Protected Endpoint: GET /api/orders/my-orders returns HTTP 401 Unauthorized without token")
    void unauthenticatedOrderEndpointShouldReturn401() throws Exception {
        mockMvc.perform(get("/api/orders/my-orders")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.error").value("Unauthorized"));
    }

    @Test
    @DisplayName("CORS Preflight: Allowed development origin http://localhost:5173 is accepted with credentials")
    void corsPreflightAllowedOriginLocalhost5173() throws Exception {
        mockMvc.perform(options("/api/products")
                        .header("Origin", "http://localhost:5173")
                        .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"))
                .andExpect(header().string("Access-Control-Allow-Credentials", "true"));
    }

    @Test
    @DisplayName("CORS Preflight: Allowed development origin http://127.0.0.1:5173 is accepted with credentials")
    void corsPreflightAllowedOrigin127001() throws Exception {
        mockMvc.perform(options("/api/products")
                        .header("Origin", "http://127.0.0.1:5173")
                        .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://127.0.0.1:5173"))
                .andExpect(header().string("Access-Control-Allow-Credentials", "true"));
    }

    @Test
    @DisplayName("CORS Preflight: Untrusted origin is rejected with HTTP 403 Forbidden")
    void corsPreflightUntrustedOriginRejected() throws Exception {
        mockMvc.perform(options("/api/products")
                        .header("Origin", "http://malicious-website.com")
                        .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("CORS Security: Wildcard origin '*' is strictly disallowed when credentials are true")
    void wildcardCorsOriginShouldThrowException() {
        SecurityConfig config = new SecurityConfig(
                Mockito.mock(JwtAuthenticationFilter.class),
                Mockito.mock(JwtAuthenticationEntryPoint.class),
                Mockito.mock(CustomAccessDeniedHandler.class),
                "*"
        );
        assertThrows(
                IllegalArgumentException.class,
                config::corsConfigurationSource
        );
    }

    @Test
    @DisplayName("HTTP Order Ownership: GET /api/orders/{orderNumber} without token returns HTTP 401 Unauthorized")
    void unauthenticatedGetOrderByNumberShouldReturn401Unauthorized() throws Exception {
        mockMvc.perform(get("/api/orders/TM-20261101-CUSTB")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.error").value("Unauthorized"));
    }

    @Test
    @DisplayName("HTTP Order Ownership: Customer A accessing Customer B's order returns HTTP 403 Forbidden with zero data exposed")
    void customerA_AccessingCustomerBOrder_Returns403Forbidden_AndExposesNoDetails() throws Exception {
        String tokenA = jwtTokenProvider.generateToken("customera@thinkmart.in", "ROLE_CUSTOMER", 101L, "Customer A");

        when(orderService.getOrderByNumber("customera@thinkmart.in", "TM-20261101-CUSTB"))
                .thenThrow(new AccessDeniedException("Access denied: You do not have permission to view order TM-20261101-CUSTB"));

        mockMvc.perform(get("/api/orders/TM-20261101-CUSTB")
                        .header("Authorization", "Bearer " + tokenA)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.error").value("Forbidden"))
                .andExpect(jsonPath("$.message").value("Access is denied. You do not have the required permissions for this resource."))
                .andExpect(jsonPath("$.items").doesNotExist())
                .andExpect(jsonPath("$.totalAmount").doesNotExist())
                .andExpect(jsonPath("$.shippingAddress").doesNotExist())
                .andExpect(jsonPath("$.customerName").doesNotExist());
    }

    @Test
    @DisplayName("HTTP Order Ownership: Customer B accessing own order returns HTTP 200 OK with order details")
    void customerB_AccessingOwnOrder_Returns200Ok() throws Exception {
        String tokenB = jwtTokenProvider.generateToken("customerb@thinkmart.in", "ROLE_CUSTOMER", 102L, "Customer B");

        OrderResponseDTO dtoB = new OrderResponseDTO(
                200L, "TM-20261101-CUSTB", "Customer B", "9876543210",
                "456 Indiranagar, Bengaluru, Karnataka - 560038, India",
                new BigDecimal("124999.00"), new BigDecimal("6249.95"),
                BigDecimal.ZERO, new BigDecimal("131248.95"),
                "PROCESSING", "Simulated UPI", "PAID",
                Instant.now(), 1,
                List.of(new OrderItemDTO(1L, "thinkpad-x1", "ThinkPad X1 Carbon", "laptop.webp",
                        new BigDecimal("124999.00"), 1, new BigDecimal("124999.00")))
        );

        when(orderService.getOrderByNumber("customerb@thinkmart.in", "TM-20261101-CUSTB")).thenReturn(dtoB);

        mockMvc.perform(get("/api/orders/TM-20261101-CUSTB")
                        .header("Authorization", "Bearer " + tokenB)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderNumber").value("TM-20261101-CUSTB"))
                .andExpect(jsonPath("$.customerName").value("Customer B"))
                .andExpect(jsonPath("$.totalAmount").value(131248.95))
                .andExpect(jsonPath("$.items[0].productName").value("ThinkPad X1 Carbon"));
    }

    @Test
    @DisplayName("HTTP Order Ownership: Administrator accessing customer order returns HTTP 200 OK")
    void admin_AccessingCustomerBOrder_Returns200Ok() throws Exception {
        String adminToken = jwtTokenProvider.generateToken("admin@thinkmart.in", "ROLE_ADMIN", 1L, "Administrator");

        OrderResponseDTO dtoB = new OrderResponseDTO(
                200L, "TM-20261101-CUSTB", "Customer B", "9876543210",
                "456 Indiranagar, Bengaluru, Karnataka - 560038, India",
                new BigDecimal("124999.00"), new BigDecimal("6249.95"),
                BigDecimal.ZERO, new BigDecimal("131248.95"),
                "PROCESSING", "Simulated UPI", "PAID",
                Instant.now(), 1,
                List.of(new OrderItemDTO(1L, "thinkpad-x1", "ThinkPad X1 Carbon", "laptop.webp",
                        new BigDecimal("124999.00"), 1, new BigDecimal("124999.00")))
        );

        when(orderService.getOrderByNumber("admin@thinkmart.in", "TM-20261101-CUSTB")).thenReturn(dtoB);

        mockMvc.perform(get("/api/orders/TM-20261101-CUSTB")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderNumber").value("TM-20261101-CUSTB"))
                .andExpect(jsonPath("$.customerName").value("Customer B"));
    }
}
