import datetime

from flask import Blueprint, render_template, jsonify, request, session
from flask_login import login_required

from app.models import Area, Facility, House, HouseImage
from utils.caltime import date_poor
from utils.upload_img import upload

home_blue = Blueprint('home', __name__)


@home_blue.route('/index/', methods=['GET'])
def index():
    return render_template('index.html')


@home_blue.route('/area/', methods=['GET'])
def get_area():
    area_all = Area.query.all()
    area_list = [area.to_dict() for area in area_all]
    return jsonify({'code': 200, 'msg': 'success', 'data': area_list})


@home_blue.route('/facility/', methods=['GET'])
def get_facility():
    facility_all = Facility.query.all()
    facility_list = [facility.to_dict() for facility in facility_all]
    return jsonify({'code': 200, 'msg': 'success', 'data': facility_list})


@home_blue.route('/newhouse/', methods=['GET'])
@login_required
def newhouse():
    return render_template('newhouse.html')


@home_blue.route('/publish_home/', methods=['POST'])
@login_required
def publish_home():
    title = request.form.get('title')
    price = request.form.get('price')
    area_id = request.form.get('area_id')
    address = request.form.get('address')
    room_count = request.form.get('room_count')
    acreage = request.form.get('acreage')
    unit = request.form.get('unit')
    capacity = request.form.get('capacity')
    beds = request.form.get('beds')
    deposit = request.form.get('deposit')
    min_days = request.form.get('min_days')
    max_days = request.form.get('max_days')
    facility = request.form.getlist('facility')
    if all([title, price, area_id, address, room_count, acreage, unit, capacity, beds, deposit, min_days, max_days,
            facility]):
        # 都不为空
        house = House()
        house.user_id = session['user_id']
        house.title = title
        house.price = price
        house.area_id = area_id
        house.address = address
        house.room_count = room_count
        house.acreage = acreage
        house.unit = unit
        house.capacity = capacity
        house.beds = beds
        house.deposit = deposit
        house.min_days = min_days
        house.max_days = max_days
        for i in facility:
            # 在多对多中添加的是对象
            house.facilities.append(Facility.query.filter(Facility.id == i).first())
        house.add_update()
        return jsonify({'code': 200, 'msg': 'success'})


@home_blue.route('/get_home_all_id/', methods=['GET'])
def get_home_all_id():
    house_all = House.query.all()
    house_list = [house.to_dict() for house in house_all]
    return jsonify({'code': 200, 'msg': 'success', 'data': house_list})


@home_blue.route('/publish_home_img/', methods=['POST'])
@login_required
def publish_home_img():
    house_image = request.files.get('house_image')  # 获取到的房屋图片
    house_id = request.form.get('house-id-img')  # 获取到的房屋id
    h = House.query.filter(House.id == house_id).first()
    if not all([house_id, house_image]):
        return jsonify({'code': 2004, 'msg': '请上传完整'})
    house_img = HouseImage()
    house_img.house_id = house_id
    house_img.url = upload(house_image, 'house')
    if not h.index_image_url:
        h.index_image_url = house_img.url
        h.add_update()
    house_img.add_update()
    return jsonify({'code': 200, 'msg': '上传成功!'})


@home_blue.route('/myhouse/', methods=['GET'])
@login_required
def myhouse():
    return render_template('myhouse.html')


@home_blue.route('/get_myhouse/', methods=['GET'])
@login_required
def get_myhouse():
    house_all = House.query.filter(House.user_id == session['user_id']).all()
    house_list = [house.to_dict() for house in house_all]
    return jsonify({'code': 200, 'msg': 'success', 'data': house_list})


@home_blue.route('/detail/', methods=['GET'])
@login_required
def detail():
    return render_template('detail.html')


@home_blue.route('/detail/<int:id>/', methods=['GET'])
@login_required
def api_detail(id):
    h = House.query.filter(House.id == id).first()
    comment_list = [[order.user.to_basic_dict(), order.comment, order.update_time.strftime('%Y-%m-%d %H:%M:%S')] for
                    order in h.orders]
    return jsonify({'code': 200, 'msg': 'success', 'data': h.to_full_dict(), 'comment_list': comment_list})


# 查询最新的几个,然后在首页轮播
@home_blue.route('/get_newhouse/', methods=['GET'])
def get_newhouse():
    new_house = House.query.order_by('-create_time').all()
    new_house_list = [house.to_swiper_dict() for house in new_house]
    return jsonify({'code': 200, 'msg': 'success', 'data': new_house_list[:3]})


# 搜索房屋
@home_blue.route('/search/', methods=['GET'])
def search():
    return render_template('search.html')


@home_blue.route('/search_result/', methods=['GET'])
def search_result():
    area_all = Area.query.all()
    area_list = [area.to_dict() for area in area_all]
    aname = request.args.get('aname')
    sd = request.args.get('sd')
    ed = request.args.get('ed')
    # 当没有输入地址时,输出的房屋信息
    if aname == '位置区域':
        # 没有输入地址时,但是有输入时间信息
        a_all = Area.query.all()
        house_list = []
        if all([sd, ed]):
            days = date_poor(sd, ed)
            for a in a_all:
                for i in a.houses:
                    if (days <= i.max_days if i.max_days else float('inf')) and days >= i.min_days:
                        house_list.append(i.to_search_dict())
            return jsonify(
                {'code': 200, 'msg': 'have_aname_and_no_time', 'area_list': area_list, 'house_list': house_list})
        for a in a_all:
            for i in a.houses:
                house_list.append(i.to_search_dict())
        return jsonify({'code': 200, 'msg': 'no_aname', 'area_list': area_list, 'house_list': house_list})
    # 判断没有输入时间时,加载的房屋信息
    if not all([sd, ed]):
        a = Area.query.filter(Area.name == aname).first()
        house_list = [house.to_search_dict() for house in a.houses]
        return jsonify({'code': 200, 'msg': 'no_time', 'house_list': house_list, 'area_list': area_list})
    # 都有输入时,出现的筛选信息
    days = date_poor(sd, ed)
    a = Area.query.filter(Area.name == aname).first()
    house_list = [house.to_search_dict() for house in a.houses if
                  (days <= house.max_days if house.max_days else float('inf')) and days >= house.min_days]
    return jsonify({'code': 200, 'msg': 'success', 'area_list': area_list, 'house_list': house_list})


