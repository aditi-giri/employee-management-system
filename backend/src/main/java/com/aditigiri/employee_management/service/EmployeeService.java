package com.aditigiri.employee_management.service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.aditigiri.employee_management.entity.Department;
import com.aditigiri.employee_management.entity.Employee;
import com.aditigiri.employee_management.entity.Role;
import com.aditigiri.employee_management.exception.BadRequestException;
import com.aditigiri.employee_management.exception.EmployeeNotFoundException;
import com.aditigiri.employee_management.exception.ForbiddenException;
import com.aditigiri.employee_management.repository.DepartmentRepository;
import com.aditigiri.employee_management.repository.EmployeeRepository;
import com.aditigiri.employee_management.repository.RoleRepository;
import com.aditigiri.employee_management.utility.JwtUtil;

@Service
public class EmployeeService {

	@Autowired
	private EmployeeRepository employeeRepository;

	@Autowired
	private DepartmentRepository departmentRepository;

	@Autowired
	private RoleRepository roleRepository;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@Autowired
	private JwtUtil jwtUtil;

	public Employee addEmployee(Employee e) {

		// 1️⃣ Check duplicate email
		if (employeeRepository.existsByEmail(e.getEmail())) {
			throw new RuntimeException("Email already exists: " + e.getEmail());
		}

		// 2️⃣ Attach department & role
		attachDepartment(e);
		attachRole(e);

		// 3️⃣ Set default fields
		e.setDateOfJoining(LocalDate.now());
		e.setStatus("ACTIVE");

		// 4️⃣ Hashing password
		e.setPassword(passwordEncoder.encode(e.getPassword()));

		// 5️⃣ Save employee
		return employeeRepository.save(e);
	}

	// ===========================================
	// 🔹 Attach Department
	// ===========================================
	private void attachDepartment(Employee e) {
		if (e.getDepartment() != null && e.getDepartment().getDepartmentId() != null) {

			Long deptId = e.getDepartment().getDepartmentId();

			Department department = departmentRepository.findById(deptId)
					.orElseThrow(() -> new RuntimeException("Department not found with id: " + deptId));

			e.setDepartment(department);
		} else {
			throw new RuntimeException("Department ID must be provided!");
		}
	}

	// ===========================================
	// 🔹 Attach Role
	// ===========================================
	private void attachRole(Employee e) {
		if (e.getRole() != null && e.getRole().getRoleId() != null) {

			Long roleId = e.getRole().getRoleId();

			Role role = roleRepository.findById(roleId)
					.orElseThrow(() -> new RuntimeException("Role not found with id: " + roleId));

			e.setRole(role);
		} else {
			throw new RuntimeException("Role ID must be provided!");
		}
	}

	public List<Employee> addMultipleEmployees(List<Employee> employees) {

		for (Employee e : employees) {

			if (employeeRepository.existsByEmail(e.getEmail())) {
				throw new RuntimeException("Duplicate email in list: " + e.getEmail());
			}

			attachDepartment(e);
			attachRole(e);

			e.setDateOfJoining(LocalDate.now());
			e.setStatus("ACTIVE");
			e.setPassword(passwordEncoder.encode(e.getPassword()));
		}

		return employeeRepository.saveAll(employees);
	}

	public List<Employee> getAllEmployees() {

		return employeeRepository.findAll();
	}

	public Employee getEmployeeById(long id) {
		Optional<Employee> employeeBox = employeeRepository.findById(id);
		Employee employee = null;
		if (employeeBox.isPresent()) {
			employee = employeeBox.get();

		} else
			throw new EmployeeNotFoundException("Employee Not Found");
		return employee;
	}

	public Map<String, Object> login(String email, String password) {

		Employee emp = employeeRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Invalid Email"));

		// Check active status
		if (!emp.getStatus().equals("ACTIVE")) {
			throw new RuntimeException("Account is inactive!");
		}

		// Validate password
		if (!passwordEncoder.matches(password, emp.getPassword())) {
			throw new RuntimeException("Invalid Password");
		}

		// Generate JWT
		String token = jwtUtil.generateToken(emp);

		Map<String, Object> map = new HashMap<>();
		map.put("token", token);
		map.put("role", emp.getRole().getRoleName());
		map.put("id", emp.getEmployeeId());

		// 🔥 ADD THIS — REQUIRED FOR ADMIN ACCESS CHECK
		map.put("deptId", emp.getDepartment().getDepartmentId());

		return map;
	}

