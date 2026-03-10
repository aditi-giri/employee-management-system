package com.aditigiri.employee_management.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.aditigiri.employee_management.entity.Role;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long>{
	Role findByRoleName(String roleName);
}