# ajax更新搜索页面
@home_blue.route('/search_sort/', methods=['POST'])
def search_sort():
    aname = request.form.get('aname')
    sk = request.form.get('sk')
    a = Area.query.filter(Area.name == aname).first()
    sd = request.form.get('sd')
    ed = request.form.get('ed')
    if sk == 'new':
        condition = '-update_time'
    if sk == 'booking':
        condition = '-order_count'
    if sk == 'price-inc':
        condition = 'price'
    if sk == 'price-des':
        condition = '-price'
    # 没有时间获取房源信息
    if not all([sd, ed]):
        house_list = []
        # 也没有输入位置信息
        if not aname:
            a_all = Area.query.all()
            for a in a_all:
                for h in a.houses:
                    house_list.append(h.to_search_dict())
            # 返回房屋列表,最新上线
            if condition == '-update_time':
                house_list.sort(key=lambda house: house.get('update_time'), reverse=True)
            # 返回房屋列表,入住最多
            if condition == '-order_count':
                house_list.sort(key=lambda house: house.get('order_count'), reverse=True)
            # # 返回房屋列表,价格由低到高
            if condition == 'price':
                house_list.sort(key=lambda house: house.get('price'))
            # 返回房屋列表,价格由高到低
            if condition == '-price':
                house_list.sort(key=lambda house: house.get('price'), reverse=True)
            return jsonify({'code': 200, 'msg': 'no_address', 'house_list': house_list if house_list else '暂无房源'})
        # 没有时间,但是有地址
        for h in a.houses:
            house_list.append(h.to_search_dict())
            # 返回房屋列表,最新上线
            if condition == '-update_time':
                house_list.sort(key=lambda house: house.get('update_time'), reverse=True)
            # 返回房屋列表,入住最多
            if condition == '-order_count':
                house_list.sort(key=lambda house: house.get('order_count'), reverse=True)
            # # 返回房屋列表,价格由低到高
            if condition == 'price':
                house_list.sort(key=lambda house: house.get('price'))
            # 返回房屋列表,价格由高到低
            if condition == '-price':
                house_list.sort(key=lambda house: house.get('price'), reverse=True)
        return jsonify({'code': 200, 'msg': 'no_time_have_address', 'house_list': house_list if house_list else '暂无房源'})
    # 不输入地理位置,但是有时间输入
    days = date_poor(sd, ed)
    if not aname:
        house_list = []
        for h in House.query.all():
            # 判断该时间段满足房屋的最小入住时间与最大限制时间
            if (days <= h.max_days if h.max_days else float('inf')) and days >= h.min_days:
                # 判断该房屋是否存在订单
                if h.orders:
                    # 判断该时间段不会与已接单订单时间冲突
                    # 节省资源,遍历当前房屋的订单,判断时间冲突
                    for o in h.orders:
                        if not (o.status == 'WAIT_ACCEPT' or o.status == 'CANCELED' or o.status == 'REJECTED'):
                            date_start_format = datetime.datetime.strftime(o.begin_date, '%Y-%m-%d')
                            date_end_format = datetime.datetime.strftime(o.end_date, '%Y-%m-%d')
                            condition_1 = date_poor(sd, date_start_format) - 1 <= 0 and date_poor(ed,
                                                                                                  date_end_format) - 1 >= 0
                            condition_2 = date_poor(sd, date_start_format) - 1 <= 0 and date_poor(ed,
                                                                                                  date_end_format) - 1 <= 0 and date_poor(
                                date_start_format, ed) - 1 > 0
                            condition_3 = date_poor(sd, date_start_format) - 1 >= 0 and date_poor(ed,
                                                                                                  date_end_format) - 1 <= 0
                            condition_4 = date_poor(sd, date_start_format) - 1 >= 0 and date_poor(sd,
                                                                                                  date_end_format) - 1 < 0 and date_poor(
                                ed, date_end_format) - 1 >= 0
                            if not (condition_1 or condition_2 or condition_3 or condition_4):
                                if not h.to_search_dict() in house_list:
                                    house_list.append(h.to_search_dict())
        # 返回房屋列表,最新上线
        if condition == '-update_time':
            house_list.sort(key=lambda house: house.get('update_time'), reverse=True)
        # 返回房屋列表,入住最多
        if condition == '-order_count':
            house_list.sort(key=lambda house: house.get('order_count'), reverse=True)
        # 返回房屋列表,价格由低到高
        if condition == 'price':
            house_list.sort(key=lambda house: house.get('price'))
        # 返回房屋列表,价格由高到低
        if condition == '-price':
            house_list.sort(key=lambda house: house.get('price'), reverse=True)
        return jsonify({'code': 200, 'msg': 'no_address_have_time', 'house_list': house_list if house_list else '暂无房源'})
    h_all = House.query.filter(House.area_id == a.id).order_by(condition).all()
    house_list = [house.to_search_dict() for house in h_all if
                  (days <= house.max_days if house.max_days else float('inf')) and days >= house.min_days]
    return jsonify({'code': 200, 'msg': 'success', 'house_list': house_list if house_list else '暂无房源'})
