package com.thinkmart.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * HealthController provides a lightweight public endpoint to verify
 * service availability and deployment liveness without authentication.
 */
@RestController
@RequestMapping("/api/health")
public class HealthController {

    @GetMapping
    public ResponseEntity<Map<String, Object>> getHealth() {
        Map<String, Object> health = new LinkedHashMap<>();
        health.put("status", "UP");
        health.put("service", "thinkmart-backend");
        health.put("version", "1.0.0");
        health.put("timestamp", Instant.now().toString());
        return ResponseEntity.ok(health);
    }
}

