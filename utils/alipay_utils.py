from alipay import AliPay, ISVAliPay

app_private_key_string = open("应用私钥2048.txt").read()
alipay_public_key_string = open("应用公钥2048.txt").read()

app_private_key_string = """
    -----BEGIN RSA PRIVATE KEY-----
    %s
    -----END RSA PRIVATE KEY-----
""" % app_private_key_string

alipay_public_key_string = """
    -----BEGIN PUBLIC KEY-----
    %s
    -----END PUBLIC KEY-----
""" % alipay_public_key_string

alipay = AliPay(
    appid="2016092300580944",
    app_notify_url=None,  # 默认回调url
    app_private_key_string=app_private_key_string,
    # 支付宝的公钥，验证支付宝回传消息使用，不是你自己的公钥,
    alipay_public_key_string=alipay_public_key_string,
    sign_type="RSA",  # RSA 或者 RSA2
    debug=False  # 默认False
)

# If you don't know what ISV is, then forget about what I mentioned below
# either app_auth_code or app_auth_token should not be None
isv_alipay = ISVAliPay(
    appid="	2016092300580944",
    app_notify_url=None,  # 默认回调url
    app_private_key_srting=app_private_key_string,
    # 支付宝的公钥，验证支付宝回传消息使用，不是你自己的公钥,
    alipay_public_key_string=alipay_public_key_string,
    sign_type="RSA",  # RSA or RSA2
    debug=False,  # False by default,
    app_auth_code=None,
    app_auth_token=None
)

order_string = alipay.api_alipay_trade_wap_pay(
    out_trade_no="20161112",
    total_amount=0.01,
    subject='测试订单',
    return_url="https://example.com",
    notify_url="https://example.com/notify"  # 可选, 不填则使用默认notify url
)
