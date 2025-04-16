// 页面切换处理
document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', function() {
        // 移除其他菜单项的活跃状态
        document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
        // 添加当前点击项的活跃状态
        this.classList.add('active');
        
        // 获取目标页面ID
        const targetPage = this.dataset.page;
        
        // 隐藏所有页面
        document.querySelectorAll('.page-content').forEach(page => {
            page.style.display = 'none';
        });
        
        // 显示目标页面
        document.getElementById(targetPage).style.display = 'block';
        
        // 更新顶部标题
        document.querySelector('.navbar h2').textContent = this.textContent;
    });
});

// 编辑按钮点击处理
document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        const row = this.closest('tr');
        const username = row.cells[0].textContent;
        const role = row.cells[1].textContent;
        
        // 显示编辑对话框
        showEditDialog(username, role);
    });
});

// 删除按钮点击处理
document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        const row = this.closest('tr');
        const username = row.cells[0].textContent;
        
        if (confirm(`确定要删除用户 ${username} 吗？`)) {
            row.remove();
            showToast('删除成功');
        }
    });
});

// 显示编辑对话框
function showEditDialog(username, role) {
    const dialog = document.createElement('div');
    dialog.className = 'edit-dialog';
    dialog.innerHTML = `
        <div class="dialog-content">
            <h3>编辑用户</h3>
            <div class="form-group">
                <label>用户名</label>
                <input type="text" id="edit-username" value="${username}">
            </div>
            <div class="form-group">
                <label>角色</label>
                <select id="edit-role">
                    <option value="管理员" ${role === '管理员' ? 'selected' : ''}>管理员</option>
                    <option value="研究员" ${role === '研究员' ? 'selected' : ''}>研究员</option>
                </select>
            </div>
            <div class="dialog-buttons">
                <button class="save-btn">保存</button>
                <button class="cancel-btn">取消</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(dialog);
    
    // 点击保存按钮
    dialog.querySelector('.save-btn').addEventListener('click', () => {
        const newUsername = dialog.querySelector('#edit-username').value;
        const newRole = dialog.querySelector('#edit-role').value;
        
        // 更新表格数据
        const rows = document.querySelectorAll('.data-table tr');
        rows.forEach(row => {
            if (row.cells[0].textContent === username) {
                row.cells[0].textContent = newUsername;
                row.cells[1].textContent = newRole;
            }
        });
        
        dialog.remove();
        showToast('保存成功');
    });
    
    // 点击取消按钮
    dialog.querySelector('.cancel-btn').addEventListener('click', () => {
        dialog.remove();
    });
}

// 显示提示消息
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 2000);
}

// 初始化图表
function initCharts() {
    // 使用统计图表
    const usageCtx = document.getElementById('usageChart');
    if (usageCtx) {
        new Chart(usageCtx, {
            type: 'line',
            data: {
                labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
                datasets: [{
                    label: '系统使用量',
                    data: [65, 78, 90, 85, 85, 110],
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    tension: 0.3,
                    fill: true,
                    pointRadius: 4,
                    pointBackgroundColor: '#3498db'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: '系统使用趋势',
                        font: {
                            size: 16
                        }
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 60,
                        grid: {
                            drawBorder: false
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    // 查询类型分布图表
    const queryTypeCtx = document.getElementById('queryTypeChart');
    if (queryTypeCtx) {
        new Chart(queryTypeCtx, {
            type: 'doughnut',
            data: {
                labels: ['文献查询', '专利检索', '数据分析', '其他'],
                datasets: [{
                    data: [45, 25, 20, 10],
                    backgroundColor: ['#3498db', '#2ecc71', '#f1c40f', '#95a5a6']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    // 用户活跃度图表
    const userActivityCtx = document.getElementById('userActivityChart');
    if (userActivityCtx) {
        new Chart(userActivityCtx, {
            type: 'bar',
            data: {
                labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
                datasets: [{
                    label: '活跃用户数',
                    data: [120, 150, 180, 165, 140, 90, 85],
                    backgroundColor: '#3498db'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

// 页面加载完成后初始化图表
document.addEventListener('DOMContentLoaded', initCharts);

// 处理退出功能
function handleLogout() {
    // 清除登录状态
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('username');
    
    // 跳转到登录页面
    window.location.href = 'login.html';
} 