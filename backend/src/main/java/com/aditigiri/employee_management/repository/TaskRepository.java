package com.aditigiri.employee_management.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.aditigiri.employee_management.entity.Employee;
import com.aditigiri.employee_management.entity.Task;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long>{

	List<Task> findByAssignedTo(Employee assignedTo);

    List<Task> findByAssignedBy(Employee assignedBy);
    
 // TaskRepository.java
    @Query("""
        SELECT t.status, COUNT(t)
        FROM Task t
        WHERE t.assignedBy.employeeId = :adminId
        GROUP BY t.status
    """)
    List<Object[]> countTasksByStatusAssignedByAdmin(Long adminId);
}
