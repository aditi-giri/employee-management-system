package com.aditigiri.employee_management.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.aditigiri.employee_management.entity.Department;
import com.aditigiri.employee_management.entity.Employee;
import com.aditigiri.employee_management.service.DepartmentService;
import com.aditigiri.employee_management.service.EmployeeService;

@RestController
@RequestMapping("/department")
public class DepartmentController {

	@Autowired
	private DepartmentService departmentService;

	@Autowired
	private EmployeeService employeeService;

	// ===============================================================
	// ADD DEPARTMENT — SUPER ADMIN ONLY
	// ===============================================================
	@PostMapping("/addDepartment")
	public ResponseEntity<?> addDepartment(@RequestBody Department d) {

		if (!isSuperAdmin(getLoggedInEmployee())) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only Super Admin can add a department.");
		}

		return ResponseEntity.ok(departmentService.addDepartment(d));
	}

	// ===============================================================
	// ADD MULTIPLE DEPARTMENTS — SUPER ADMIN ONLY
	// ===============================================================
	@PostMapping("/addMultipleDepartments")
	public ResponseEntity<?> addMultipleDepartments(@RequestBody List<Department> departments) {

		if (!isSuperAdmin(getLoggedInEmployee())) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only Super Admin can add multiple departments.");
		}

		return ResponseEntity.ok(departmentService.addMultipleDepartments(departments));
	}

	// ===============================================================
	// GET ALL DEPARTMENTS — SUPER ADMIN ONLY
	// ===============================================================
	// ===============================================================
	// GET ALL DEPARTMENTS — ADMIN & SUPER ADMIN
	// ===============================================================
	@GetMapping("/getAllDepartments")
	public ResponseEntity<?> getAllDepartments() {

		Employee loggedIn = getLoggedInEmployee();
		String role = loggedIn.getRole().getRoleName();

		if (!role.equals("SUPERADMIN") && !role.equals("ADMIN")) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied.");
		}

		return ResponseEntity.ok(departmentService.getAllDepartments());
	}

	// ===============================================================
	// GET DEPARTMENT BY ID — SUPER ADMIN ONLY
	// ===============================================================
	@GetMapping("/getDepartment/{id}")
	public ResponseEntity<?> getDepartmentById(@PathVariable long id) {

		if (!isSuperAdmin(getLoggedInEmployee())) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only Super Admin can view department details.");
		}

		return ResponseEntity.ok(departmentService.getDepartmentById(id));
	}

	// ===============================================================
	// UPDATE DEPARTMENT — SUPER ADMIN ONLY
	// ===============================================================
	@PutMapping("/updateDepartment/{id}")
	public ResponseEntity<?> updateDepartment(@PathVariable long id, @RequestBody Department updated) {

		if (!isSuperAdmin(getLoggedInEmployee())) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only Super Admin can update a department.");
		}

		return ResponseEntity.ok(departmentService.updateDepartment(id, updated));
	}

	// ===============================================================
	// DELETE DEPARTMENT — SUPER ADMIN ONLY
	// ===============================================================
	@DeleteMapping("/deleteDepartment/{id}")
	public ResponseEntity<?> deleteDepartment(@PathVariable long id) {

		if (!isSuperAdmin(getLoggedInEmployee())) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only Super Admin can delete a department.");
		}

		return ResponseEntity.ok(departmentService.deleteDepartment(id));
	}

	// ===============================================================
	// GET EMPLOYEES BY DEPARTMENT — SUPER ADMIN ONLY
	// ===============================================================
	@GetMapping("/employees/{deptId}")
	public ResponseEntity<?> getEmployeesByDepartment(@PathVariable long deptId) {

		if (!isSuperAdmin(getLoggedInEmployee())) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN)
					.body("Only Super Admin can access employees by department.");
		}

		return ResponseEntity.ok(employeeService.getEmployeesByDepartment(deptId));
	}

	// ===============================================================
	// UTILITY METHODS
	// ===============================================================
	private Employee getLoggedInEmployee() {
		String email = SecurityContextHolder.getContext().getAuthentication().getName();
		return employeeService.findByEmail(email);
	}

	private boolean isSuperAdmin(Employee e) {
		return e.getRole().getRoleName().equals("SUPERADMIN");
	}
}
