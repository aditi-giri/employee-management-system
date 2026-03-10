package com.aditigiri.employee_management.service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.aditigiri.employee_management.entity.Employee;
import com.aditigiri.employee_management.entity.Task;
import com.aditigiri.employee_management.exception.BadRequestException;
import com.aditigiri.employee_management.exception.ForbiddenException;
import com.aditigiri.employee_management.exception.ResourceNotFoundException;
import com.aditigiri.employee_management.repository.TaskRepository;

@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private EmployeeService employeeService;

    // ==========================================
    // ADMIN: CREATE TASK
    // ==========================================
    public Task createTask(Task task, Employee admin) {

        if (task.getTitle() == null || task.getTitle().isBlank())
            throw new BadRequestException("Task title cannot be empty.");

        if (task.getAssignedTo() == null || task.getAssignedTo().getEmployeeId() == null)
            throw new BadRequestException("Assigned employee ID is required.");

        Employee assignedTo = employeeService.getEmployeeById(
                task.getAssignedTo().getEmployeeId()
        );

        task.setAssignedTo(assignedTo);
        task.setAssignedBy(admin);
        task.setAssignedDate(LocalDate.now());
        task.setStatus("PENDING");

        return taskRepository.save(task);
    }

    // ==========================================
    // ADMIN: UPDATE TASK
    // ==========================================
    public Task updateTask(Long taskId, Task updatedTask) {

        Task existing = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found."));

        if (updatedTask.getTitle() != null)
            existing.setTitle(updatedTask.getTitle());

        if (updatedTask.getDescription() != null)
            existing.setDescription(updatedTask.getDescription());

        if (updatedTask.getDueDate() != null)
            existing.setDueDate(updatedTask.getDueDate());

        if (updatedTask.getAssignedTo() != null &&
            updatedTask.getAssignedTo().getEmployeeId() != null) {

            Employee assignedTo = employeeService.getEmployeeById(
                    updatedTask.getAssignedTo().getEmployeeId()
            );
            existing.setAssignedTo(assignedTo);
        }

        return taskRepository.save(existing);
    }

    // ==========================================
    // ADMIN: DELETE TASK
    // ==========================================
    public String deleteTask(Long taskId) {
        if (!taskRepository.existsById(taskId))
            throw new ResourceNotFoundException("Task not found.");

        taskRepository.deleteById(taskId);
        return "Task deleted successfully.";
    }

    // ==========================================
    // READ OPERATIONS
    // ==========================================
    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    public List<Task> getTasksAssignedByAdmin(Employee admin) {
        return taskRepository.findByAssignedBy(admin);
    }

    public List<Task> getTasksAssignedTo(Employee employee) {
        return taskRepository.findByAssignedTo(employee);
    }

    // ==========================================
    // EMPLOYEE: UPDATE STATUS ONLY
    // ==========================================
    public Task updateTaskStatus(Long taskId, String status, Employee employee) {

        if (status == null || status.isBlank())
            throw new BadRequestException("Status cannot be empty.");

        // Only allowed statuses
        if (!status.equals("PENDING") &&
            !status.equals("IN_PROGRESS") &&
            !status.equals("COMPLETED")) {
            throw new BadRequestException("Invalid status. Allowed: PENDING, IN_PROGRESS, COMPLETED.");
        }

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found."));

        // ensure employee owns the task
        if (!task.getAssignedTo().getEmployeeId().equals(employee.getEmployeeId())) {
            throw new ForbiddenException("You can update only your own tasks.");
        }

        // employee updates ONLY status
        task.setStatus(status);

        return taskRepository.save(task);
    }
    
 // TaskService.java
    public List<Map<String, Object>> taskStatusByAdmin(Long adminId) {
        return taskRepository.countTasksByStatusAssignedByAdmin(adminId)
            .stream()
            .map(o -> {
                Map<String, Object> map = new HashMap<>();
                map.put("status", o[0]);
                map.put("count", o[1]);
                return map;
            }).toList();
    }
}
