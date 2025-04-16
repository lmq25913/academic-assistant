// 模拟人脸识别结果的WebSocket连接
let mockWebSocket;

// 初始化页面
document.addEventListener('DOMContentLoaded', function() {
    initializeMockWebSocket();
    initializeFilters();
    loadAttendanceData();
});

// 初始化模拟WebSocket连接
function initializeMockWebSocket() {
    // 模拟WebSocket连接
    mockWebSocket = {
        // 模拟数据
        mockData: [
            { name: '张三', id: '001', time: '09:15', status: 'success', recognition: '识别成功' },
            { name: '李四', id: '002', time: '09:30', status: 'success', recognition: '识别成功' },
            { name: '王五', id: '003', time: '', status: 'pending', recognition: '未识别' }
        ],
        
        // 模拟接收消息
        onmessage: null,
        
        // 模拟发送识别结果
        simulateRecognition: function() {
            const names = ['张三', '李四', '王五', '赵六', '钱七'];
            const randomName = names[Math.floor(Math.random() * names.length)];
            const success = Math.random() > 0.2; // 80%的识别成功率
            
            const recognition = {
                name: randomName,
                id: Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
                time: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
                status: success ? 'success' : 'pending',
                recognition: success ? '识别成功' : '识别失败'
            };
            
            if (this.onmessage) {
                this.onmessage({ data: JSON.stringify(recognition) });
            }
        }
    };
    
    // 设置消息处理函数
    mockWebSocket.onmessage = function(event) {
        const data = JSON.parse(event.data);
        showRecognitionAlert(data);
        updateAttendanceList(data);
        updateAttendanceStats();
    };
    
    // 模拟定期发送识别结果
    setInterval(() => {
        if (Math.random() > 0.7) { // 30%的概率触发识别
            mockWebSocket.simulateRecognition();
        }
    }, 5000); // 每5秒检查一次
}

// 显示识别提醒
function showRecognitionAlert(data) {
    const alertDiv = document.getElementById('attendanceAlert');
    alertDiv.className = `attendance-alert ${data.status}`;
    alertDiv.textContent = `${data.time} - ${data.name}（工号：${data.id}）${data.recognition}`;
    alertDiv.style.display = 'block';
    
    // 3秒后隐藏提醒
    setTimeout(() => {
        alertDiv.style.display = 'none';
    }, 3000);
}

// 更新签到列表
function updateAttendanceList(data) {
    const tbody = document.getElementById('attendanceList');
    const row = document.createElement('tr');
    
    row.innerHTML = `
        <td>${data.name}</td>
        <td>${data.id}</td>
        <td>${data.time || '-'}</td>
        <td><span class="attendance-status ${data.status}">${data.status === 'success' ? '已签到' : '未签到'}</span></td>
        <td><span class="recognition-result ${data.status}">${data.recognition}</span></td>
    `;
    
    tbody.insertBefore(row, tbody.firstChild);
}

// 更新签到统计
function updateAttendanceStats() {
    const rows = document.getElementById('attendanceList').getElementsByTagName('tr');
    let total = rows.length;
    let success = 0;
    
    for (let row of rows) {
        if (row.querySelector('.attendance-status.success')) {
            success++;
        }
    }
    
    const stats = document.querySelector('.attendance-stats');
    stats.children[0].querySelector('.stat-number').textContent = total;
    stats.children[1].querySelector('.stat-number').textContent = success;
    stats.children[2].querySelector('.stat-number').textContent = total - success;
    stats.children[3].querySelector('.stat-number').textContent = 
        total > 0 ? Math.round((success / total) * 100) + '%' : '0%';
}

// 初始化筛选器
function initializeFilters() {
    // 设置日期筛选器默认值为今天
    document.getElementById('dateFilter').valueAsDate = new Date();
    
    // 添加筛选器事件监听
    document.getElementById('dateFilter').addEventListener('change', filterAttendance);
    document.getElementById('statusFilter').addEventListener('change', filterAttendance);
}

// 筛选签到记录
function filterAttendance() {
    const date = document.getElementById('dateFilter').value;
    const status = document.getElementById('statusFilter').value;
    const rows = document.getElementById('attendanceList').getElementsByTagName('tr');
    
    for (let row of rows) {
        let showRow = true;
        
        if (status !== 'all') {
            const rowStatus = row.querySelector('.attendance-status').classList.contains('success') ? 'success' : 'pending';
            if (rowStatus !== status) {
                showRow = false;
            }
        }
        
        row.style.display = showRow ? '' : 'none';
    }
}

// 加载初始签到数据
function loadAttendanceData() {
    mockWebSocket.mockData.forEach(data => {
        updateAttendanceList(data);
    });
    updateAttendanceStats();
} 