package com.aditigiri.employee_management.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.aditigiri.employee_management.entity.Department;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long>{

}
