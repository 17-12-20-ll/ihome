function hrefBack() {
    history.go(-1);
}

function getCookie(name) {
    var r = document.cookie.match("\\b" + name + "=([^;]*)\\b");
    return r ? r[1] : undefined;
}

function showErrorMsg() {
    $('.popup_con').fadeIn('fast', function() {
        setTimeout(function(){
            $('.popup_con').fadeOut('fast',function(){}); 
        },1000) 
    });
}

$(document).ready(function(){
    $(".input-daterange").datepicker({
        format: "yyyy-mm-dd",
        startDate: "today",
        language: "zh-CN",
        autoclose: true
    });
    $(".input-daterange").on("changeDate", function(){
        var startDate = $("#start-date").val();
        var endDate = $("#end-date").val();

        if (startDate && endDate && startDate > endDate) {
            showErrorMsg();
        } else {
            var sd = new Date(startDate);
            var ed = new Date(endDate);
            days = (ed - sd)/(1000*3600*24) + 1;
            var price = $(".house-text>p>span").html();
            var amount = days * parseFloat(price);
            $(".order-amount>span").html(amount.toFixed(2) + "(共"+ days +"晚)");
        }
    });
    var id = location.search.split('=')[1]
    $.get('/order/get_house/'+ id +'/',function(data){
       $('.house-text h3').text(data.data.title)
       $('.house-text p span').text(data.data.price)
       $('.house-info img').attr('src','/static/house/'+data.data.image)
       $('.submit-btn').click(function(){
       var begin_date = $('#start-date').val()  // 入住时间
       var end_date = $('#end-date').val()  //离开时间
       var house_price = $('.house-text p span').text()  //价格
                $.ajax({
                    url:'/order/submit_order/',
                    type:'POST',
                    dataType:'json',
                    data:{'house_id':id,'begin_date':begin_date,'end_date':end_date,'house_price':house_price},
                    success:function(data){
                    console.log(data)
                        if (data.msg == 'exist_order'){
                            alert('订单时间冲突')
                            return
                        }
                        if (data.msg == 'time_error'){
                            alert('订单入住时间不满足最大时间与最小时间')
                            return
                        }
                        alert('预定成功!')
                        location.href = '/order/my_order/'
                    },
                    error:function(e){
                        alert(2)
                    }
                })
        });
    });


})
