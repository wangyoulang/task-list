CREATE TABLE IF NOT EXISTS `task` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL COMMENT '任务标题',
  `category` varchar(50) NOT NULL COMMENT '任务类别',
  `status` tinyint(4) NOT NULL DEFAULT '0' COMMENT '状态：0-未完成，1-已完成',
  `duration` int(11) DEFAULT NULL COMMENT '预计时长（分钟）',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='任务表'; 