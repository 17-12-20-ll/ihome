import datetime

from flask import Blueprint, render_template, request, session, jsonify
from flask_login import login_required

from app.models import House, Order, User
from utils.caltime import date_poor
from utils.random_time_data import get_order_num

order_blue = Blueprint('order', __name__)


@order_blue.route('/booking/', methods=['GET'])
@login_required
def booking():
    return render_template('booking.html')


@order_blue.route('/is_user/<int:id>/', methods=['GET'])
@login_required
def is_user(id):
    # 上述得到的id为房屋id
    # 获取user_id-->
    h = House.query.filter(House.id == id).first()
    user_id = h.user_id
    if user_id == int(session['user_id']):
        return jsonify({'code': 201, 'msg': '该消息由您发布的,不能预定!'})
    else:
        return jsonify({'code': 200, 'msg': '跳转'})


@order_blue.route('/get_house/<int:id>/', methods=['GET'])
@login_required
def get_house(id):
    h = House.query.filter(House.id == id).first()
    return jsonify({'code': 200, 'msg': 'success', 'data': h.to_dict()})


@order_blue.route('/submit_order/', methods=['POST'])
@login_required
def submit_order():
    user_id = session['user_id']
    house_id = request.form.get('house_id')
    begin_date = request.form.get('begin_date')
    end_date = request.form.get('end_date')
    days = date_poor(begin_date, end_date)
    # 根据house_id查询该房屋订单,根据开始时间与结束时间进行判断用户是否可以对该房间进行下单
    # 第一步,根据房间id得到该房间实例
    h = House.query.filter(House.id == house_id).first()
    # 第二步,获取该房屋的所有订单

    for order in [order for order in h.orders]:
        # 当订单状态为WAIT_ACCEPT,CANCELED,REJECTED,这三种状态时,不会参与订单时间段冲突
        if not order.status == 'WAIT_ACCEPT' or order.status == 'CANCELED' or order.status == 'REJECTED':
            date_start_format = datetime.datetime.strftime(order.begin_date, '%Y-%m-%d')
            date_end_format = datetime.datetime.strftime(order.end_date, '%Y-%m-%d')
            # 第三步,判断根据订单时间,判断准备下单的订单时间是否满足条件
            if days >= House.query.get(order.house_id).min_days and days <= float('inf') if not House.query.get(
                    order.house_id).max_days else House.query.get(order.house_id).max_days:
                condition_1 = date_poor(begin_date, date_start_format) - 1 <= 0 and date_poor(end_date,
                                                                                              date_end_format) - 1 >= 0
                condition_2 = date_poor(begin_date, date_start_format) - 1 <= 0 and date_poor(end_date,
                                                                                              date_end_format) - 1 <= 0 and date_poor(
                    date_start_format, end_date) - 1 > 0
                condition_3 = date_poor(begin_date, date_start_format) - 1 >= 0 and date_poor(end_date,
                                                                                              date_end_format) - 1 <= 0
                condition_4 = date_poor(begin_date, date_start_format) - 1 >= 0 and date_poor(begin_date,
                                                                                              date_end_format) - 1 < 0 and date_poor(
                    end_date, date_end_format) - 1 >= 0
                if condition_1 or condition_2 or condition_3 or condition_4:
                    return jsonify({'code': 200, 'msg': 'exist_order'})
            else:
                return jsonify({'code': 200, 'msg': 'time_error'})
    # 当执行到这里的时候,1. 代表没有超时,2.代表没有与以前的订单冲突
    house_price = request.form.get('house_price')
    amount = days * int(house_price)
    order = Order()
    order.user_id = user_id
    order.house_id = house_id
    order.begin_date = begin_date
    order.end_date = end_date
    order.house_price = house_price
    order.days = days
    order.amount = amount
    order.add_update()
    # # 更新房屋订单数
    # house_all = House.query.all()
    # for house in house_all:
    #     house.order_count = len(house.orders)
    #     house.add_update()
    return jsonify({'code': 200, 'msg': 'success'})


@order_blue.route('/my_order/', methods=['GET'])
@login_required
def my_order():
    return render_template('orders.html')


@order_blue.route('/get_my_order/', methods=['GET'])
@login_required
def get_my_order():
    user_id = session['user_id']
    order_user_all = Order.query.filter_by(user_id=user_id)
    order_user_list = [order.to_dict() for order in order_user_all]
    return jsonify({'code': 200, 'msg': 'success', 'data': order_user_list})


@order_blue.route('/other_order/', methods=['GET'])
@login_required
def other_order():
    return render_template('lorders.html')


@order_blue.route('/get_other_order/', methods=['GET'])
@login_required
def get_other_order():
    u = User.query.get(session['user_id'])
    order_all = []
    order_list = []
    for house in u.houses:
        order_all.append(Order.query.filter(Order.house == house))
    for i in order_all:
        if i.all():
            for j in i.all():
                order_list.append(j.to_dict())
    return jsonify(
        {'code': 200, 'msg': 'success', 'data': order_list})


@order_blue.route('/take_order/<int:id>/', methods=['PATCH'])
@login_required
def take_order(id):
    o = Order.query.filter_by(id=id).first()
    o.status = 'WAIT_PAYMENT'
    o.add_update()
    return jsonify({'code': 200, 'msg': 'success', 'data': o.to_dict()})


@order_blue.route('/refuse_order/<int:id>/', methods=['PATCH'])
@login_required
def refuse_order(id):
    o = Order.query.filter_by(id=id).first()
    refuse_reason = request.form.get('refuse_reason')
    o.msg = refuse_reason
    o.status = 'REJECTED'
    o.add_update()
    return jsonify({'code': 200, 'msg': 'success'})


@order_blue.route('/go_pay/<int:id>/', methods=['PATCH'])
@login_required
def go_pay(id):
    print(id)
    o = Order.query.filter_by(id=id).first()
    o.status = 'PAID'  # 已支付
    o.add_update()
    return jsonify({'code': 200, 'msg': 'success', 'id': id})


@order_blue.route('/go_comment/<int:id>/', methods=['PATCH'])
@login_required
def go_comment(id):
    comment = request.form.get('comment')
    o = Order.query.get(id)
    o.comment = comment
    o.add_update()
    return jsonify({'code': 200, 'msg': 'success', 'id': id, 'comment': comment})


# 设置状态为完成
@order_blue.route('/go_complete/<int:id>/', methods=['PATCH'])
@login_required
def go_complete(id):
    o = Order.query.get(id)
    o.status = 'COMPLETE'
    o.add_update()
    # 更新房屋订单数
    house_all = House.query.all()
    for house in house_all:
        house.order_count = len([i for i in house.orders if i.status == 'COMPLETE'])
        house.add_update()
    return jsonify({'code': 200, 'msg': '已完成'})


# 取消订单
@order_blue.route('/canceled/<int:id>/', methods=['PATCH'])
@login_required
def canceled(id):
    o = Order.query.get(id)
    o.status = 'CANCELED'
    o.add_update()
    return jsonify({'code': 200, 'msg': 'success', 'id': id})
