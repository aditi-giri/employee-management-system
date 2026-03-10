package com.aditigiri.employee_management.config;

import java.io.IOException;
import java.util.Collections;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.aditigiri.employee_management.entity.Employee;
import com.aditigiri.employee_management.repository.EmployeeRepository;
import com.aditigiri.employee_management.utility.JwtUtil;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
            throws ServletException, IOException {

        String requestURI = request.getRequestURI();
        System.out.println("\n----------------------------");
        System.out.println("🔎 Incoming Request: " + requestURI);

        String authHeader = request.getHeader("Authorization");
        String token = null;
        String email = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);

            try {
                email = jwtUtil.extractEmail(token);
                System.out.println("📌 Extracted Email From Token: " + email);

            } catch (ExpiredJwtException e) {
                System.out.println("❌ Token Expired");
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("Token expired. Please login again.");
                return;

            } catch (SignatureException | MalformedJwtException e) {
                System.out.println("❌ INVALID TOKEN: " + e.getMessage());
                chain.doFilter(request, response);
                return;

            } catch (Exception e) {
                System.out.println("❌ Token Error: " + e.getMessage());
                chain.doFilter(request, response);
                return;
            }
        } else {
            System.out.println("❌ No JWT Token Present");
        }

        // Authenticate user if email extracted & no auth set
        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            Employee emp = employeeRepository.findByEmail(email).orElse(null);

            if (emp != null) {
                String roleName = "ROLE_" + emp.getRole().getRoleName();
                System.out.println("✅ User Found: " + emp.getEmail());
                System.out.println("🎭 Role From DB: " + roleName);

                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                emp.getEmail(),
                                null,
                                Collections.singletonList(new SimpleGrantedAuthority(roleName))
                        );

                SecurityContextHolder.getContext().setAuthentication(authToken);

                System.out.println("🔐 Granted Authorities → " + authToken.getAuthorities());
            } else {
                System.out.println("❌ No Employee Found For Email In Token");
            }
        }

        System.out.println("✔ Filter Completed For: " + requestURI);
        chain.doFilter(request, response);
    }
}
