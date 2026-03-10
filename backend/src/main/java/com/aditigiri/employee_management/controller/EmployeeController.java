package com.aditigiri.employee_management.controller;

import java.util.List;
import java.util.Map;

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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.aditigiri.employee_management.dto.ChangePasswordRequest;
import com.aditigiri.employee_management.entity.Employee;
import com.aditigiri.employee_management.service.EmployeeService;


@RestController
@RequestMapping("/employee")
public class EmployeeController {

	@Autowired
	private EmployeeService employeeService;
	
	
	@GetMapping("/auth/server-status")
	public String serverStatus() {
	    return "OK";
	}

	// ===============================================================
	// ADD EMPLOYEE — SUPER ADMIN & MANAGER (manager only for own dept)
	// ===============================================================
	@PostMapping("/addEmployee")
	public ResponseEntity<?> addEmployee(@RequestBody Employee newEmployee) {

		Employee loggedIn = getLoggedInEmployee();
		boolean isSuper = isSuperAdmin(loggedIn);
		boolean isManager = isManager(loggedIn);

		// EMPLOYEE cannot add
		if (!isSuper && !isManager) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only Admin or Super Admin can add employees.");
		}

		// MANAGER → only add employees of own department
		if (isManager && newEmployee.getDepartment().getDepartmentId() != loggedIn.getDepartment().getDepartmentId()) {

			return ResponseEntity.status(HttpStatus.FORBIDDEN)
					.body("Managers can add employees only in their own department.");
		}

