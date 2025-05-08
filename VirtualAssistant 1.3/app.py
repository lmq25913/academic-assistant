from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
import os
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from sqlalchemy import text

app = Flask(__name__)

# 数据库配置
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:l2669906091@localhost:3306/virtual_assistant'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.urandom(24)

# 初始化数据库
db = SQLAlchemy(app)

class Auth(db.Model):
    __tablename__ = 'auth'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(50), unique=True, nullable=False, comment='用户名')
    password = db.Column(db.String(255), nullable=False, comment='密码')
    role = db.Column(db.String(20), nullable=False, default='user', comment='用户角色')
    is_active = db.Column(db.Boolean, default=True, comment='是否启用')
    last_login = db.Column(db.DateTime, comment='最后登录时间')
    created_at = db.Column(db.DateTime, default=datetime.now, comment='创建时间')
    updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now, comment='更新时间')

    def __repr__(self):
        return f'<Auth {self.username}>'

    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)

class Attendance(db.Model):
    __tablename__ = 'attendance'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('auth.id'), nullable=False)
    check_in_time = db.Column(db.DateTime, default=datetime.now, comment='签到时间')
    status = db.Column(db.String(20), default='success', comment='签到状态')
    recognition = db.Column(db.String(50), default='识别成功', comment='识别结果')
    created_at = db.Column(db.DateTime, default=datetime.now, comment='创建时间')
    updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now, comment='更新时间')

    def __repr__(self):
        return f'<Attendance {self.id}>'

class Users(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(255), nullable=False)
    face_image = db.Column(db.LargeBinary)
    school = db.Column(db.String(255))

# 创建所有数据库表
with app.app_context():
    db.create_all()
    # 创建默认管理员账号
    try:
        admin = Auth.query.filter_by(username='admin').first()
        if not admin:
            admin = Auth(
                username='admin',
                role='admin',
                is_active=True
            )
            admin.set_password('admin123')
            db.session.add(admin)
            db.session.commit()
    except Exception as e:
        print(f"创建管理员账号失败: {str(e)}")

@app.route('/')
def root():
    return render_template('login.html')

@app.route('/index')
def home():
    return render_template('index.html')

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    user = Auth.query.filter_by(username=username).first()
    
    if user and user.check_password(password) and user.is_active:
        # 更新最后登录时间
        user.last_login = datetime.now()
        db.session.commit()
        
        # 生成JWT token
        token = jwt.encode({
            'user_id': user.id,
            'username': user.username,
            'role': user.role,
            'exp': datetime.utcnow() + timedelta(days=1)
        }, app.config['SECRET_KEY'], algorithm='HS256')
        
        return jsonify({
            'status': 'success',
            'token': token,
            'user': {
                'username': user.username,
                'role': user.role
            }
        })
    
    return jsonify({
        'status': 'error',
        'message': '用户名或密码错误'
    }), 401

@app.route('/attendance')
def attendance():
    return render_template('attendance.html')

@app.route('/logs')
def logs():
    return render_template('logs.html')

@app.route('/permissions')
def permissions():
    return render_template('permissions.html')

@app.route('/surveillance')
def surveillance():
    return render_template('surveillance.html')

@app.route('/temperature')
def temperature():
    return render_template('temperature.html')

@app.route('/users')
def users():
    return render_template('users.html')

# 获取用户列表API
@app.route('/api/users', methods=['GET'])
def get_users():
    users = Auth.query.all()
    return jsonify({
        'status': 'success',
        'users': [{
            'id': user.id,
            'username': user.username,
            'role': user.role,
            'is_active': user.is_active,
            'created_at': user.created_at.strftime('%Y-%m-%d')
        } for user in users]
    })

