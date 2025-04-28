// 页面加载时获取用户列表
document.addEventListener('DOMContentLoaded', function() {
    loadUsers();
});

// 加载用户列表
function loadUsers() {
    fetch('/api/users')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                const tbody = document.getElementById('userTableBody');
                tbody.innerHTML = '';
                data.users.forEach(user => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${user.username}</td>
                        <td>${getRoleName(user.role)}</td>
                        <td>${user.is_active ? '启用' : '禁用'}</td>
                        <td>${user.created_at}</td>
                        <td>
                            <button class="edit-btn" onclick="showEditUserDialog(${user.id})">编辑</button>
                            <button class="delete-btn" onclick="deleteUser(${user.id})">删除</button>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });
            }
        })
        .catch(error => {
            console.error('加载用户列表失败:', error);
            alert('加载用户列表失败，请刷新页面重试');
        });
}

// 获取角色显示名称
function getRoleName(role) {
    const roleNames = {
        'admin': '管理员',
        'teacher': '教师',
        'student': '学生'
    };
    return roleNames[role] || role;
}

// 显示添加用户对话框
function showAddUserDialog() {
    document.getElementById('addUserDialog').style.display = 'flex';
}

// 隐藏添加用户对话框
function hideAddUserDialog() {
    document.getElementById('addUserDialog').style.display = 'none';
    document.getElementById('addUserForm').reset();
}

// 显示编辑用户对话框
function showEditUserDialog(userId) {
    fetch(`/api/users/${userId}`)
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                const user = data.user;
                document.getElementById('editUserId').value = user.id;
                document.getElementById('editUsername').value = user.username;
                document.getElementById('editRole').value = user.role;
                document.getElementById('editIsActive').value = user.is_active;
                document.getElementById('editUserDialog').style.display = 'flex';
            }
        })
        .catch(error => {
            console.error('获取用户信息失败:', error);
            alert('获取用户信息失败，请重试');
        });
}

// 隐藏编辑用户对话框
function hideEditUserDialog() {
    document.getElementById('editUserDialog').style.display = 'none';
    document.getElementById('editUserForm').reset();
}

// 添加用户表单提交
document.getElementById('addUserForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = {
        username: document.getElementById('username').value,
        password: document.getElementById('password').value,
        role: document.getElementById('role').value
    };

    fetch('/api/users', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            alert('用户添加成功');
            hideAddUserDialog();
            loadUsers();
        } else {
            alert(data.message || '添加用户失败');
        }
    })
    .catch(error => {
        console.error('添加用户失败:', error);
        alert('添加用户失败，请重试');
    });
});

// 编辑用户表单提交
document.getElementById('editUserForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const userId = document.getElementById('editUserId').value;
    const formData = {
        username: document.getElementById('editUsername').value,
        role: document.getElementById('editRole').value,
        is_active: document.getElementById('editIsActive').value === 'true'
    };

    // 如果密码不为空，则更新密码
    const password = document.getElementById('editPassword').value;
    if (password) {
        formData.password = password;
    }

    fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            alert('用户更新成功');
            hideEditUserDialog();
            loadUsers();
        } else {
            alert(data.message || '更新用户失败');
        }
    })
    .catch(error => {
        console.error('更新用户失败:', error);
        alert('更新用户失败，请重试');
    });
});

// 删除用户
function deleteUser(userId) {
    if (confirm('确定要删除这个用户吗？')) {
        fetch(`/api/users/${userId}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert('用户删除成功');
                loadUsers();
            } else {
                alert(data.message || '删除用户失败');
            }
        })
        .catch(error => {
            console.error('删除用户失败:', error);
            alert('删除用户失败，请重试');
        });
    }
}

// 退出登录
function handleLogout() {
    // 清除本地存储的token
    localStorage.removeItem('token');
    // 跳转到登录页面
    window.location.href = '/';
} 