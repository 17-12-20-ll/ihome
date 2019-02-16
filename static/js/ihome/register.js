function getCookie(name) {
    var r = document.cookie.match("\\b" + name + "=([^;]*)\\b");
    return r ? r[1] : undefined;
}

var imageCodeId = "";

function generateUUID() {
    var d = new Date().getTime();
    if(window.performance && typeof window.performance.now === "function"){
        d += performance.now(); //use high-precision timer if available
    }
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
}

function generateImageCode() {
    $.get('/user/check_code/',function(data){
        $('#code_').html(data)
        //TODO:将文字验证码转化位图片
    })
}

function sendSMSCode() {
    $(".phonecode-a").removeAttr("onclick");
    var mobile = $("#mobile").val();
    if (!mobile) {
        $("#mobile-err span").html("请填写正确的手机号！");
        $("#mobile-err").show();
        $(".phonecode-a").attr("onclick", "sendSMSCode();");
        return;
    } 
    var imageCode = $("#imagecode").val();
    if (!imageCode) {
        $("#image-code-err span").html("请填写验证码！");
        $("#image-code-err").show();
        $(".phonecode-a").attr("onclick", "sendSMSCode();");
        return;
    }
    $.get("/api/smscode", {mobile:mobile, code:imageCode, codeId:imageCodeId}, 
        function(data){
            if (0 != data.errno) {
                $("#image-code-err span").html(data.errmsg); 
                $("#image-code-err").show();
                if (2 == data.errno || 3 == data.errno) {
                    generateImageCode();
                }
                $(".phonecode-a").attr("onclick", "sendSMSCode();");
            }   
            else {
                var $time = $(".phonecode-a");
                var duration = 60;
                var intervalid = setInterval(function(){
                    $time.html(duration + "秒"); 
                    if(duration === 1){
                        clearInterval(intervalid);
                        $time.html('获取验证码'); 
                        $(".phonecode-a").attr("onclick", "sendSMSCode();");
                    }
                    duration = duration - 1;
                }, 1000, 60); 
            }
    }, 'json'); 
}

$(document).ready(function() {
    generateImageCode();
    $("#mobile").focus(function(){
        $("#mobile-err").hide();
    });
    $("#imagecode").focus(function(){
        $("#image-code-err").hide();
    });
    $("#password").focus(function(){
        $("#password-err").hide();
        $("#password2-err").hide();
    });
    $("#password2").focus(function(){
        $("#password2-err").hide();
    });
    $(".form-register").submit(function(e){
        e.preventDefault(); // 阻止默认行为,最大的表现形式为:改变Post提交后变为get请求
        mobile = $("#mobile").val();
        imagecode = $("#imagecode").val();
        passwd = $("#password").val();
        passwd2 = $("#password2").val();
        if (!mobile) {
            $("#mobile-err span").html("请填写正确的手机号！");
            $("#mobile-err").show();
            return;
        }
        if (!imagecode) {
            $("#image-code-err span").html("填写图片验证码!");
            $("#image-code-err").show();
            return;
        }
        if (!passwd) {
            $("#password-err span").html("请填写密码!");
            $("#password-err").show();
            return;
        }
        if (passwd != passwd2) {
            $("#password2-err span").html("两次密码不一致!");
            $("#password2-err").show();
            return;
        }
        // 异步提交注册请求,ajax请求
        $.ajax({
            url:'/user/register/',
            type:'POST',
            dataType:'json',
            data:{'mobile':mobile,'imagecode':imagecode,'passwd':passwd,'passwd2':passwd2},
            success:function(data){
                if (data.msg == 'success'){
                    flag = confirm('注册成功!前去登录?')
                    if (flag){
                        location.href = '/user/login/'
                    }else{
                        location.href = '/user/register/'
                    }
                }
                if (data.msg == 'code_error'){
                    $('#image-code-err span').text('验证码错误!')
                    $('#image-code-err').show()
                }
                if (data.msg == 'exist'){
                    $('#mobile-err span').html('该手机号已经注册!')
                    $('#mobile-err').show()
                }
                if (data.msg == 'null'){
                    alert('请输入完整!')
                }
                if (data.msg == 'phone_err'){
                    $('#mobile-err span').html('手机号格式错误!')
                    $('#mobile-err').show()
                }
                if (data.msg == 'passwd_different'){
                    $('#password2-err span').html('密码不一致!')
                    $('#password2-err').show()
                }
            },
            error:function(e){
                    alert(2)
            }
        })
    });
})