//模态框居中的控制
function centerModals(){
    $('.modal').each(function(i){   //遍历每一个模态框
        var $clone = $(this).clone().css('display', 'block').appendTo('body');    
        var top = Math.round(($clone.height() - $clone.find('.modal-content').height()) / 2);
        top = top > 0 ? top : 0;
        $clone.remove();
        $(this).find('.modal-content').css("margin-top", top-30);  //修正原先已经有的30个像素
    });
}

function getCookie(name) {
    var r = document.cookie.match("\\b" + name + "=([^;]*)\\b");
    return r ? r[1] : undefined;
}

$(document).ready(function(){
    $.get('/order/get_other_order/',function(data){
       for (i in data.data){
           if (data.data[i].status == "WAIT_ACCEPT"){
                var status = '待接单'
            }
            if (data.data[i].status == "WAIT_PAYMENT"){
                var status = '待支付'
            }
            if (data.data[i].status == "REJECTED"){
                var status = '<font color="red">已拒单</font>'
            }
            if (data.data[i].status == "PAID"){
                var status = '<font color="green">已支付</font>'
            }
            if (data.data[i].status == 'COMPLETE'){
                var status = '<font color="blue">已完成</font>'
            }
            if (data.data[i].status == 'WAIT_COMMENT'){
                var status = '待评价'
            }
            if (data.data[i].status == "CANCELED"){
                var status = '<font color="yellow">订单取消</font>'
            }
            if (data.data[i].comment == null){
                var comment = ''
            }else{
                var comment = data.data[i].comment
            }
           html = '<li order-id='+ data.data[i].order_num +'>'
           html += '     <div class="order-title">'
           html += '         <h3>订单编号：<span>'+ data.data[i].order_num +'</span></h3>'
           html += '        <div class="fr order-operate">'
           html += '             <button type="button" class="btn btn-success order-accept" data-toggle="modal"'
           html += '                     data-target="#accept-modal">接单'
           html += '             </button>'
           html += '             <button type="button" class="btn btn-danger order-reject" data-toggle="modal"'
           html += '                     data-target="#reject-modal">拒单'
           html += '             </button>'
           html += '         </div>'
           html += '     </div>'
           html += '     <div class="order-content">'
           html += '         <img src="/static/house/'+ data.data[i].image +'">'
           html += '         <div class="order-text">'
           html += '             <h3>'+ data.data[i].house_title +'</h3>'
           html += '             <ul>'
           html += '                 <li>创建时间：'+ data.data[i].create_date +'</li>'
           html += '                 <li>入住日期：'+ data.data[i].begin_date +'</li>'
           html += '                 <li>离开日期：'+ data.data[i].end_date +'</li>'
           html += '                 <li>合计金额：'+ data.data[i].amount +'(共'+ data.data[i].days +'晚)</li>'
           html += '                 <li>订单状态：'
           html += '                     <span>'+status+'</span>'
           html += '                 </li>'
           html += '                 <li>客户评价： '+ comment +'</li>'
           html += '             </ul>'
           html += '         </div>'
           html += '     </div>'
           html += ' </li>'
           $('.orders-list').append(html)
           if (data.data[i].status != 'WAIT_ACCEPT'){
                $('li[order-id="'+ data.data[i].order_num +'"] button').hide();
           }
           if (data.data[i].status == 'WAIT_ACCEPT'){
                $('li[order-id="'+ data.data[i].order_num +'"] ul li:eq(5)').hide()
           }
           if (data.data[i].status == "PAID"){
                $('.order-text li:eq(4) span').text('已支付')
                $('li[order-id="'+ data.data[i].order_num +'"] ul li:eq(5)').hide()
           }
           if (data.data[i].status == 'WAIT_PAYMENT'){
                $('li[order-id="'+ data.data[i].order_num +'"] ul li:eq(5)').hide()
           }
           if (data.data[i].status == "REJECTED"){
                $('li[order-id="'+ data.data[i].order_num +'"] ul li:eq(5)').hide()
           }
           if (data.data[i].status == "CANCELED"){
                $('li[order-id="'+ data.data[i].order_num +'"] ul li:eq(5)').hide()
           }
           if (data.data[i].status == 'WAIT_COMMENT'){
                $('li[order-id="'+ data.data[i].order_num +'"] ul li:eq(5)').hide()
           }
       }
       $('.modal').on('show.bs.modal', centerModals);      //当模态框出现的时候,为模拟框的两个确定按钮添加订单id属性
       $(window).on('resize', centerModals);
       $(".order-accept").on("click", function(){
           var orderId = $(this).parents("li").attr("order-id");
           $(".modal-accept").attr("order-id", orderId);
       });
       $(".order-reject").on("click", function(){
           var orderId = $(this).parents("li").attr("order-id");
           $(".modal-reject").attr("order-id", orderId);
       });
    });

    // 确定接单
    $('.btn-primary:eq(0)').click(function(e){
        var order_id = $(this).attr('order-id')
        $.ajax({
            url:'/order/take_order/'+ order_id +'/',
            type:'PATCH',
            dataType:'json',
            success:function(data){
            location.reload();
            },
            error:function(e){
                console.log('error')
            }
        });
    });

    // 拒绝订单  refuse_order
    $('.btn-primary:eq(1)').click(function(){
       var order_id = $(this).attr('order-id')
       var refuse_reason = $('#reject-reason').val()
       $.ajax({
            url:'/order/refuse_order/'+ order_id +'/',
            type:'PATCH',
            dataType:'json',
            data:{'refuse_reason':refuse_reason},
            success:function(data){
                location.reload()
            },
            error:function(e){
            }
       });
    });

});