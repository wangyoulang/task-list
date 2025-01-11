package org.com.tasklist.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Task {
    private Long id;
    private String title;
    private String category;
    private Integer status;
    private Integer duration;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
} 