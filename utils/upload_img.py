import os
import uuid


def upload(files_img, file_dir_name):
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # 获取当前项目的根目录
    STATIC_DIR = os.path.join(BASE_DIR, 'static')  # 获得静态文件路径
    FILE_DIR = os.path.join(STATIC_DIR, file_dir_name)  # 获得avatar文件路径
    # 随机生成图片名称
    filename = str(uuid.uuid4()) + '.' + files_img.mimetype.split('/')[-1:][0]
    # 拼接图片地址
    path = os.path.join(FILE_DIR, filename)
    # path: 就是该文件在服务器上的绝对路径
    # 图片保存到服务器:
    files_img.save(path)
    return filename
