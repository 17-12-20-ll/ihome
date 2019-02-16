import os
import re
import uuid

from flask import Blueprint, render_template, request, jsonify, session
from flask_login import login_user, LoginManager, logout_user, login_required

from app.models import User
from utils.check_code import get_idiom

# 获取用户蓝图实例
from utils.upload_img import upload

user_blue = Blueprint('user', __name__)
# 获取登录管理实例
lm = LoginManager()


# 前端处理的事儿
@user_blue.route('/register/', methods=['GET'])
def register():
    return render_template('register.html')


# 处理json数据后端的工作
@user_blue.route('/register/', methods=['POST'])
def api_register():
    # 获取参数
    # 2. 验证手机号正确
    mobile = request.form.get('mobile')
    if not re.match('^1[3456789]\d{9}$', mobile):
        return jsonify({'code': 200, 'msg': 'phone_err'})
    # 3. 验证图片验证码
    imagecode = request.form.get('imagecode')
    # 4. 校验密码是否一致
    passwd = request.form.get('passwd')
    passwd2 = request.form.get('passwd2')
    if not passwd == passwd2:
        return jsonify({'code': 200, 'msg': 'passwd_different'})
    # 验证手机号是否被注册
    if User.query.filter(User.phone == mobile).first():
        return jsonify({'code': 200, 'msg': 'exist'})
    if all([mobile, imagecode, passwd, passwd2]):
        if imagecode == session.get('img_code'):
            # 6. 创建注册信息
            # Shift + F5 进行页面强制刷新,清楚当前页面缓存,就会加载被修改后的css和js了
            u = User()
            u.phone = mobile
            u.password = passwd2
            u.add_update()
            return jsonify({'code': 200, 'msg': 'success'})
        else:
            return jsonify({'code': 200, 'msg': 'code_error'})
    else:
        return jsonify({'code': 200, 'msg': 'null'})


@user_blue.route('/check_code/')
def get_code():
    # 获取验证码
    # 方式1:后端生成验证码图片并返回图片地址(不推荐)
    # 方式2:后端只生成随机参数,返回给也页面,在页面中前端生成图片
    c = get_idiom()
    session['img_code'] = c
    return c


@user_blue.route('/login/', methods=['GET'])
def login():
    return render_template('login.html')


@user_blue.route('/login/', methods=['POST'])
def api_login():
    mobile = request.form.get('mobile')
    passwd = request.form.get('passwd')
    if all([mobile, passwd]):
        u = User.query.filter(User.phone == mobile).first()
        if u:
            if u.check_pwd(passwd):
                login_user(u)
                return jsonify({'code': 200, 'msg': 'success'})
            else:
                return jsonify({'code': 1001, 'msg': '密码错误!'})
        else:
            return jsonify({'code': 1002, 'msg': '账号不存在!'})
    else:
        return jsonify({'code': 1003, 'msg': '请输入完全'})


@lm.user_loader
def load_user(user_id):
    # 定义被login_manage装饰的回调函数
    # 返回的是当前登录系统的用户对象
    return User.query.filter(User.id == user_id).first()


@user_blue.route('/my/', methods=['GET'])
@login_required
def my():
    return render_template('my.html')


@user_blue.route('/edit/', methods=['GET'])
@login_required
def edit():
    return render_template('profile.html')


@user_blue.route('/edit/', methods=['POST'])
@login_required
def api_edit():
    id = session.get('user_id')  # 获取当前登录系统的用户id
    u = User.query.filter(User.id == id).first()
    if request.files.get('avatar'):
        if u.avatar:
            # 上传头像之前先删除之前上传的头像(若想增加历史头像的功能,需要使用列表存储历史的图片路径)
            base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            del_path = base_path + '\static\\avatar\\' + u.avatar
            os.remove(del_path)
        avatar = request.files.get('avatar')
        # # 获取到文件上传(avatar)
        # # 绝对路径:
        # BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # 获取当前项目的根目录
        # STATIC_DIR = os.path.join(BASE_DIR, 'static')  # 获得静态文件路径
        # AVATAR_DIR = os.path.join(STATIC_DIR, 'avatar')  # 获得avatar文件路径
        # # 随机生成图片名称
        # filename = str(uuid.uuid4()) + '.' + avatar.mimetype.split('/')[-1:][0]
        # # 拼接图片地址
        # path = os.path.join(AVATAR_DIR, filename)
        # # path: 就是该文件在服务器上的绝对路径
        # # 图片保存到服务器:
        # avatar.save(path)
        # 将图片路径保存到当前用户
        u.avatar = upload(avatar, 'avatar')
        u.add_update()
        return jsonify({'code': 200, 'msg': '上传成功'})
    if request.form.get('name'):
        name = request.form.get('name')
        if User.query.filter(User.name == name).first():
            return jsonify({'code': 1111, 'msg': '用户名已经存在!'})
        u.name = name
        u.add_update()
        return jsonify({'code': 200, 'msg': 'success'})


@user_blue.route('/logout/', methods=['GET'])
@login_required
def api_logout():
    logout_user()
    return jsonify({'code': 200, 'msg': '退出当前用户'})


@user_blue.route('/auth/', methods=['GET'])
def auth():
    return render_template('auth.html')


@user_blue.route('/auth/', methods=['POST'])
@login_required
def api_auth():
    id = session.get('user_id')
    u = User.query.filter(User.id == id).first()
    real_name = request.form.get('real_name')
    id_card = request.form.get('id_card')
    if not re.match(r'^[\u4e00-\u9fa5]{2,4}$', real_name):
        return jsonify({'code': 1100, 'msg': '验证姓名出错!'})
    if not re.fullmatch(r'[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$',
                        id_card):
        return jsonify({'code': 1200, 'msg': '身份证号码不正确!'})
    u.id_name = real_name
    u.id_card = id_card
    u.add_update()
    return jsonify({'code': 200, 'msg': '认证成功!'})


@user_blue.route('/get_auth/', methods=['GET'])
def get_auth():
    u = User.query.filter_by(id=session['user_id']).first()
    if u:
        return jsonify({'code': 200, 'msg': 'success', 'data': u.to_auth_dict()})