	public Employee findByEmail(String loggedInEmail) {

		return employeeRepository.findByEmail(loggedInEmail)
				.orElseThrow(() -> new RuntimeException("Employee not found"));
	}

	// ---------- getEmployeesByDepartment ----------
	public List<Employee> getEmployeesByDepartment(Long departmentId) {

		if (!departmentRepository.existsById(departmentId)) {
			throw new EmployeeNotFoundException("Department does not exist.");
		}

		List<Employee> list = employeeRepository.findByDepartment_DepartmentId(departmentId);

		if (list.isEmpty()) {
			throw new EmployeeNotFoundException("No employees found in this department.");
		}

		return list;
	}

	// ---------- updateEmployee ----------
	public Employee updateEmployeeAsSuperAdmin(Employee existing, Employee updatedData) {

		// ❌ Email cannot be modified
		if (updatedData.getEmail() != null) {
			throw new ForbiddenException("SUPERADMIN cannot modify email.");
		}

		// ❌ Password cannot be modified
		if (updatedData.getPassword() != null) {
			throw new ForbiddenException("SUPERADMIN cannot modify password.");
		}

		// ❌ Personal details cannot be modified
		if (updatedData.getFirstName() != null || updatedData.getLastName() != null || updatedData.getPhone() != null
				|| updatedData.getAddress() != null || updatedData.getGender() != null
				|| updatedData.getProfileImage() != null) {

			throw new ForbiddenException("SUPERADMIN cannot modify personal details.");
		}

		// ✔ Allowed fields
		if (updatedData.getDesignation() != null)
			existing.setDesignation(updatedData.getDesignation());
		if (updatedData.getSalary() != null)
			existing.setSalary(updatedData.getSalary());
		if (updatedData.getStatus() != null)
			existing.setStatus(updatedData.getStatus());

		// ✔ Department
		if (updatedData.getDepartment() != null) {
			attachDepartment(updatedData);
			existing.setDepartment(updatedData.getDepartment());
		}

		// ✔ Role
		if (updatedData.getRole() != null) {
			attachRole(updatedData);
			existing.setRole(updatedData.getRole());
		}

		return employeeRepository.save(existing);
	}

	public Employee updateEmployeeAsSelf(Employee existing, Employee updatedData) {

		// Personal details allowed
		if (updatedData.getFirstName() != null)
			existing.setFirstName(updatedData.getFirstName());
		if (updatedData.getLastName() != null)
			existing.setLastName(updatedData.getLastName());
		if (updatedData.getPhone() != null)
			existing.setPhone(updatedData.getPhone());
		if (updatedData.getGender() != null)
			existing.setGender(updatedData.getGender());
		if (updatedData.getAddress() != null)
			existing.setAddress(updatedData.getAddress());
		if (updatedData.getProfileImage() != null)
			existing.setProfileImage(updatedData.getProfileImage());

		// Email cannot be changed
		if (updatedData.getEmail() != null && !updatedData.getEmail().equals(existing.getEmail())) {
			throw new ForbiddenException("Email cannot be changed once registered.");
		}

		// Password allowed
		if (updatedData.getPassword() != null) {
			existing.setPassword(passwordEncoder.encode(updatedData.getPassword()));
		}

		// BLOCK admin fields
		if (updatedData.getSalary() != null || updatedData.getDesignation() != null || updatedData.getStatus() != null
				|| updatedData.getDepartment() != null || updatedData.getRole() != null) {

			throw new ForbiddenException("You cannot update admin-controlled fields.");
		}

		return employeeRepository.save(existing);
	}

	// change password

