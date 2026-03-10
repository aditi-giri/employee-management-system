package com.aditigiri.employee_management.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtFilter jwtFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
            .cors(cors -> {})
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth

                /* ===============================
                   PUBLIC ENDPOINT
                =============================== */
                .requestMatchers("/employee/login").permitAll()

                /* ===============================
                   ADMIN + SUPERADMIN ACCESS
                =============================== */
                .requestMatchers("/employee/addEmployee").hasAnyAuthority("ROLE_ADMIN", "ROLE_SUPERADMIN")
                .requestMatchers("/employee/getAllEmployees").hasAnyAuthority("ROLE_ADMIN", "ROLE_SUPERADMIN")
                .requestMatchers("/employee/searchByEmail").hasAnyAuthority("ROLE_ADMIN", "ROLE_SUPERADMIN")
                .requestMatchers("/role/getAllRoles").hasAnyAuthority("ROLE_ADMIN", "ROLE_SUPERADMIN")
                .requestMatchers("/department/getAllDepartments").hasAnyAuthority("ROLE_ADMIN", "ROLE_SUPERADMIN")
                .requestMatchers("/department/getDepartment/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_SUPERADMIN")
                .requestMatchers("/employee/charts/**")
                .hasAnyAuthority("ROLE_ADMIN", "ROLE_SUPERADMIN")
                .requestMatchers("/task/charts/assignedByAdmin")
                .hasAuthority("ROLE_ADMIN")

                /* ===============================
                   SUPERADMIN ONLY
                =============================== */
                .requestMatchers("/employee/addMultipleEmployees").hasAuthority("ROLE_SUPERADMIN")
                .requestMatchers("/employee/deleteEmployee/**").hasAuthority("ROLE_SUPERADMIN")
                .requestMatchers("/employee/department/**").hasAnyAuthority("ROLE_ADMIN","ROLE_SUPERADMIN")

                .requestMatchers("/role/addRole").hasAuthority("ROLE_SUPERADMIN")
                .requestMatchers("/department/addDepartment").hasAuthority("ROLE_SUPERADMIN")
                .requestMatchers("/department/updateDepartment/**").hasAuthority("ROLE_SUPERADMIN")
                .requestMatchers("/department/deleteDepartment/**").hasAuthority("ROLE_SUPERADMIN")
                

                /* ===============================
                   AUTHENTICATED USERS (ANY ROLE)
                =============================== */
                .requestMatchers("/employee/getEmployeeById/**").authenticated()
                .requestMatchers("/employee/updateEmployee/**").authenticated()
                .requestMatchers("/employee/myProfile").authenticated()
                .requestMatchers("/employee/uploadProfileImage").authenticated()

                .requestMatchers("/profile-images/**").permitAll()


                /* ===============================
                   TASK MODULE
                =============================== */

                // ADMIN (and SUPERADMIN) can manage tasks
                .requestMatchers("/task/createTask").hasAnyAuthority("ROLE_ADMIN", "ROLE_SUPERADMIN")
                .requestMatchers("/task/updateTask/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_SUPERADMIN")
                .requestMatchers("/task/deleteTask/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_SUPERADMIN")
                

                // ADMIN + SUPERADMIN can view all tasks
                .requestMatchers("/task/getAllTasks").hasAnyAuthority("ROLE_ADMIN", "ROLE_SUPERADMIN")
                .requestMatchers("/task/assignedByAdmin").hasAnyAuthority("ROLE_ADMIN", "ROLE_SUPERADMIN")

                // EMPLOYEE-only routes
                .requestMatchers("/task/assignedToEmployee").hasAuthority("ROLE_EMPLOYEE")
                .requestMatchers("/task/updateStatus/**").hasAuthority("ROLE_EMPLOYEE")

                /* ===============================
                   ALL OTHER REQUESTS REQUIRE AUTH
                =============================== */
                .anyRequest().authenticated()
            );

        http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
