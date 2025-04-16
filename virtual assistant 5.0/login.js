// 处理登录表单提交
function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const remember = document.querySelector('input[name="remember"]').checked;
    
    // 这里应该添加实际的登录验证逻辑
    if (username === 'admin' && password === 'admin123') {
        // 如果选择了"记住我"，保存登录状态
        if (remember) {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('username', username);
        } else {
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('username', username);
        }
        
        // 登录成功，跳转到主页
        window.location.href = 'index.html';
    } else {
        // 登录失败，显示错误消息
        showError('用户名或密码错误');
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
    
    if (isLoggedIn) {
        // 如果已登录，重定向到主页
        window.location.href = 'index.html';
    }
}

// 页面加载时检查登录状态
document.addEventListener('DOMContentLoaded', checkLoginStatus); 