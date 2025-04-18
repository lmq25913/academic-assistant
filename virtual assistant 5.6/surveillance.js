// 获取DOM元素
const mainVideo = document.getElementById('mainVideo');
const timeStamp = document.querySelector('.time-stamp');
const alertList = document.getElementById('alertList');
const alertModal = document.getElementById('alertModal');
const currentMode = document.getElementById('currentMode');
const motionStatus = document.getElementById('motionStatus');
const workStartTime = document.getElementById('workStartTime');
const workEndTime = document.getElementById('workEndTime');

// 初始化视频流
async function initVideoStream() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: {
                width: 1280,
                height: 720,
                facingMode: 'environment'
            }
        });
        mainVideo.srcObject = stream;
    } catch (err) {
        console.error('无法访问摄像头:', err);
        showToast('无法访问摄像头，请检查权限设置', 'error');
    }
}

// 更新时间戳
function updateTimeStamp() {
    const now = new Date();
    timeStamp.textContent = now.toLocaleString('zh-CN');
}

// 检查是否在工作时间
function isWorkingHours() {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMinute] = workStartTime.value.split(':').map(Number);
    const [endHour, endMinute] = workEndTime.value.split(':').map(Number);
    
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;
    
    return currentTime >= startTime && currentTime <= endTime;
}

// 更新当前模式
function updateCurrentMode() {
    const isWorking = isWorkingHours();
    currentMode.textContent = isWorking ? '工作时间' : '非工作时间';
    currentMode.style.color = isWorking ? '#2ecc71' : '#e74c3c';
}

// 移动检测
let lastImageData = null;
const MOTION_THRESHOLD = 30;

function detectMotion(imageData1, imageData2) {
    if (!imageData1 || !imageData2) return false;
    
    const data1 = imageData1.data;
    const data2 = imageData2.data;
    let diffCount = 0;
    
    for (let i = 0; i < data1.length; i += 4) {
        const diff = Math.abs(data1[i] - data2[i]) +
                    Math.abs(data1[i+1] - data2[i+1]) +
                    Math.abs(data1[i+2] - data2[i+2]);
        if (diff > 100) diffCount++;
    }
    
    return (diffCount / (data1.length / 4)) * 100 > MOTION_THRESHOLD;
}

// 捕获当前画面
function captureFrame() {
    const canvas = document.createElement('canvas');
    canvas.width = mainVideo.videoWidth;
    canvas.height = mainVideo.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(mainVideo, 0, 0);
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

// 处理移动检测
function handleMotionDetection() {
    const currentImageData = captureFrame();
    
    if (lastImageData) {
        const motionDetected = detectMotion(lastImageData, currentImageData);
        
        if (motionDetected && !isWorkingHours()) {
            handleUnauthorizedEntry(currentImageData);
        }
    }
    
    lastImageData = currentImageData;
}

// 处理未授权进入
function handleUnauthorizedEntry(imageData) {
    // 创建画布并将图像数据转换为URL
    const canvas = document.createElement('canvas');
    canvas.width = mainVideo.videoWidth;
    canvas.height = mainVideo.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.putImageData(imageData, 0, 0);
    const imageUrl = canvas.toDataURL('image/jpeg');
    
    // 显示警报
    showAlert(imageUrl);
    
    // 添加到警报列表
    addAlertToList();
    
    // 发送通知给管理员
    sendAdminNotification(imageUrl);
}

// 显示警报弹窗
function showAlert(imageUrl) {
    const alertSnapshot = document.getElementById('alertSnapshot');
    const alertTime = document.getElementById('alertTime');
    
    alertSnapshot.src = imageUrl;
    alertTime.textContent = new Date().toLocaleString('zh-CN');
    alertModal.classList.add('active');
}

// 添加警报到列表
function addAlertToList() {
    const alertItem = document.createElement('div');
    alertItem.className = 'alert-item';
    alertItem.innerHTML = `
        <div class="alert-icon">⚠️</div>
        <div class="alert-info">
            <div class="alert-time">${new Date().toLocaleString('zh-CN')}</div>
            <div class="alert-message">检测到非工作时间进入</div>
        </div>
    `;
    alertList.insertBefore(alertItem, alertList.firstChild);
}

// 发送通知给管理员
function sendAdminNotification(imageUrl) {
    // 这里应该实现发送通知的逻辑，可以是邮件、短信或其他通知方式
    console.log('发送通知给管理员，包含图片：', imageUrl);
}

// 处理警报
function handleAlert(action) {
    console.log('处理警报:', action);
    alertModal.classList.remove('active');
    showToast(`警报已${action}`, 'info');
}

// 保存工作时间设置
function saveWorkingHours() {
    localStorage.setItem('workStartTime', workStartTime.value);
    localStorage.setItem('workEndTime', workEndTime.value);
    showToast('工作时间设置已保存', 'info');
    updateCurrentMode();
}

// 显示提示消息
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// 全屏按钮处理
document.getElementById('fullscreenBtn').addEventListener('click', () => {
    if (!document.fullscreenElement) {
        document.querySelector('.main-video-container').requestFullscreen();
    } else {
        document.exitFullscreen();
    }
});

// 截图按钮处理
document.getElementById('snapshotBtn').addEventListener('click', () => {
    const canvas = document.createElement('canvas');
    canvas.width = mainVideo.videoWidth;
    canvas.height = mainVideo.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(mainVideo, 0, 0);
    
    // 创建下载链接
    const link = document.createElement('a');
    link.download = `snapshot_${new Date().toISOString()}.jpg`;
    link.href = canvas.toDataURL('image/jpeg');
    link.click();
    
    showToast('截图已保存', 'info');
});

// 录制按钮处理
let mediaRecorder;
let recordedChunks = [];

document.getElementById('recordBtn').addEventListener('click', function() {
    if (!mediaRecorder || mediaRecorder.state === 'inactive') {
        // 开始录制
        recordedChunks = [];
        mediaRecorder = new MediaRecorder(mainVideo.srcObject);
        
        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                recordedChunks.push(e.data);
            }
        };
        
        mediaRecorder.onstop = () => {
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `recording_${new Date().toISOString()}.webm`;
            link.click();
            
            showToast('录制已保存', 'info');
        };
        
        mediaRecorder.start();
        this.textContent = '⏹ 停止录制';
        showToast('开始录制', 'info');
    } else {
        // 停止录制
        mediaRecorder.stop();
        this.textContent = '⏺ 录制';
    }
});

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    // 初始化视频流
    initVideoStream();
    
    // 加载保存的工作时间设置
    workStartTime.value = localStorage.getItem('workStartTime') || '08:00';
    workEndTime.value = localStorage.getItem('workEndTime') || '22:00';
    
    // 更新时间戳和当前模式
    setInterval(() => {
        updateTimeStamp();
        updateCurrentMode();
    }, 1000);
    
    // 启动移动检测
    setInterval(handleMotionDetection, 1000);
}); 