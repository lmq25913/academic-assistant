// 从数据库获取签到记录
let allAttendanceRecords = []; // 保存原始数据
let attendanceRecords = [];    // 当前筛选后用于展示的数据
const RECORDS_PER_PAGE = 10; // 每页显示10条记录
let currentPage = 1;

// 初始化页面
document.addEventListener('DOMContentLoaded', function() {
    loadAttendanceRecords();
    initializeFilters();
    initializePagination();
    updateAttendanceStats();
});

// 从数据库加载签到记录
function loadAttendanceRecords() {
    fetch('/api/attendance')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                allAttendanceRecords = data.records; // 保存原始数据
                attendanceRecords = [...allAttendanceRecords]; // 初始化展示数据
                displayCurrentPage();
                updatePagination();
                updateAttendanceStats();
            }
        })
        .catch(error => {
            console.error('加载签到记录失败:', error);
            alert('加载签到记录失败，请刷新页面重试');
        });
}

// 初始化分页控件
function initializePagination() {
    document.getElementById('prevPage').addEventListener('click', () => changePage(-1));
    document.getElementById('nextPage').addEventListener('click', () => changePage(1));
    updatePagination();
}

// 更改页码
function changePage(delta) {
    const totalPages = Math.ceil(attendanceRecords.length / RECORDS_PER_PAGE);
    currentPage = Math.max(1, Math.min(currentPage + delta, totalPages));
    displayCurrentPage();
    updatePagination();
}

// 更新分页控件状态
function updatePagination() {
    const totalPages = Math.ceil(attendanceRecords.length / RECORDS_PER_PAGE);
    document.getElementById('currentPage').textContent = currentPage;
    document.getElementById('totalPages').textContent = totalPages;
    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage === totalPages;
}

// 显示当前页的记录
function displayCurrentPage() {
    const tbody = document.getElementById('attendanceList');
    tbody.innerHTML = ''; // 清空当前显示
    
    const start = (currentPage - 1) * RECORDS_PER_PAGE;
    const end = Math.min(start + RECORDS_PER_PAGE, attendanceRecords.length);
    
    for (let i = start; i < end; i++) {
        const data = attendanceRecords[i];
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${data.name}</td>
            <td>${data.time || '-'}</td>
            <td><span class="attendance-status ${data.status}">${getStatusText(data.status)}</span></td>
            <td><span class="recognition-result ${data.recognition === '识别成功' ? 'success' : 'failed'}">${data.recognition}</span></td>
        `;
        tbody.appendChild(row);
    }
}

// 获取状态显示文本
function getStatusText(status) {
    const statusMap = {
        'success': '已签到',
        'late': '迟到',
        'pending': '未签到'
    };
    return statusMap[status] || status;
}

// 筛选签到记录
function filterAttendance() {
    const status = document.getElementById('statusFilter').value;
    const searchName = document.getElementById('nameSearch').value.trim().toLowerCase();
    const selectedDate = document.getElementById('dateFilter').value;
    
    currentPage = 1;
    
    attendanceRecords = allAttendanceRecords.filter(record => {
        const matchesStatus = status === 'all' || record.status === status;
        const matchesName = searchName === '' || record.name.toLowerCase().includes(searchName);
        let matchesDate = true;
        if (selectedDate && record.time) {
            const recordDate = record.time.split(' ')[0];
            matchesDate = recordDate === selectedDate;
        }
        return matchesStatus && matchesName && matchesDate;
    });
    
    displayCurrentPage();
    updatePagination();
    updateAttendanceStats();
}

// 初始化筛选器
function initializeFilters() {
    // 设置日期筛选器默认值为今天
    const dateFilter = document.getElementById('dateFilter');
    const today = new Date().toISOString().split('T')[0];
    dateFilter.value = today;
    
    // 添加筛选器事件监听
    dateFilter.addEventListener('change', filterAttendance);
    document.getElementById('statusFilter').addEventListener('change', filterAttendance);
    document.getElementById('nameSearch').addEventListener('input', filterAttendance);

    // 初始筛选
    filterAttendance();
}

// 更新签到统计
function updateAttendanceStats() {
    const totalExpected = attendanceRecords.length;
    let onTime = attendanceRecords.filter(r => r.status === 'success').length;
    let late = attendanceRecords.filter(r => r.status === 'late').length;
    
    const actual = onTime + late;
    const notAttended = totalExpected - actual;
    const attendanceRate = Math.round((actual / totalExpected) * 100);
    
    document.getElementById('actualAttendance').textContent = actual;
    document.getElementById('lateAttendance').textContent = late;
    document.getElementById('notAttendance').textContent = notAttended;
    document.getElementById('attendanceRate').textContent = attendanceRate + '%';
} 