function showSuccessMsg() {
    $('.popup_con').fadeIn('fast', function() {
        setTimeout(function(){
            $('.popup_con').fadeOut('fast',function(){}); 
        },1000) 
    });
}

$(function(){

    $.get('/user/get_auth/',function(data){
       $('#real-name').val(data.data.id_name)
       $('#id-card').val(data.data.id_card)
       console.log(data.data)
       if (data.data.id_card){
           $('#real-name').attr("readonly","readonly")
           $('#id-card').attr("readonly","readonly")
           $('.btn-success').hide()
       }
    });

    $('#form-auth').submit(function(e){
        e.preventDefault();
        $("#real-name").focus(function(){
            $("#error-msg").hide();
        });
        $("#id-card").focus(function(){
            $("#error-msg").hide();
        });
        $(this).ajaxSubmit({
            url:'/user/auth/',
            type:'POST',
            dataType:'json',
            success:function(data){
                if (data.code == '200'){
                    alert(data.msg)
                    location.href='/user/my/'
                }
                if (data.code == '1200'){
                    $('.error-msg').html('<i class="fa fa-exclamation-circle"></i>'+data.msg)
                    $('.error-msg').show()
                }
                if (data.code == '1100'){
                    $('.error-msg').html('<i class="fa fa-exclamation-circle"></i>'+data.msg)
                    $('.error-msg').show()
                }

            },
            error:function(e){
                alert('身份证号码重复,认证失败!')
            }
        })
    })
});

