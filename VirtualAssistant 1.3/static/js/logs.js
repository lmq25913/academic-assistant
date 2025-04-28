// 存储所有日志记录
let logRecords = [
    { time: '2025-04-16 10:30:15', level: 'info', content: '系统正常运行中' },
    { time: '2025-04-16 10:28:30', level: 'warning', content: '服务器负载较高' },
    { time: '2025-04-16 10:25:45', level: 'error', content: '数据库连接超时' },
    { time: '2025-04-16 10:20:15', level: 'info', content: '新用户注册：student001' },
    { time: '2025-04-16 10:15:30', level: 'warning', content: '内存使用率超过80%' },
    { time: '2025-04-16 10:10:45', level: 'info', content: '系统备份完成' }
];

// 初始化页面
document.addEventListener('DOMContentLoaded', function() {
    initializeFilters();
    displayLogs(logRecords);
});

// 初始化筛选器
function initializeFilters() {
    // 设置日期筛选器默认值为今天
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    document.querySelector('.log-date-filter').value = dateStr;
    
    // 添加筛选器事件监听
    document.querySelector('.log-level-filter').addEventListener('change', filterLogs);
    document.querySelector('.log-date-filter').addEventListener('change', filterLogs);
}

// 筛选日志
function filterLogs() {
    const selectedLevel = document.querySelector('.log-level-filter').value;
    const selectedDate = document.querySelector('.log-date-filter').value;
    
    const filteredLogs = logRecords.filter(log => {
        // 从日志时间中提取日期部分 (YYYY-MM-DD)
        const logDate = log.time.split(' ')[0];
        
        // 检查日志级别和日期是否匹配
        const levelMatch = selectedLevel === 'all' || log.level === selectedLevel;
        const dateMatch = logDate === selectedDate;
        
        return levelMatch && dateMatch;
    });
    
    displayLogs(filteredLogs);
}

// 显示日志
function displayLogs(logs) {
    const logList = document.querySelector('.log-list');
    logList.innerHTML = '';
    
    if (logs.length === 0) {
        // 如果没有匹配的日志，显示提示信息
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'log-item';
        emptyMessage.innerHTML = '<span class="log-content">没有找到匹配的日志记录</span>';
        logList.appendChild(emptyMessage);
        return;
    }
    
    logs.forEach(log => {
        const logItem = document.createElement('div');
        logItem.className = `log-item ${log.level}`;
        logItem.innerHTML = `
            <span class="log-time">${log.time}</span>
            <span class="log-level">${getLogLevelText(log.level)}</span>
            <span class="log-content">${log.content}</span>
        `;
        logList.appendChild(logItem);
    });
}

// 获取日志级别的中文文本
function getLogLevelText(level) {
    const levelMap = {
        'info': '信息',
        'warning': '警告',
        'error': '错误'
    };
    return levelMap[level] || level;
} 