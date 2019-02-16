function showSuccessMsg() {
    $('.popup_con').fadeIn('fast', function() {
        setTimeout(function(){
            $('.popup_con').fadeOut('fast',function(){}); 
        },1000) 
    });
}

function getCookie(name) {
    var r = document.cookie.match("\\b" + name + "=([^;]*)\\b");
    return r ? r[1] : undefined;
}

$(document).ready(function() {

        //ajax上传头像
        $("#form-avatar").submit(function(e){
            e.preventDefault();
            var form = new FormData(document.getElementById("form-avatar"));
            $.ajax({
                url:'/user/edit/',
                type:'POST',
                data:form,
                dataType: 'json',
                contentType:false,
                processData:false,
                success:function(data){
                    if (data.code == '200'){
                        location.href = '/user/edit/'
                    }
                },
                error:function(e){
                    alert('上传出错!稍后尝试')
                    return
                }
            });
        });
        $("#user-name").focus(function(){
                $(".error-msg").hide();
            });
        //ajax上传用户名
        $("#form-name").submit(function(e){
            e.preventDefault();
            var form = new FormData(document.getElementById("form-name"));
            $.ajax({
                type:'POST',
                url:'/user/edit/',
                data:form,
                dataType: 'json',
                contentType:false,
                processData:false,
                success:function(data){
                    if (data.code == '200'){
                        location.href = '/user/edit/'
                    }
                    if (data.code == '1111'){
                        $('.error-msg').show()
                    }
                },
                error:function(e){
                    alert('请输入内容!')
                }
            });
        });
    });
