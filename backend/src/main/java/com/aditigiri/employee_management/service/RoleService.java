package com.aditigiri.employee_management.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.aditigiri.employee_management.entity.Role;
import com.aditigiri.employee_management.repository.RoleRepository;

@Service
public class RoleService {

    @Autowired
    private RoleRepository roleRepository;

    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    public Role addRole(Role role) {
        return roleRepository.save(role);
    }
}
