package com.aditigiri.employee_management.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.aditigiri.employee_management.entity.Employee;
import com.aditigiri.employee_management.entity.Task;
import com.aditigiri.employee_management.exception.ForbiddenException;
import com.aditigiri.employee_management.service.EmployeeService;
import com.aditigiri.employee_management.service.TaskService;

@RestController
@RequestMapping("/task")
public class TaskController {

	@Autowired
	private TaskService taskService;

	@Autowired
	private EmployeeService employeeService;

	// ============================================================
	// ADMIN → CREATE TASK
	// ============================================================
	@PostMapping("/createTask")
	public ResponseEntity<?> createTask(@RequestBody Task task) {

		Employee loggedIn = getLoggedInEmployee();

		if (!isAdmin(loggedIn)) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only Admin can create tasks.");
		}

		return ResponseEntity.ok(taskService.createTask(task, loggedIn));
	}

	// ============================================================
	// ADMIN → UPDATE TASK
	// ============================================================
	@PutMapping("/updateTask/{taskId}")
	public ResponseEntity<?> updateTask(@PathVariable Long taskId, @RequestBody Task updated) {

		Employee loggedIn = getLoggedInEmployee();

		if (!isAdmin(loggedIn)) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only Admin can update tasks.");
		}

		return ResponseEntity.ok(taskService.updateTask(taskId, updated));
	}

	// ============================================================
	// ADMIN → DELETE TASK
	// ============================================================
	@DeleteMapping("/deleteTask/{taskId}")
	public ResponseEntity<?> deleteTask(@PathVariable Long taskId) {

		Employee loggedIn = getLoggedInEmployee();

		if (!isAdmin(loggedIn)) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only Admin can delete tasks.");
		}

		return ResponseEntity.ok(taskService.deleteTask(taskId));
	}

	
	// TaskController.java
	@GetMapping("/charts/assignedByAdmin")
	public ResponseEntity<?> tasksAssignedByAdminChart() {

	    Employee loggedIn = getLoggedInEmployee();

	    if (loggedIn.getRole().getRoleName().equals("ADMIN")) {
	        return ResponseEntity.ok(
	            taskService.taskStatusByAdmin(loggedIn.getEmployeeId())
	        );
	    }

	    return ResponseEntity.status(403).body("Access denied");
	}
	// ============================================================
	// SUPERADMIN + ADMIN → VIEW ALL TASKS
	// ============================================================
	@GetMapping("/getAllTasks")
	public ResponseEntity<?> getAllTasks() {

		Employee loggedIn = getLoggedInEmployee();

		if (!isAdmin(loggedIn) && !isSuperAdmin(loggedIn)) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not authorized to view all tasks.");
		}

		return ResponseEntity.ok(taskService.getAllTasks());
	}

	// ============================================================
	// SUPERADMIN + ADMIN → GET TASKS ASSIGNED BY ADMIN
	// ============================================================
	@GetMapping("/assignedByAdmin")
	public ResponseEntity<?> getTasksAssignedByAdmin() {

		Employee loggedIn = getLoggedInEmployee();

		if (!isAdmin(loggedIn) && !isSuperAdmin(loggedIn)) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied.");
		}

		return ResponseEntity.ok(taskService.getTasksAssignedByAdmin(loggedIn));
	}

	// ============================================================
	// EMPLOYEE → VIEW ONLY THEIR TASKS
	// ============================================================
	@GetMapping("/assignedToEmployee")
	public ResponseEntity<?> getTasksAssignedToEmployee() {

		Employee loggedIn = getLoggedInEmployee();

		if (!isEmployee(loggedIn)) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only employees can view their assigned tasks.");
		}

		return ResponseEntity.ok(taskService.getTasksAssignedTo(loggedIn));
	}

	// ============================================================
	// EMPLOYEE → UPDATE ONLY THEIR TASK STATUS
	// ============================================================

	@PatchMapping("/updateStatus/{taskId}")
	public ResponseEntity<?> updateTaskStatus(@PathVariable Long taskId, @RequestBody Map<String, String> body) {

		Employee loggedIn = getLoggedInEmployee();

		if (!isEmployee(loggedIn)) {
			throw new ForbiddenException("Only employees can update task status.");
		}

		String status = body.get("status");

		return ResponseEntity.ok(taskService.updateTaskStatus(taskId, status, loggedIn));
	}

	// ============================================================
	// Utility Methods
	// ============================================================
	private Employee getLoggedInEmployee() {
		String email = SecurityContextHolder.getContext().getAuthentication().getName();
		return employeeService.findByEmail(email);
	}

	private boolean isSuperAdmin(Employee e) {
		return e.getRole().getRoleName().equals("SUPERADMIN");
	}

	private boolean isAdmin(Employee e) {
		return e.getRole().getRoleName().equals("ADMIN");
	}

	private boolean isEmployee(Employee e) {
		return e.getRole().getRoleName().equals("EMPLOYEE");
	}
}
