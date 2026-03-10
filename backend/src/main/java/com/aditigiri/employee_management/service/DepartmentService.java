package com.aditigiri.employee_management.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.aditigiri.employee_management.entity.Department;
import com.aditigiri.employee_management.repository.DepartmentRepository;

@Service
public class DepartmentService {

    @Autowired
    private DepartmentRepository departmentRepository;

    // Add single department
    public Department addDepartment(Department d) {
        return departmentRepository.save(d);
    }

    // Add multiple departments
    public List<Department> addMultipleDepartments(List<Department> departments) {
        return departmentRepository.saveAll(departments);
    }

    // Get all departments
    public List<Department> getAllDepartments() {
        return departmentRepository.findAll();
    }

    // Get department by ID
    public Department getDepartmentById(long id) {
        return departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Department not found"));
    }

    // Update department
    public Department updateDepartment(long id, Department updated) {
        Department existing = getDepartmentById(id);

        existing.setDepartmentName(updated.getDepartmentName());

        return departmentRepository.save(existing);
    }

    // Delete department
    public String deleteDepartment(long id) {
        departmentRepository.deleteById(id);
        return "Department deleted successfully.";
    }
}
