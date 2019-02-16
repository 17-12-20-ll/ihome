import datetime
import re


def get_order_num():
    result = re.findall(r'\d+', str(datetime.datetime.now()))
    random_time = ''
    for i in result[:-2]:
        random_time += i
    return random_time
