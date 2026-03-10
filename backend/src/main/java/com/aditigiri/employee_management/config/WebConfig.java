package com.aditigiri.employee_management.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {

            // ✅ CORS CONFIG
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry
                    .addMapping("/**")
                    .allowedOrigins("http://localhost:5173")
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                    .allowedHeaders("*")
                    .allowCredentials(true);
            }

            // ✅ STATIC IMAGE SERVING (VERY IMPORTANT)
            @Override
            public void addResourceHandlers(ResourceHandlerRegistry registry) {
                registry
                    .addResourceHandler("/profile-images/**")
                    .addResourceLocations("file:uploads/profile-images/");
            }
        };
    }
}