# 获取单个用户信息API
@app.route('/api/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = Auth.query.get(user_id)
    if not user:
        return jsonify({
            'status': 'error',
            'message': '用户不存在'
        }), 404
    
    return jsonify({
        'status': 'success',
        'user': {
            'id': user.id,
            'username': user.username,
            'role': user.role,
            'is_active': user.is_active,
            'created_at': user.created_at.strftime('%Y-%m-%d')
        }
    })

# 添加用户API
@app.route('/api/users', methods=['POST'])
def add_user():
    data = request.get_json()
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()
    role = data.get('role', 'student')  # 默认角色为student
    
    # 输入验证
    if not username:
        return jsonify({
            'status': 'error',
            'message': '用户名不能为空'
        }), 400
        
    if len(username) < 3 or len(username) > 20:
        return jsonify({
            'status': 'error',
            'message': '用户名长度必须在3-20个字符之间'
        }), 400
        
    if not username.isalnum():
        return jsonify({
            'status': 'error',
            'message': '用户名只能包含字母和数字'
        }), 400
    
    # 检查用户名是否已存在
    if Auth.query.filter_by(username=username).first():
        return jsonify({
            'status': 'error',
            'message': '用户名已存在'
        }), 400
    
    # 角色验证
    valid_roles = ['admin', 'teacher', 'student']
    if role not in valid_roles:
        return jsonify({
            'status': 'error',
            'message': '无效的用户角色'
        }), 400
    
    # 如果没有提供密码，使用默认密码规则
    if not password:
        password = f"{username}@123"  # 更安全的默认密码格式
    elif len(password) < 6:
        return jsonify({
            'status': 'error',
            'message': '密码长度不能少于6个字符'
        }), 400
    
    try:
        new_user = Auth(
            username=username,
            role=role,
            is_active=True,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        new_user.set_password(password)
        
        db.session.add(new_user)
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': '用户添加成功',
            'user': {
                'id': new_user.id,
                'username': new_user.username,
                'role': new_user.role,
                'is_active': new_user.is_active,
                'created_at': new_user.created_at.strftime('%Y-%m-%d')
            }
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': f'添加用户失败: {str(e)}'
        }), 500

