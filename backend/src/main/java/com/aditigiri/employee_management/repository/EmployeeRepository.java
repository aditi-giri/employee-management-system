package com.aditigiri.employee_management.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.aditigiri.employee_management.entity.Employee;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
	Optional<Employee> findByEmail(String email);
	
	boolean existsByEmail(String email);
	
	List<Employee> findByDepartment_DepartmentId(Long departmentId);
	
	//chart queries
		@Query("""
			    SELECT d.departmentName, COUNT(e)
			    FROM Employee e
			    JOIN e.department d
			    GROUP BY d.departmentName
			""")
			List<Object[]> countEmployeesByDepartment();

			@Query("""
			    SELECT r.roleName, COUNT(e)
			    FROM Employee e
			    JOIN e.role r
			    GROUP BY r.roleName
			""")
			List<Object[]> countEmployeesByRole();

			@Query("""
			    SELECT e.status, COUNT(e)
			    FROM Employee e
			    GROUP BY e.status
			""")
			List<Object[]> countEmployeesByStatus();

			@Query("""
			    SELECT e.status, COUNT(e)
			    FROM Employee e
			    WHERE e.department.departmentId = :deptId
			    GROUP BY e.status
			""")
			List<Object[]> countEmployeesByStatusForDept(Long deptId);
}
