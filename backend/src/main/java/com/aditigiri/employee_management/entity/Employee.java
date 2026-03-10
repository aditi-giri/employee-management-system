package com.aditigiri.employee_management.entity;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "employees")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Employee {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long employeeId;

	@Column(nullable = false)
	private String firstName;

	@Column(nullable = false)
	private String lastName;

	@Column(nullable = false, unique = true)
	private String email;

	@Column(nullable = false)
	private String password; // Hashed
	
	@Column(nullable = false)
	private String status = "ACTIVE";

	private String phone;
	private String gender;
	private String address;

	private LocalDate dateOfJoining;

	private String designation;

	private Double salary;

	private String profileImage;

	@ManyToOne
	@JoinColumn(name = "department_id")
	private Department department;

	@ManyToOne
	@JoinColumn(name = "role_id")
	private Role role;
}