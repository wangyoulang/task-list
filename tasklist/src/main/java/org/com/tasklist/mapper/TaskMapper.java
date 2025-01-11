package org.com.tasklist.mapper;

import org.apache.ibatis.annotations.*;
import org.com.tasklist.entity.Task;
import java.util.List;

@Mapper
public interface TaskMapper {
    
    @Select("SELECT * FROM task WHERE status = #{status} ORDER BY create_time DESC")
    List<Task> findByStatus(Integer status);
    
    @Select("SELECT * FROM task ORDER BY create_time DESC")
    List<Task> findAll();
    
    @Insert("INSERT INTO task (title, category, duration, status, create_time) VALUES (#{title}, #{category}, #{duration}, #{status}, NOW())")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(Task task);
    
    @Update("UPDATE task SET title = #{title}, category = #{category}, duration = #{duration}, update_time = NOW() WHERE id = #{id}")
    int update(Task task);
    
    @Update("UPDATE task SET status = #{status}, update_time = NOW() WHERE id = #{id}")
    int updateStatus(@Param("id") Long id, @Param("status") Integer status);
    
    @Delete("DELETE FROM task WHERE id = #{id}")
    int delete(Long id);
} 