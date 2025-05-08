import pymysql
from prettytable import PrettyTable

def show_database_structure():
    try:
        # 连接数据库
        conn = pymysql.connect(
            host='localhost',
            user='root',
            password='l2669906091',
            database='virtual_assistant'
        )
        
        cursor = conn.cursor()
        
        # 获取所有表名
        cursor.execute("SHOW TABLES")
        tables = cursor.fetchall()
        
        print("\n=== 数据库 'virtual_assistant' 中的表 ===")
        for table in tables:
            table_name = table[0]
            print(f"\n表名: {table_name}")
            
            # 获取表结构
            cursor.execute(f"SHOW FULL COLUMNS FROM {table_name}")
            columns = cursor.fetchall()
            
            # 创建表格
            t = PrettyTable()
            t.field_names = ["字段名", "类型", "排序规则", "可为空", "键", "默认值", "额外信息", "权限", "注释"]
            for column in columns:
                t.add_row(column)
            print(t)
            
            # 如果是users表，显示示例数据
            if table_name == 'users':
                print("\n示例数据:")
                cursor.execute(f"SELECT id, name, 'BLOB' as face_image, school FROM {table_name} LIMIT 5")
                data = cursor.fetchall()
                if data:
                    d = PrettyTable()
                    d.field_names = ["ID", "姓名", "人脸图像", "学校"]
                    for row in data:
                        d.add_row(row)
                    print(d)
            
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"错误: {str(e)}")

if __name__ == "__main__":
    show_database_structure() 