		return ResponseEntity.ok(employeeService.addEmployee(newEmployee));
	}

	// ===============================================================
	// LOGIN
	// ===============================================================
	@PostMapping("/login")
	public ResponseEntity<?> login(@RequestBody Map<String, String> req) {
		return ResponseEntity.ok(employeeService.login(req.get("email"), req.get("password")));
	}

	// ===============================================================
	// ADD MULTIPLE EMPLOYEES — SUPER ADMIN ONLY
	// ===============================================================
	@PostMapping("/addMultipleEmployees")
	public ResponseEntity<?> addMultipleEmployees(@RequestBody List<Employee> employees) {

		Employee loggedIn = getLoggedInEmployee();

		if (!isSuperAdmin(loggedIn)) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only Super Admin can add multiple employees.");
		}

		return ResponseEntity.ok(employeeService.addMultipleEmployees(employees));
	}

	// ===============================================================
	// GET ALL EMPLOYEES — SUPER ADMIN (all), MANAGER (own dept)
	// ===============================================================
	@GetMapping("/getAllEmployees")
	public ResponseEntity<?> getAllEmployees() {

		Employee loggedIn = getLoggedInEmployee();

		if (isSuperAdmin(loggedIn)) {
			return ResponseEntity.ok(employeeService.getAllEmployees());
		}

		if (isManager(loggedIn)) {
			return ResponseEntity
					.ok(employeeService.getEmployeesByDepartment(loggedIn.getDepartment().getDepartmentId()));
		}

		return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Employees cannot access all data.");
	}

	// ===============================================================
	// GET EMPLOYEE BY ID
	// - SUPER ADMIN → any
	// - MANAGER → only within same department
	// - EMPLOYEE → only own profile
	// ===============================================================
	@GetMapping("/getEmployeeById/{id}")
	public ResponseEntity<?> getEmployeeById(@PathVariable long id) {

		Employee loggedIn = getLoggedInEmployee();
		Employee requested = employeeService.getEmployeeById(id);

		boolean isSelf = loggedIn.getEmployeeId().equals(id);

		if (isSuperAdmin(loggedIn) || isSelf) {
			return ResponseEntity.ok(requested);
		}

		if (isManager(loggedIn)
				&& loggedIn.getDepartment().getDepartmentId().equals(requested.getDepartment().getDepartmentId())) {

			return ResponseEntity.ok(requested);
		}

		return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied.");
	}

	// ===============================================================
	// UPDATE EMPLOYEE
	// SUPER ADMIN → can update others (limited changes)
	// MANAGER → only own profile
	// EMPLOYEE → only own profile
	// ===============================================================
	@PutMapping("/updateEmployee/{id}")
	public ResponseEntity<?> updateEmployee(@PathVariable long id, @RequestBody Employee updatedData) {

		Employee loggedIn = getLoggedInEmployee();
		Employee target = employeeService.getEmployeeById(id);

		boolean isSelf = loggedIn.getEmployeeId().equals(id);

		if (isSuperAdmin(loggedIn)) {
			return ResponseEntity.ok(employeeService.updateEmployeeAsSuperAdmin(target, updatedData));
		}

		if (isManager(loggedIn)) {
			if (!isSelf) {
				return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Managers can update only their own profile.");
			}
			return ResponseEntity.ok(employeeService.updateEmployeeAsSelf(target, updatedData));
		}

		if (isEmployee(loggedIn)) {
			if (!isSelf) {
				return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Employees can update only their own profile.");
			}
			return ResponseEntity.ok(employeeService.updateEmployeeAsSelf(target, updatedData));
		}

		return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Unauthorized");
	}

	// ===============================================================
	// DELETE EMPLOYEE — SUPER ADMIN ONLY (soft delete)
	// ===============================================================
	@DeleteMapping("/deleteEmployee/{id}")
	public ResponseEntity<?> deleteEmployee(@PathVariable long id) {

		Employee loggedIn = getLoggedInEmployee();

		if (!isSuperAdmin(loggedIn)) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only Super Admin can delete employees.");
		}

		return ResponseEntity.ok(employeeService.deleteEmployee(id));
	}

	// ===============================================================
	// SEARCH EMPLOYEE BY EMAIL
	// ===============================================================
	@GetMapping("/searchByEmail")
	public ResponseEntity<?> searchByEmail(@RequestParam String email) {

		Employee loggedIn = getLoggedInEmployee();
		Employee result = employeeService.findByEmail(email);

		if (isSuperAdmin(loggedIn)) {
			return ResponseEntity.ok(result);
		}

		if (isManager(loggedIn)
				&& loggedIn.getDepartment().getDepartmentId().equals(result.getDepartment().getDepartmentId())) {

			return ResponseEntity.ok(result);
		}

		return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied for this email.");
	}
	
	@GetMapping("/myProfile")
	public ResponseEntity<?> myProfile() {
	    Employee loggedIn = getLoggedInEmployee();
	    return ResponseEntity.ok(employeeService.getMyProfile(loggedIn));
	}
	
	@PostMapping("/uploadProfileImage")
	public ResponseEntity<?> uploadProfileImage(
	        @RequestParam("file") MultipartFile file) {

	    Employee emp = getLoggedInEmployee();
	    String imageUrl = employeeService.uploadProfileImage(file, emp);

	    return ResponseEntity.ok(imageUrl);
	}
	
	@PostMapping("/changePassword")
	public ResponseEntity<?> changePassword(
	        @RequestBody ChangePasswordRequest req
	) {
	    Employee loggedIn = getLoggedInEmployee();

	    employeeService.changePassword(
	            loggedIn,
	            req.getCurrentPassword(),
	            req.getNewPassword()
	    );

	    return ResponseEntity.ok("Password updated successfully");
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

	private boolean isManager(Employee e) {
		return e.getRole().getRoleName().equals("ADMIN");
	}

	private boolean isEmployee(Employee e) {
		return e.getRole().getRoleName().equals("EMPLOYEE");
	}
	
	@GetMapping("/charts/department")
	public ResponseEntity<?> employeesByDepartment() {

	    Employee loggedIn = getLoggedInEmployee();

	    if (isSuperAdmin(loggedIn)) {
	        return ResponseEntity.ok(employeeService.employeesByDepartment());
	    }

	    return ResponseEntity.status(403).body("Access denied");
	}

	@GetMapping("/charts/roles")
	public ResponseEntity<?> employeesByRole() {

	    Employee loggedIn = getLoggedInEmployee();

	    if (isSuperAdmin(loggedIn)) {
	        return ResponseEntity.ok(employeeService.employeesByRole());
	    }

	    return ResponseEntity.status(403).body("Access denied");
	}

	@GetMapping("/charts/status")
	public ResponseEntity<?> employeeStatus() {

	    Employee loggedIn = getLoggedInEmployee();

	    if (isSuperAdmin(loggedIn)) {
	        return ResponseEntity.ok(employeeService.employeeStatusStats());
	    }

	    if (isManager(loggedIn)) {
	        return ResponseEntity.ok(
	            employeeService.employeeStatusStatsForDept(
	                loggedIn.getDepartment().getDepartmentId()
	            )
	        );
	    }

	    return ResponseEntity.status(403).body("Access denied");
	}
}