	public void changePassword(Employee loggedIn, String currentPassword, String newPassword) {

		if (currentPassword == null || newPassword == null) {
			throw new BadRequestException("Passwords cannot be empty");
		}

		// 🔐 Verify existing password
		if (!passwordEncoder.matches(currentPassword, loggedIn.getPassword())) {
			throw new BadRequestException("Current password is incorrect");
		}

		// 🔐 Prevent same password
		if (passwordEncoder.matches(newPassword, loggedIn.getPassword())) {
			throw new BadRequestException("New password cannot be same as old password");
		}

		// 🔐 Save new password
		loggedIn.setPassword(passwordEncoder.encode(newPassword));
		employeeRepository.save(loggedIn);
	}

	// ---------- deleteEmployee (soft delete) ----------
	public String deleteEmployee(long id) {
		Employee e = employeeRepository.findById(id)
				.orElseThrow(() -> new EmployeeNotFoundException("Employee not found with id: " + id));

		if (e.getStatus().equals("INACTIVE")) {
			throw new BadRequestException("Employee already inactive.");
		}

		e.setStatus("INACTIVE");
		employeeRepository.save(e);

		return "Employee deactivated.";
	}

	// charts
	public List<Map<String, Object>> employeesByDepartment() {
		return employeeRepository.countEmployeesByDepartment().stream().map(o -> {
			Map<String, Object> map = new HashMap<>();
			map.put("name", o[0]);
			map.put("value", o[1]);
			return map;
		}).toList();
	}

	public List<Map<String, Object>> employeesByRole() {
		return employeeRepository.countEmployeesByRole().stream().map(o -> {
			Map<String, Object> map = new HashMap<>();
			map.put("name", o[0]);
			map.put("value", o[1]);
			return map;
		}).toList();
	}

	public List<Map<String, Object>> employeeStatusStats() {
		return employeeRepository.countEmployeesByStatus().stream().map(o -> {
			Map<String, Object> map = new HashMap<>();
			map.put("status", o[0]);
			map.put("count", o[1]);
			return map;
		}).toList();
	}

	public List<Map<String, Object>> employeeStatusStatsForDept(Long deptId) {
		return employeeRepository.countEmployeesByStatusForDept(deptId).stream().map(o -> {
			Map<String, Object> map = new HashMap<>();
			map.put("status", o[0]);
			map.put("count", o[1]);
			return map;
		}).toList();
	}

	public Employee getMyProfile(Employee loggedIn) {
		// SUPERADMIN → limited info
		if (loggedIn.getRole().getRoleName().equals("SUPERADMIN")) {
			Employee e = new Employee();
			e.setEmployeeId(loggedIn.getEmployeeId());
			e.setFirstName(loggedIn.getFirstName());
			e.setLastName(loggedIn.getLastName());
			e.setDesignation(loggedIn.getDesignation());
			e.setDepartment(loggedIn.getDepartment());
			e.setRole(loggedIn.getRole());
			e.setProfileImage(loggedIn.getProfileImage());
			return e;
		}

		// ADMIN + EMPLOYEE → full profile
		return loggedIn;
	}

	public String uploadProfileImage(MultipartFile file, Employee employee) {

		if (file.isEmpty()) {
			throw new RuntimeException("File is empty");
		}

		try {
			String uploadDir = "uploads/profile-images/";
			Files.createDirectories(Paths.get(uploadDir));

			String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();

			Path filePath = Paths.get(uploadDir + fileName);
			Files.write(filePath, file.getBytes());

			// Save path in DB
			employee.setProfileImage("/profile-images/" + fileName);
			employeeRepository.save(employee);

			return employee.getProfileImage();

		} catch (Exception e) {
			throw new RuntimeException("Image upload failed");
		}
	}

//
//	private Employee getLoggedInEmployee() {
//		String email = SecurityContextHolder.getContext().getAuthentication().getName();
//		return findByEmail(email);
//	}

	// ===========================================
	// 🔹 Attach Task(s) — Optional
	// ===========================================
//    private void attachTasks(Employee e) {
//        if (e.getTasks() == null) return;  // no tasks in request
//
//        for (Task task : e.getTasks()) {
//
//            if (task.getTaskId() != null) {
//                Task existingTask = taskRepository.findById(task.getTaskId())
//                        .orElseThrow(() ->
//                                new RuntimeException("Task not found with id: " + task.getTaskId()));
//
//                task = existingTask;
//            }
//
//            // attach employee to task
//            task.setAssignedTo(e);
//        }
//    }

}
