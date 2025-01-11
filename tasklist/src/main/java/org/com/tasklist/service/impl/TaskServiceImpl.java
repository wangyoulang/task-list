package org.com.tasklist.service.impl;

import org.com.tasklist.entity.Task;
import org.com.tasklist.mapper.TaskMapper;
import org.com.tasklist.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TaskServiceImpl implements TaskService {

    @Autowired
    private TaskMapper taskMapper;

    @Override
    public List<Task> findByStatus(Integer status) {
        return taskMapper.findByStatus(status);
    }

    @Override
    public List<Task> findAll() {
        return taskMapper.findAll();
    }

    @Override
    public Task addTask(Task task) {
        taskMapper.insert(task);
        return task;
    }

    @Override
    public Task updateTask(Task task) {
        taskMapper.update(task);
        return task;
    }

    @Override
    public boolean updateTaskStatus(Long id, Integer status) {
        return taskMapper.updateStatus(id, status) > 0;
    }

    @Override
    public boolean deleteTask(Long id) {
        return taskMapper.delete(id) > 0;
    }
} 