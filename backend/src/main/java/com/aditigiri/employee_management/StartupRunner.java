package com.aditigiri.employee_management;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.aditigiri.employee_management.entity.Employee;
import com.aditigiri.employee_management.repository.EmployeeRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.List;

@Component
public class StartupRunner implements CommandLineRunner {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private BCryptPasswordEncoder encoder;

    @Override
    public void run(String... args) throws Exception {

        System.out.println("---- Encoding all existing plain-text passwords ----");

        List<Employee> employees = employeeRepository.findAll();

        for (Employee emp : employees) {
            String pass = emp.getPassword();

            // encode ONLY if password is not already BCrypt
            if (!pass.startsWith("$2a$")) {
                emp.setPassword(encoder.encode(pass));
                employeeRepository.save(emp);
                System.out.println("Updated password for: " + emp.getEmail());
            }
        }

        System.out.println("---- Password update complete ----");
    }
}
