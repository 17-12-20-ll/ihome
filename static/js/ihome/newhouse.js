function getCookie(name) {
    var r = document.cookie.match("\\b" + name + "=([^;]*)\\b");
    return r ? r[1] : undefined;
}

$(document).ready(function(){
     $('.popup_con').fadeIn('fast');
     $('.popup_con').fadeOut('fast');
     $.get('/home/area/',function(data){
        for (i in data.data){
            $('#area-id').append('<option value="'+ data.data[i].id +'">'+ data.data[i].name +'</option>')
        }
     });
     $.get('/home/facility/',function(data){
        for (i in data.data){
            $('.house-content ul').append('<li><div class="checkbox"><label><input type="checkbox" name="facility" value="'+ data.data[i].id +'">'+ data.data[i].name +'</label></div></li>')
        }
     });
     $.get('/home/get_home_all_id/',function(data){
        for (i in data.data){
            $('#house-id-img').append('<option value="'+ data.data[i].id +'">'+ data.data[i].title +'</option>')
        }
     });

     $('#form-house-info').submit(function(e){
        e.preventDefault();//阻止默认提交get请求
        $(this).ajaxSubmit({
            type: 'post', // 提交方式 get/post
            url: '/home/publish_home/', // 需要提交的 url
            success: function(data) { // data 保存提交后返回的数据，一般为 json 数据
                // 此处可对 data 作相关处理
                location.href = '/home/newhouse/'
            }
        });
	});
	$('#form-house-image').submit(function(e){
	    e.preventDefault();
	    $(this).ajaxSubmit({
	        type:'POST',
	        url:'/home/publish_home_img/',
	        success:function(data){
	            location.href = '/home/myhouse/'
	        }
	    })
	})
 });