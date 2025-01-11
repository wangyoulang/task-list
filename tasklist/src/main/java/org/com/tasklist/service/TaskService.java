package org.com.tasklist.service;

import org.com.tasklist.entity.Task;
import java.util.List;

public interface TaskService {
    List<Task> findByStatus(Integer status);
    List<Task> findAll();
    Task addTask(Task task);
    Task updateTask(Task task);
    boolean updateTaskStatus(Long id, Integer status);
    boolean deleteTask(Long id);
} 