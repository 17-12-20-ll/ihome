function hrefBack() {
    history.go(-1);
}

function decodeQuery(){
    var search = decodeURI(document.location.search);
    return search.replace(/(^\?)/, '').split('&').reduce(function(result, item){
        values = item.split('=');
        result[values[0]] = values[1];
        return result;
    }, {});
}

$(document).ready(function(){
    $(".book-house").show();
    id = location.search.split('=')[1]
    $.get('/home/detail/'+id+'/',function(data){
        for(i in data.data.images){
            $('.swiper-wrapper').append('<li class="swiper-slide"><img src="/static/house/'+ data.data.images[i] +'"></li>')
        }
        var mySwiper = new Swiper ('.swiper-container', {
            loop: true,
            autoplay: 2000,
            autoplayDisableOnInteraction: false,
            pagination: '.swiper-pagination',
            paginationType: 'fraction'
        })
        $('.house-price span').text(data.data.price)
        $('.house-title').text(data.data.title)
        $('.landlord-name span').text(data.data.user_name)
        $('.house-info-list:first li').text(data.data.address)
        $('.landlord-pic img').attr('src','/static/avatar/'+data.data.user_avatar)
        $('.icon-house ~ .icon-text h3').text("出租" +data.data.room_count+"间")
        $('.icon-house ~ .icon-text p:first').text("房屋面积:" +data.data.acreage+"平米")
        $('.icon-house ~ .icon-text p:last').text("房屋户型:" +data.data.unit)
        $('.icon-user ~ .icon-text h3').text("宜住:" +data.data.capacity+"人")
        $('.icon-bed ~ .icon-text p').text(data.data.beds)
        $('.house-info-list:last li:eq(0) span').text(data.data.deposit)
        $('.house-info-list:last li:eq(1) span').text(data.data.min_days)
        if (data.data.max_days){
            $('.house-info-list:last li:eq(2) span').text(data.data.max_days)
        }else{
            $('.house-info-list:last li:eq(2) span').text('无限制')
        }
        for(i in data.data.facilities){
            $('.house-facility-list').append('<li><span class="'+ data.data.facilities[i].css +'"></span>'+ data.data.facilities[i].name +'</li>')
        }
        for(j in data.comment_list){
            if (!data.comment_list[j][1]){
                new_comment = '感觉不错'
            }else{
                new_comment = data.comment_list[j][1]
            }
            append_comment = '<ul class="house-comment-list">'
            append_comment += '    <li>'
            append_comment += '        <p>'+ data.comment_list[j][0].name +'<span class="fr">'+ data.comment_list[j][2] +'</span></p>'
            append_comment += '        <p>'+ new_comment +'</p>'
            append_comment += '    </li>'
            append_comment += '</ul>'
            $('.house-info:last').append(append_comment)
        }

    });
});
function order_booking(){
        var id = location.search.split('=')[1]
        $.get('/order/is_user/'+ id +'/',function(data){
            if (data.code == 200){
                location.href = '/order/booking/?id='+ id +''
            }
            if (data.code == 201){
                alert(data.msg)
            }
        });
}