import redis
from flask import Flask, render_template
from flask_script import Manager
from flask_session import Session

from app.home_views import home_blue
from app.models import db
from app.order_views import order_blue
from app.user_views import user_blue, lm

app = Flask(__name__)
# 注册蓝图
app.register_blueprint(blueprint=user_blue, url_prefix='/user')
app.register_blueprint(blueprint=home_blue, url_prefix='/home')
app.register_blueprint(blueprint=order_blue, url_prefix='/order')
# 设置session加密复杂程度
app.secret_key = 'hqewrtyuiopoikuyjthgfsd41034120678ghiwgab'
# 配置数据库
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:123456@127.0.0.1:3307/ihome2'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

# 配置redis
app.config['SESSION_TYPE'] = 'redis'
app.config['SESSION_REDIS'] = redis.Redis(host='120.79.47.68', port=6379, password=123456)
sess = Session()
sess.init_app(app)


@app.route('/')
def index():
    return render_template('index.html')


lm.login_view = "user.login"
lm.init_app(app)
manage = Manager(app)

if __name__ == '__main__':
    manage.run()
