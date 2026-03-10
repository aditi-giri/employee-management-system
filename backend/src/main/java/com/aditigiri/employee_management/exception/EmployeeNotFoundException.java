package com.aditigiri.employee_management.exception;

public class EmployeeNotFoundException extends RuntimeException{
	public EmployeeNotFoundException(String message)
	{
		super(message);
	}
}
