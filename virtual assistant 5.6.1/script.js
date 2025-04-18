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
                    <option value="教师" ${role === '教师' ? 'selected' : ''}>教师</option>
                    <option value="学生" ${role === '学生' ? 'selected' : ''}>学生</option>
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

// 显示添加用户对话框
function showAddUserDialog() {
    const dialog = document.getElementById('addUserDialog');
    dialog.classList.add('active');
}

// 隐藏添加用户对话框
function hideAddUserDialog() {
    const dialog = document.getElementById('addUserDialog');
    dialog.classList.remove('active');
}

// 处理添加用户表单提交
document.getElementById('addUserForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // 获取表单数据
    const formData = {
        username: document.getElementById('username').value,
        password: document.getElementById('password').value,
        role: document.getElementById('role').value
    };

    // 检查是否是管理员
    const isAdmin = document.querySelector('.user-profile span').textContent === '管理员';
    
    if (!isAdmin) {
        alert('只有管理员可以添加用户！');
        return;
    }

    // TODO: 发送数据到服务器
    console.log('添加用户:', formData);

    // 添加用户到表格（这里只是演示，实际应该等待服务器响应）
    const tbody = document.querySelector('.data-table tbody');
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>${formData.username}</td>
        <td>${formData.role}</td>
        <td>${new Date().toLocaleDateString()}</td>
        <td>
            <button class="edit-btn">编辑</button>
            <button class="delete-btn">删除</button>
        </td>
    `;
    tbody.appendChild(tr);

    // 显示成功提示
    showToast('用户添加成功！', 'info');

    // 重置表单并关闭对话框
    e.target.reset();
    hideAddUserDialog();
});

// 显示提示消息
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    // 将提示消息添加到反馈表单容器中
    const feedbackForm = document.querySelector('.feedback-form');
    if (feedbackForm) {
        feedbackForm.appendChild(toast);
    } else {
        document.body.appendChild(toast);
    }

    // 3秒后自动消失
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// 处理退出登录
function handleLogout() {
    if (confirm('确定要退出登录吗？')) {
        window.location.href = 'login.html';
    }
}

// 更新统计数据
function updateStats() {
    const stats = {
        totalUsers: 156,
        activeUsers: 89,
        totalQueries: 1205,
        avgResponseTime: '2.3s'
    };
    
    Object.keys(stats).forEach(key => {
        const element = document.getElementById(key);
        if (element) {
            element.textContent = stats[key];
        }
    });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 为所有功能卡片添加点击事件
    document.querySelectorAll('.feature-card').forEach(card => {
        card.addEventListener('click', function() {
            const href = this.getAttribute('onclick').match(/'([^']+)'/)[1];
            window.location.href = href;
        });
    });

    // 每5分钟更新一次统计数据
    setInterval(updateStats, 300000);
});

// 温度监控页面功能
function initTemperatureChart() {
    const ctx = document.getElementById('temperatureChart');
    if (ctx) {
        // 获取最近7天的日期
        const dates = Array.from({length: 7}, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - i);
            return date.toLocaleDateString('zh-CN', {month: 'short', day: 'numeric'});
        }).reverse();

        // 模拟数据 - 实际使用时应从后端获取
        const maxTemps = [28, 29, 27, 30, 26, 28, 27];
        const minTemps = [20, 19, 18, 21, 17, 19, 18];

        const temperatureChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [
                    {
                        label: '最高温',
                        data: maxTemps,
                        borderColor: 'rgb(255, 99, 132)',
                        tension: 0.1
                    },
                    {
                        label: '最低温',
                        data: minTemps,
                        borderColor: 'rgb(54, 162, 235)',
                        tension: 0.1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 2,
                scales: {
                    y: {
                        min: -10,
                        max: 40,
                        ticks: {
                            callback: function(value) {
                                return value + '°C';
                            }
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: '近7天温度变化趋势',
                        font: {
                            size: 40,
                            weight: 'bold'
                        },
                        padding: {
                            top: 10,
                            bottom: 20
                        }
                    }
                }
            }
        });
    }
}

// 更新温度提示
function updateTemperatureTips(currentTemp) {
    const tipsContainer = document.getElementById('tempTipsContainer');
    if (!tipsContainer) return;

    let tips = '';

    if (currentTemp >= 28) {
        tips += `
            <div class="tip-item warm">
                <div class="tip-title">温度偏高提醒 🌡️</div>
                <div class="tip-content">
                    • 当前温度较高，建议穿着轻便衣物
                    • 可以穿短袖、薄外套
                    • 注意多补充水分
                    • 如果感觉不适，可以调整空调温度
                </div>
            </div>
        `;
    } else if (currentTemp <= 20) {
        tips += `
            <div class="tip-item cold">
                <div class="tip-title">温度偏低提醒 ❄️</div>
                <div class="tip-content">
                    • 当前温度较低，建议多穿些衣物
                    • 可以准备一件外套
                    • 注意保暖，特别是早晚温差大
                    • 如果感觉寒冷，可以调整空调温度
                </div>
            </div>
        `;
    } else {
        tips += `
            <div class="tip-item comfort">
                <div class="tip-title">温度舒适提醒 ☀️</div>
                <div class="tip-content">
                    • 当前温度适宜，可以正常穿着
                    • 建议准备一件薄外套，以防温度变化
                    • 实验室环境舒适，适合工作学习
                </div>
            </div>
        `;
    }

    // 添加实时更新时间
    const updateTime = new Date().toLocaleTimeString('zh-CN');
    tips += `
        <div style="margin-top: 20px; font-size: 0.8em; color: #666;">
            最后更新时间：${updateTime}
        </div>
    `;

    tipsContainer.innerHTML = tips;
}

// 初始化温度监控页面
document.addEventListener('DOMContentLoaded', function() {
    initTemperatureChart();
    
    // 初始化温度提示
    const currentTemp = document.getElementById('currentTemp');
    if (currentTemp) {
        const temp = parseFloat(currentTemp.textContent);
        updateTemperatureTips(temp);
    }

    // 每分钟更新温度提示
    setInterval(() => {
        const currentTemp = document.getElementById('currentTemp');
        if (currentTemp) {
            const temp = parseFloat(currentTemp.textContent);
            updateTemperatureTips(temp);
        }
    }, 60000);
});

// 提交建议功能
async function submitFeedback() {
    const feedbackText = document.getElementById('feedbackText').value.trim();
    const adminEmail = 'admin@example.com'; // 管理员邮箱地址

    if (!feedbackText) {
        showToast('请输入您的建议', 'warning');
        return;
    }

    try {
        // 这里可以添加实际的后端API调用
        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 发送邮件通知（这里需要后端支持）
        const emailData = {
            to: adminEmail,
            subject: '新的用户建议',
            content: feedbackText
        };
        
        // 清空输入框
        document.getElementById('feedbackText').value = '';
        
        // 显示成功提示
        showToast('感谢您的建议，我们会认真考虑！', 'success');
        
    } catch (error) {
        showToast('提交失败，请稍后重试', 'error');
        console.error('Error submitting feedback:', error);
    }
} 