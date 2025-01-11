// 存储待办事项的数组
let todos = [];
let currentFilter = 'all';
let searchTerm = '';
let currentEditId = null;
let timers = {};

// 从后端加载数据
function loadTodos() {
    fetch('/api/tasks')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Loaded data:', data); // 添加日志
            todos = data.map(task => ({
                id: task.id,
                text: task.title,
                completed: task.status === 1,
                category: task.category,
                createdAt: task.createTime,
                timer: {
                    duration: task.duration * 60 || 1500,
                    remaining: task.duration * 60 || 1500,
                    isRunning: false
                }
            }));
            renderTodos();
        })
        .catch(error => {
            console.error('Error loading tasks:', error);
        });
}

// 添加待办事项
function addTodo() {
    const input = document.getElementById('todoInput');
    const category = document.getElementById('categorySelect');
    const text = input.value.trim();
    
    if (text) {
        const newTask = {
            title: text,
            category: category.value,
            duration: 25,
            status: 0
        };
        
        console.log('Sending task:', newTask); // 添加日志

        fetch('/api/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newTask)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Server response:', data); // 添加日志
            input.value = '';
            loadTodos();
        })
        .catch(error => {
            console.error('Error adding task:', error);
        });
    }
}

// 删除待办事项
function deleteTodo(id) {
    if (confirm('确定要删除这个任务吗？')) {
        fetch(`/api/tasks/${id}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            loadTodos();
        })
        .catch(error => {
            console.error('Error deleting task:', error);
        });
    }
}

// 切换待办事项的完成状态
function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    const newStatus = todo.completed ? 0 : 1;
    
    fetch(`/api/tasks/${id}/status`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `status=${newStatus}`
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        loadTodos();
    })
    .catch(error => {
        console.error('Error updating task status:', error);
    });
}

// 过滤待办事项
function filterTodos(filter) {
    currentFilter = filter;
    document.querySelectorAll('.filters button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`button[onclick="filterTodos('${filter}')"]`).classList.add('active');
    renderTodos();
}

// 搜索待办事项
function searchTodos(term) {
    searchTerm = term.toLowerCase();
    renderTodos();
}

// 排序待办事项
function sortTodos() {
    const sortType = document.getElementById('sortSelect').value;
    
    switch(sortType) {
        case 'date-asc':
            todos.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            break;
        case 'date-desc':
            todos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
        case 'name-asc':
            todos.sort((a, b) => a.text.localeCompare(b.text));
            break;
        case 'name-desc':
            todos.sort((a, b) => b.text.localeCompare(a.text));
            break;
    }
    renderTodos();
}

// 渲染待办事项列表
function renderTodos() {
    const todoList = document.getElementById('todoList');
    todoList.innerHTML = '';
    
    // 过滤和搜索
    let filteredTodos = todos.filter(todo => {
        const matchesFilter = 
            currentFilter === 'all' || 
            (currentFilter === 'active' && !todo.completed) ||
            (currentFilter === 'completed' && todo.completed);
            
        const matchesSearch = 
            todo.text.toLowerCase().includes(searchTerm) ||
            todo.category.toLowerCase().includes(searchTerm);
            
        return matchesFilter && matchesSearch;
    });
    
    filteredTodos.forEach(todo => {
        const div = document.createElement('div');
        div.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        
        const minutes = Math.floor(todo.timer.remaining / 60);
        const seconds = todo.timer.remaining % 60;
        const timeDisplay = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        div.innerHTML = `
            <input type="checkbox" 
                   ${todo.completed ? 'checked' : ''} 
                   onchange="toggleTodo(${todo.id})">
            <span class="category ${todo.category}">${todo.category}</span>
            <span class="text">${todo.text}</span>
            <span class="timer ${todo.timer.isRunning ? 'running' : 'paused'}">${timeDisplay}</span>
            <div class="timer-controls">
                <button onclick="${todo.timer.isRunning ? 'pauseTimer' : 'startTimer'}(${todo.id})">
                    ${todo.timer.isRunning ? '⏸' : '▶'}
                </button>
                <button onclick="resetTimer(${todo.id})">⟲</button>
            </div>
            <div class="action-buttons">
                <button class="edit-btn" onclick="openEditModal(${todo.id})">编辑</button>
                <button class="delete-btn" onclick="deleteTodo(${todo.id})">删除</button>
            </div>
        `;
        
        todoList.appendChild(div);
    });
}

// 编辑相关函数
function openEditModal(id) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    currentEditId = id;
    document.getElementById('editInput').value = todo.text;
    document.getElementById('editCategory').value = todo.category;
    document.getElementById('editTimer').value = Math.floor(todo.timer.duration / 60);
    document.getElementById('editModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('editModal').style.display = 'none';
    currentEditId = null;
}

function saveEdit() {
    if (currentEditId === null) return;

    const newText = document.getElementById('editInput').value.trim();
    const newCategory = document.getElementById('editCategory').value;
    const newDuration = document.getElementById('editTimer').value;

    if (newText) {
        const updatedTask = {
            title: newText,
            category: newCategory,
            duration: parseInt(newDuration)
        };

        fetch(`/api/tasks/${currentEditId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedTask)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            loadTodos();
            closeModal();
        })
        .catch(error => {
            console.error('Error updating task:', error);
        });
    }
}

// 计时器相关函数
function startTimer(id) {
    const todo = todos.find(t => t.id === id);
    if (!todo || todo.timer.isRunning) return;

    todo.timer.isRunning = true;
    renderTodos();

    timers[id] = setInterval(() => {
        todo.timer.remaining--;
        
        if (todo.timer.remaining <= 0) {
            clearInterval(timers[id]);
            todo.timer.isRunning = false;
            todo.timer.remaining = todo.timer.duration;
            alert(`任务 "${todo.text}" 的计时结束！`);
        }

        renderTodos();
    }, 1000);
}

function pauseTimer(id) {
    const todo = todos.find(t => t.id === id);
    if (!todo || !todo.timer.isRunning) return;

    clearInterval(timers[id]);
    todo.timer.isRunning = false;
    renderTodos();
}

function resetTimer(id) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    clearInterval(timers[id]);
    todo.timer.isRunning = false;
    todo.timer.remaining = todo.timer.duration;
    renderTodos();
}

// 在页面关闭时清理所有计时器
window.addEventListener('beforeunload', () => {
    Object.values(timers).forEach(clearInterval);
});

// 添加事件监听器
document.getElementById('todoInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addTodo();
    }
});

document.getElementById('searchInput').addEventListener('input', function(e) {
    searchTodos(e.target.value);
});

// 初始化
loadTodos(); 