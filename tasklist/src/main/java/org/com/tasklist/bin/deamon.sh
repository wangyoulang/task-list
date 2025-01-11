#!/bin/bash

# 配置信息
APP_NAME="tasklist"
APP_JAR="tasklist-0.0.1-SNAPSHOT.jar"
APP_PATH="/opt/task-list"
JAVA_OPTS="-Xms256m -Xmx512m -XX:MetaspaceSize=128m -XX:MaxMetaspaceSize=256m"

# 日志文件
LOG_PATH="$APP_PATH/logs"
LOG_FILE="$LOG_PATH/app.log"

# 创建日志目录
mkdir -p $LOG_PATH

# 获取进程ID的函数
get_pid() {
    pid=$(ps -ef | grep $APP_JAR | grep -v grep | awk '{print $2}')
    echo $pid
}

# 启动应用
start() {
    pid=$(get_pid)
    if [ -n "$pid" ]; then
        echo "$APP_NAME is already running (pid: $pid)"
    else
        echo "Starting $APP_NAME..."
        cd $APP_PATH
        nohup java $JAVA_OPTS -jar $APP_JAR > $LOG_FILE 2>&1 &
        sleep 2
        pid=$(get_pid)
        if [ -n "$pid" ]; then
            echo "$APP_NAME started successfully (pid: $pid)"
        else
            echo "$APP_NAME failed to start"
        fi
    fi
}

# 停止应用
stop() {
    pid=$(get_pid)
    if [ -n "$pid" ]; then
        echo "Stopping $APP_NAME (pid: $pid)..."
        kill $pid
        sleep 5
        
        # 检查是否还在运行
        if [ -n "$(get_pid)" ]; then
            echo "Force killing $APP_NAME..."
            kill -9 $pid
        fi
        
        echo "$APP_NAME stopped"
    else
        echo "$APP_NAME is not running"
    fi
}

# 重启应用
restart() {
    stop
    sleep 2
    start
}

# 检查应用状态
status() {
    pid=$(get_pid)
    if [ -n "$pid" ]; then
        echo "$APP_NAME is running (pid: $pid)"
        return 0
    else
        echo "$APP_NAME is not running"
        return 1
    fi
}

# 监控进程是否存活
monitor() {
    echo "Starting monitor for $APP_NAME..."
    while true; do
        if ! status > /dev/null; then
            echo "$(date +'%Y-%m-%d %H:%M:%S') - $APP_NAME is down, restarting..."
            start
        fi
        sleep 30
    done
}

# 查看日志
viewlog() {
    tail -f $LOG_FILE
}

# 根据输入参数执行相应的操作
case "$1" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    status)
        status
        ;;
    monitor)
        monitor
        ;;
    log)
        viewlog
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|monitor|log}"
        exit 1
        ;;
esac

exit 0 