# 编辑用户API
@app.route('/api/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    user = Auth.query.get(user_id)
    if not user:
        return jsonify({
            'status': 'error',
            'message': '用户不存在'
        }), 404
    
    data = request.get_json()
    if 'username' in data and data['username'] != user.username:
        if Auth.query.filter_by(username=data['username']).first():
            return jsonify({
                'status': 'error',
                'message': '用户名已存在'
            }), 400
        user.username = data['username']
    
    if 'password' in data:
        user.set_password(data['password'])
    if 'role' in data:
        user.role = data['role']
    if 'is_active' in data:
        user.is_active = data['is_active']
    
    try:
        db.session.commit()
        return jsonify({
            'status': 'success',
            'message': '用户更新成功'
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

# 删除用户API
@app.route('/api/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    user = Auth.query.get(user_id)
    if not user:
        return jsonify({
            'status': 'error',
            'message': '用户不存在'
        }), 404
    
    if user.username == 'admin':
        return jsonify({
            'status': 'error',
            'message': '不能删除管理员账号'
        }), 400
    
    try:
        db.session.delete(user)
        db.session.commit()
        return jsonify({
            'status': 'success',
            'message': '用户删除成功'
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/more-features')
def more_features():
    return render_template('more-features.html')

# 获取签到记录API
@app.route('/api/attendance', methods=['GET'])
def get_attendance():
    try:
        # 获取所有users表里的用户
        users = Users.query.all()
        result = []
        for user in users:
            result.append({
                'id': user.id,
                'name': user.name,
                'time': '',
                'status': 'success',
                'recognition': '识别成功'
            })
        return jsonify({
            'status': 'success',
            'records': result
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

# 添加签到记录API
@app.route('/api/attendance', methods=['POST'])
def add_attendance():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        
        if not user_id:
            return jsonify({
                'status': 'error',
                'message': '用户ID不能为空'
            }), 400
        
        # 检查用户是否存在
        user = Auth.query.get(user_id)
        if not user:
            return jsonify({
                'status': 'error',
                'message': '用户不存在'
            }), 404
        
        # 检查今天是否已经签到
        today = datetime.now().date()
        existing_record = Attendance.query.filter(
            db.func.date(Attendance.check_in_time) == today,
            Attendance.user_id == user_id
        ).first()
        
        if existing_record:
            return jsonify({
                'status': 'error',
                'message': '今天已经签到'
            }), 400
        
        # 创建新的签到记录
        new_record = Attendance(
            user_id=user_id,
            status='success',
            recognition='识别成功'
        )
        
        db.session.add(new_record)
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': '签到成功',
            'record': {
                'id': new_record.id,
                'user_id': new_record.user_id,
                'time': new_record.check_in_time.strftime('%Y-%m-%d %H:%M:%S'),
                'status': new_record.status,
                'recognition': new_record.recognition
            }
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/attendance-logs')
def attendance_logs():
    return render_template('attendance-logs.html')

@app.route('/api/usernames', methods=['GET'])
def get_usernames():
    result = db.session.execute(text('SELECT DISTINCT username FROM logs'))
    usernames = [row[0] for row in result.fetchall() if row[0] is not None]
    return jsonify({'status': 'success', 'usernames': usernames})

@app.route('/api/attendance-logs', methods=['GET'])
def get_attendance_logs():
    try:
        page = int(request.args.get('page', 1))
        page_size = int(request.args.get('page_size', 20))
        username = request.args.get('username', None)
        date = request.args.get('date', None)
        offset = (page - 1) * page_size
        base_query = 'SELECT id, username, user_time, date, time, action FROM logs'
        count_query = 'SELECT COUNT(*) FROM logs'
        where_clauses = []
        params = {}
        if username and username != '全部':
            where_clauses.append('username = :username')
            params['username'] = username
        if date and date != '全部':
            where_clauses.append('date = :date')
            params['date'] = date
        if where_clauses:
            where_sql = ' WHERE ' + ' AND '.join(where_clauses)
            base_query += where_sql
            count_query += where_sql
        base_query += ' ORDER BY id ASC LIMIT :limit OFFSET :offset'
        params['limit'] = page_size
        params['offset'] = offset
        total_result = db.session.execute(text(count_query), params)
        total = total_result.scalar()
        result = db.session.execute(text(base_query), params)
        columns = result.keys()
        logs = []
        for row in result.fetchall():
            row_dict = dict(zip(columns, row))
            # 序列化 user_time 字段
            if 'user_time' in row_dict:
                try:
                    if row_dict['user_time'] is not None:
                        row_dict['user_time'] = row_dict['user_time'].strftime('%Y-%m-%d %H:%M:%S')
                    else:
                        row_dict['user_time'] = ''
                except Exception as e:
                    row_dict['user_time'] = str(row_dict['user_time'])
            # 序列化 date 字段
            if 'date' in row_dict:
                try:
                    if row_dict['date'] is not None:
                        row_dict['date'] = row_dict['date'].strftime('%Y-%m-%d')
                    else:
                        row_dict['date'] = ''
                except Exception as e:
                    row_dict['date'] = str(row_dict['date'])
            # 序列化 time 字段
            if 'time' in row_dict:
                try:
                    if row_dict['time'] is not None:
                        row_dict['time'] = row_dict['time'].strftime('%H:%M:%S')
                    else:
                        row_dict['time'] = ''
                except Exception as e:
                    row_dict['time'] = str(row_dict['time'])
            logs.append(row_dict)
        return jsonify({'status': 'success', 'logs': logs, 'total': total, 'page': page, 'page_size': page_size})
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return jsonify({'status': 'error', 'message': str(e)})

@app.route('/api/dates', methods=['GET'])
def get_dates():
    result = db.session.execute(text('SELECT DISTINCT date FROM logs WHERE date IS NOT NULL ORDER BY date DESC'))
    dates = [row[0].strftime('%Y-%m-%d') if hasattr(row[0], 'strftime') else str(row[0]) for row in result.fetchall() if row[0]]
    return jsonify({'status': 'success', 'dates': dates})

if __name__ == '__main__':
    app.run(debug=True)  # 调试模式