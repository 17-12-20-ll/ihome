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


    $.get('/order/get_my_order/',function(data){
        for(i in data.data){
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
            if (data.data[i].status == "COMPLETE"){
                var status = '<font color="blue">已完成</font>'
            }
            if (data.data[i].status == "CANCELED"){
                var status = '<font color="yellow">订单取消</font>'
            }
            if (data.data[i].status == 'WAIT_COMMENT'){
                var status = '待评价'
            }
            if (data.data[i].msg == null || data.data[i].msg == ''){
                var msg = ''
            }else{
                var msg = data.data[i].msg
            }
            if (data.data[i].comment == null){
                var comment = ''
            }else{
                var comment = data.data[i].comment
            }
            html ='<li order-id='+ data.data[i].order_num +'>'
            html +='<div class="order-title">'
            html +='            <h3>订单编号：'+ data.data[i].order_num +'</h3>'
            html +='            <div class="fr order-operate">'
            html +='                <button type="button" class="btn btn-success order-comment" data-toggle="modal"'
            html +='                        data-target="#comment-modal">发表评价'
            html +='                </button>'
            html +='           </div>'
            html +='        </div>'
            html +='        <div class="order-content">'
            html +='            <img style="margin-top:10%;" src="/static/house/'+ data.data[i].image +'">'
            html +='            <div class="order-text">'
            html +='                <h3>订单</h3>'
            html +='                <ul>'
            html +='                   <li>房屋标题：'+ data.data[i].house_title +'</li>'
            html +='                   <li>创建时间：'+ data.data[i].create_date +'</li>'
            html +='                   <li>入住日期：'+ data.data[i].begin_date +'</li>'
            html +='                   <li>离开日期：'+ data.data[i].end_date +'</li>'
            html +='                   <li>合计金额：'+ data.data[i].amount+'元(共'+ data.data[i].days +'晚)</li>'
            html +='                   <li>订单状态：'
            html +='                       <span>'+ status +'</span>'
            html +='                   </li>'
            html +='                   <li>我的评价：'+ comment +'</li>'
            html +='                   <li>拒单原因：'+ msg +'</li>'
            html +='                </ul>'
            html +='            </div>'
            html +='        </div>'
            html +='    </li>'
            $('.orders-list').append(html)
            if (data.data[i].status == 'WAIT_ACCEPT'){
                $('li[order-id="'+ data.data[i].order_num +'"] button').text('取消订单')
                $('li[order-id="'+ data.data[i].order_num +'"] button').removeAttr('data-toggle')
                $('li[order-id="'+ data.data[i].order_num +'"] ul li:eq(6)').hide()//评价
                $('li[order-id="'+ data.data[i].order_num +'"] ul li:eq(7)').hide()//拒单
                $('li[order-id="'+ data.data[i].order_num +'"] button').click(function(e){
                id= $(this).parents('li').attr('order-id')
                        $.ajax({
                        url:'/order/canceled/'+ id +'/',
                        type:'PATCH',
                        dataType:'json',
                        success:function(data){
                            $('li[order-id="'+ data.id +'"] button').text('已取消')
                            $('li[order-id="'+ data.id +'"] button').attr('disabled','disabled')
                            $('li[order-id="'+ data.id +'"] .order-text li span').html('<font color="yellow">订单取消</font>')
                        },
                        error:function(e){
                            alert(2)
                        }
                       });
                });
            }
            if (data.data[i].status == 'REJECTED'){
                $('li[order-id="'+ data.data[i].order_num +'"] button').text('被拒')
                $('li[order-id="'+ data.data[i].order_num +'"] button').attr('disabled','disabled')
                $('li[order-id="'+ data.data[i].order_num +'"] ul li:eq(6)').hide()//评价
            }
            if (data.data[i].status == 'PAID'){
                $('li[order-id="'+ data.data[i].order_num +'"] button').text('待评价')
                $('li[order-id="'+ data.id +'"] button').attr('data-toggle','modal')
                $('li[order-id="'+ data.data[i].order_num +'"] ul li:eq(6)').hide()//评价
                $('li[order-id="'+ data.data[i].order_num +'"] ul li:eq(7)').hide()//拒单
            }
            if (data.data[i].status == 'WAIT_PAYMENT'){
                $('li[order-id="'+ data.data[i].order_num +'"] button').text('去支付')
                $('li[order-id="'+ data.data[i].order_num +'"] button').removeAttr('data-toggle')
                $('li[order-id="'+ data.data[i].order_num +'"] ul li:eq(6)').hide()//评价
                $('li[order-id="'+ data.data[i].order_num +'"] ul li:eq(7)').hide()//拒单
                $('li[order-id="'+ data.data[i].order_num+'"] button').click(function(){
                id = $(this).parents('li').attr('order-id')
                $.ajax({
                    url:'/order/go_pay/'+ id +'/',
                    type:'PATCH',
                    dataType:'json',
                    success:function(data){
                        $('li[order-id="'+ data.id +'"] button').text('待评价')
                        $('li[order-id="'+ data.id +'"] button').attr('data-toggle','modal')
                        $('li[order-id="'+ data.id +'"] .order-text li span').text('已支付')
                    },
                    error:function(e){
                        alert(2)
                    }
                });
                });
            }
            if (data.data[i].status == 'COMPLETE'){
                $('li[order-id="'+ data.data[i].order_num +'"] button').text('已完成')
                $('li[order-id="'+ data.data[i].order_num +'"] button').attr('disabled','disabled')
                $('li[order-id="'+ data.data[i].order_num +'"] ul li:eq(7)').hide()//拒单
            }
            if (data.data[i].status == "CANCELED"){
                $('li[order-id="'+ data.data[i].order_num +'"] button').text('已取消')
                $('li[order-id="'+ data.data[i].order_num +'"] button').attr('disabled','disabled')
                $('li[order-id="'+ data.data[i].order_num +'"] ul li:eq(7)').hide()//拒单
                $('li[order-id="'+ data.data[i].order_num +'"] ul li:eq(6)').hide()//评价
            }
            if (data.data[i].status == 'WAIT_COMMENT'){
            $('li[order-id="'+ data.data[i].order_num +'"] button').text('待评价')
            $('li[order-id="'+ data.id +'"] button').attr('data-toggle','modal')
            $('li[order-id="'+ data.data[i].order_num +'"] ul li:eq(7)').hide()//拒单
            $('li[order-id="'+ data.data[i].order_num +'"] ul li:eq(6)').hide()//评价
            }
            }
            $('.modal').on('show.bs.modal', centerModals);      //当模态框出现的时候
            $(window).on('resize', centerModals);
            $(".order-comment").on("click", function(){
                var orderId = $(this).parents("li").attr("order-id");
                $(".modal-comment").attr("order-id", orderId);
            });
    });

    //评价
    $('.modal-comment').click(function(){
    var order_id = $('.modal-comment').attr('order-id')
    var comment = $('#comment').val()
       $.ajax({
            url:'/order/go_comment/'+ order_id +'/',
            type:'PATCH',
            dataType:'json',
            data:{'comment':comment},
            success:function(data){
                $('li[order-id="'+ data.id +'"] button').text('已完成')
                $('li[order-id="'+ data.id +'"] button').attr('disabled','disabled')
                $('li[order-id="'+ data.id +'"] ul li:eq(6)').text(data.comment)
                $.ajax({
                    url:'/order/go_complete/'+ data.id +'/',
                    type:'PATCH',
                    dataType:'json',
                    success:function(data){
                        //不需要重载页面,只是用按钮确定就回到页面
                        location.reload()
                    },
                    error:function(e){
                        alert(2)
                    }
                });
                //返回到页面
            },
            error:function(e){
                alert(2)
            }
       });
    });
});