package com.aditigiri.employee_management.utility;

import java.security.Key;
import java.util.Date;

import org.springframework.stereotype.Component;

import com.aditigiri.employee_management.entity.Employee;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtUtil {

    // SECRET must be at least 32 chars for HS256
    private static final String SECRET = "MY_SECRET_KEY_123_MY_SECRET_KEY_123";
    private final long EXPIRATION = 7 * 24 * 60 * 60 * 1000;

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET.getBytes());
    }

    public String generateToken(Employee employee) {
        return Jwts.builder()
                .setSubject(employee.getEmail())
                .claim("role", employee.getRole().getRoleName())
                .claim("id", employee.getEmployeeId())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION)) // 24 hrs
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)  // ✅ new non-deprecated method
                .compact();
    }

    public String extractEmail(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())  // ✅ new parser builder
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }
}
