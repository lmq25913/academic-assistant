// 签到日志记录页面JS

let currentPage = 1;
const PAGE_SIZE = 20;
let totalPages = 1;

const COLUMN_ORDER = ['username', 'user_time', 'date', 'time', 'id', 'action'];
const COLUMN_NAMES = {
    'username': '用户名',
    'user_time': '签到时间',
    'date': '日期',
    'time': '打卡时刻',
    'id': '编号',
    'action': '操作'
};

let allUsernames = [];
let selectedUsername = '全部';
let allDates = [];
let selectedDate = '全部';

document.addEventListener('DOMContentLoaded', function() {
    // 获取所有用户名，供下拉菜单用
    fetch('/api/usernames')
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                allUsernames = data.usernames;
                allUsernames.unshift('全部');
            }
        });
    // 新增：获取所有日期
    fetch('/api/dates')
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                allDates = data.dates;
                allDates.unshift('全部');
            }
        });
    loadAttendanceLogs(currentPage);
    createPagination();
    // 点击空白处关闭下拉
    document.addEventListener('click', function(e) {
        const dropdown = document.getElementById('commonDropdown');
        if (dropdown && !dropdown.contains(e.target) && e.target.id !== 'usernameHeader' && e.target.id !== 'dateHeader') {
            dropdown.style.display = 'none';
        }
    });
});

function loadAttendanceLogs(page) {
    const username = selectedUsername || '全部';
    const date = selectedDate || '全部';
    let url = `/api/attendance-logs?page=${page}&page_size=${PAGE_SIZE}`;
    if (username && username !== '全部') {
        url += `&username=${encodeURIComponent(username)}`;
    }
    if (date && date !== '全部') {
        url += `&date=${encodeURIComponent(date)}`;
    }
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                renderLogsTable(data.logs);
                updatePagination(data.page, Math.ceil(data.total / PAGE_SIZE));
            } else {
                alert('加载日志失败: ' + (data.message || '未知错误'));
            }
        })
        .catch(error => {
            console.error('加载日志失败:', error);
            alert('加载日志失败，请刷新页面重试');
        });
}

function renderLogsTable(logs) {
    const thead = document.getElementById('logsTableHead');
    const tbody = document.getElementById('logsTableBody');
    thead.innerHTML = '';
    tbody.innerHTML = '';
    // 始终渲染表头（带筛选交互）
    let headHtml = '<tr>';
    COLUMN_ORDER.forEach(col => {
        if (col === 'username') {
            headHtml += `<th id="usernameHeader" style="cursor:pointer;position:relative;">用户名 <span style='font-size:12px;color:#888;'>&#9660;</span></th>`;
        } else if (col === 'date') {
            headHtml += `<th id="dateHeader" style="cursor:pointer;position:relative;">日期 <span style='font-size:12px;color:#888;'>&#9660;</span></th>`;
        } else {
            headHtml += `<th>${COLUMN_NAMES[col] || col}</th>`;
        }
    });
    headHtml += '</tr>';
    thead.innerHTML = headHtml;
    // 绑定点击事件（每次渲染都要绑定）
    const usernameHeader = document.getElementById('usernameHeader');
    if (usernameHeader) {
        usernameHeader.addEventListener('click', function(e) {
            e.stopPropagation();
            showUsernameDropdown(usernameHeader);
        });
    }
    const dateHeader = document.getElementById('dateHeader');
    if (dateHeader) {
        dateHeader.addEventListener('click', function(e) {
            e.stopPropagation();
            showDateDropdown(dateHeader);
        });
    }
    // 渲染表体
    if (!logs || logs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="' + COLUMN_ORDER.length + '" style="text-align:center;color:#888;">暂无数据</td></tr>';
        return;
    }
    logs.forEach(row => {
        let rowHtml = '<tr>';
        COLUMN_ORDER.forEach(col => {
            rowHtml += `<td>${row[col]}</td>`;
        });
        rowHtml += '</tr>';
        tbody.innerHTML += rowHtml;
    });
}

function showDropdown(target, items, selectedItem, onSelect) {
    const dropdown = document.getElementById('commonDropdown');
    dropdown.innerHTML = '';
    dropdown.style.maxHeight = '320px';
    dropdown.style.overflowY = 'auto';
    items.forEach(itemValue => {
        const item = document.createElement('div');
        item.textContent = itemValue;
        item.style.padding = '6px 16px';
        item.style.cursor = 'pointer';
        if (itemValue === selectedItem) {
            item.style.background = '#e6f7ff';
            item.style.fontWeight = 'bold';
        }
        item.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdown.style.display = 'none';
            onSelect(itemValue);
        });
        dropdown.appendChild(item);
    });
    // 定位到表头下方
    const rect = target.getBoundingClientRect();
    dropdown.style.left = rect.left + window.scrollX + 'px';
    dropdown.style.top = rect.bottom + window.scrollY + 'px';
    dropdown.style.display = 'block';
}

function showUsernameDropdown(target) {
    showDropdown(target, allUsernames, selectedUsername, function(name) {
        selectedUsername = name;
        loadAttendanceLogs(1);
    });
}

function showDateDropdown(target) {
    showDropdown(target, allDates, selectedDate, function(date) {
        selectedDate = date;
        loadAttendanceLogs(1);
    });
}

function createPagination() {
    const pageContent = document.querySelector('.page-content');
    const paginationDiv = document.createElement('div');
    paginationDiv.className = 'pagination';
    paginationDiv.innerHTML = `
        <button id="prevPage" class="page-btn">上一页</button>
        <span id="pageInfo">第 <span id="currentPage">1</span> 页 / 共 <span id="totalPages">1</span> 页</span>
        <button id="nextPage" class="page-btn">下一页</button>
        <input type="number" id="jumpPageInput" min="1" value="1" style="width:60px;margin-left:10px;">
        <button id="jumpPageBtn" class="page-btn">跳转</button>
    `;
    pageContent.appendChild(paginationDiv);
    document.getElementById('prevPage').addEventListener('click', () => changePage(-1));
    document.getElementById('nextPage').addEventListener('click', () => changePage(1));
    document.getElementById('jumpPageBtn').addEventListener('click', jumpToPage);
}

function updatePagination(page, total) {
    currentPage = page;
    totalPages = total;
    document.getElementById('currentPage').textContent = currentPage;
    document.getElementById('totalPages').textContent = totalPages;
    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage === totalPages;
    document.getElementById('jumpPageInput').value = currentPage;
    document.getElementById('jumpPageInput').max = totalPages;
}

function changePage(delta) {
    if ((currentPage + delta) < 1 || (currentPage + delta) > totalPages) return;
    loadAttendanceLogs(currentPage + delta);
}

function jumpToPage() {
    const input = document.getElementById('jumpPageInput');
    let page = parseInt(input.value);
    if (isNaN(page) || page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    loadAttendanceLogs(page);
} 