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
@Table(name = "tasks")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long taskId;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private LocalDate assignedDate;
    private LocalDate dueDate;

    private String status;  // PENDING, IN_PROGRESS, COMPLETED

    // Employee to whom the task is assigned
    @ManyToOne
    @JoinColumn(name = "assigned_to")
    private Employee assignedTo;

    // Admin who assigned the task (also an Employee)
    @ManyToOne
    @JoinColumn(name = "assigned_by")
    private Employee assignedBy;
}