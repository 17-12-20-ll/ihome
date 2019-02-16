import random
from io import StringIO


def code(num=6):
    str1 = ''
    str2 = '123456789zxcvbnmasdfghjklqwertyuiop'
    for _ in range(num):
        str1 += random.choice(str2)
    return str1


# 获取6位验证码
def xx(length=6):
    c = StringIO()
    for _ in range(length):
        c.write(random.choice('及很大很大哈看哈可见光的哈吉奥就'))
    return c.getvalue()


def get_idiom():
    with open('idiom.txt', encoding='utf-8') as f:
        text = f.read()
    i = random.choice(range(len(text.split('、'))))
    print(text.split('、')[i])
    return text.split('、')[i]


if __name__ == '__main__':
    print(get_idiom())
