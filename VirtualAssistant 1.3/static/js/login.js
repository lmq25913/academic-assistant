// 处理登录表单提交
async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const remember = document.querySelector('input[name="remember"]').checked;
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username,
                password,
                remember
            })
        });

        const data = await response.json();
        
        if (response.ok) {
            // 登录成功
            if (remember) {
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('username', username);
                localStorage.setItem('token', data.token);
            } else {
                sessionStorage.setItem('isLoggedIn', 'true');
                sessionStorage.setItem('username', username);
                sessionStorage.setItem('token', data.token);
            }
            
            // 跳转到主页
            window.location.href = '/index';
        } else {
            // 登录失败，显示错误消息
            showError(data.message || '登录失败，请检查用户名和密码');
        }
    } catch (error) {
        showError('服务器错误，请稍后重试');
        console.error('Login error:', error);
    }
}

// 显示/隐藏密码
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const eyeIcon = document.querySelector('.eye-icon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.style.opacity = '0.7';
    } else {
        passwordInput.type = 'password';
        eyeIcon.style.opacity = '1';
    }
}

// 显示错误消息
function showError(message) {
    // 检查是否已存在错误消息元素
    let errorDiv = document.querySelector('.error-message');
    
    if (!errorDiv) {
        // 创建错误消息元素
        errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        
        // 将错误消息插入到表单之前
        const form = document.querySelector('.login-form');
        form.insertBefore(errorDiv, form.firstChild);
    }
    
    // 设置错误消息
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    // 3秒后自动隐藏错误消息
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 3000);
}

// 检查登录状态
function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') || sessionStorage.getItem('isLoggedIn');
    const currentPath = window.location.pathname;
    
    if (isLoggedIn && currentPath === '/') {
        // 如果已登录且在登录页面，重定向到主页
        window.location.href = '/index';
    } else if (!isLoggedIn && currentPath !== '/') {
        // 如果未登录且不在登录页面，重定向到登录页面
        window.location.href = '/';
    }
}

// 页面加载时检查登录状态
document.addEventListener('DOMContentLoaded', checkLoginStatus); 