package com.aditigiri.employee_management.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.aditigiri.employee_management.entity.Role;
import com.aditigiri.employee_management.service.RoleService;

@RestController
@RequestMapping("/role")
public class RoleController {

    @Autowired
    private RoleService roleService;

    // Get all roles (SUPERADMIN ONLY)
    @GetMapping("/getAllRoles")
    public ResponseEntity<List<Role>> getAllRoles() {
        return ResponseEntity.ok(roleService.getAllRoles());
    }

    // Add a new role (SUPERADMIN ONLY, optional)
    @PostMapping("/addRole")
    public ResponseEntity<Role> addRole(@RequestBody Role role) {
        return ResponseEntity.ok(roleService.addRole(role));
    }
}
