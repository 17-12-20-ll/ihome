var cur_page = 1; // 当前页
var next_page = 1; // 下一页
var total_page = 1;  // 总页数
var house_data_querying = true;   // 是否正在向后台获取数据

// 解析url中的查询字符串
function decodeQuery(){
    var search = decodeURI(document.location.search);
    return search.replace(/(^\?)/, '').split('&').reduce(function(result, item){
        values = item.split('=');
        result[values[0]] = values[1];
        return result;
    }, {});
}

// 更新用户点选的筛选条件
function updateFilterDateDisplay() {
    var startDate = $("#start-date").val();
    var endDate = $("#end-date").val();
    var $filterDateTitle = $(".filter-title-bar>.filter-title").eq(0).children("span").eq(0);
    if (startDate) {
        var text = startDate.substr(5) + "/" + endDate.substr(5);
        $filterDateTitle.html(text);
    } else {
        $filterDateTitle.html("入住日期");
    }
}


// 更新房源列表信息
// action表示从后端请求的数据在前端的展示方式
// 默认采用追加方式
// action=renew 代表页面数据清空从新展示
function updateHouseData(action) {
    //var areaId = $(".filter-area>li.active").attr("area-id");
    var areaName = $(".filter-area>li.active").text()
    if (undefined == areaName) areaName = "";
    var startDate = $("#start-date").val();
    var endDate = $("#end-date").val();
    var sortKey = $(".filter-sort>li.active").attr("sort-key");
    var params = {
        aname:areaName,
        sd:startDate,
        ed:endDate,
        sk:sortKey,
        p:next_page
    };
    //发起ajax请求，获取数据，并显示在模板中
    $.ajax({
       url:'/home/search_sort/',
       type:'POST',
       dataType:'json',
       data:params,
       success:function(data){
            $('.house-item').hide()
            $('.house-list font').hide()
            if (data.house_list == '暂无房源'){
                $('.house-list').append('<font color ="red">暂无房源!</font>')
            }else{
                for (j in data.house_list){
                html = '<li class="house-item">'
                html += '    <a href="/home/detail/?id='+ data.house_list[j].id +'"><img src="/static/house/'+ data.house_list[j].image +'"></a>'
                html += '    <div class="house-desc">'
                html += '        <div class="landlord-pic"><img src="/static/avatar/'+ data.house_list[j].user_avatar +'"></div>'
                html += '        <div class="house-price">￥<span>'+ data.house_list[j].price +'</span>/晚</div>'
                html += '        <div class="house-intro">'
                html += '            <span class="house-title">'+ data.house_list[j].title +'</span>'
                html += '            <em>出租'+ data.house_list[j].room_count +'间 - '+ data.house_list[j].order_count +'人已住过 - '+ data.house_list[j].address +'</em>'
                html += '        </div>'
                html += '    </div>'
                html += '</li>'
                $('.house-list').append(html)
            }
            }
       },
       error:function(e){

       }
    });
}

$(document).ready(function(){
    var queryData = decodeQuery();
    var startDate = queryData["sd"];
    var endDate = queryData["ed"];
    var areaName = queryData["aname"];
    if (!areaName) areaName = "位置区域";
    var data_list = '?aname='+areaName+'&sd='+startDate+'&ed='+endDate
    $.get('/home/search_result/'+data_list,function(data){
           for (i in data.area_list){
                if (areaName == data.area_list[i].name){
                    $('.filter-area').append('<li class="active" area-id="'+ data.area_list[i].id +'">'+ data.area_list[i].name +'</li>')
                }else{
                $('.filter-area').append('<li area-id="'+ data.area_list[i].id +'">'+ data.area_list[i].name +'</li>')
                }
           }
           for (j in data.house_list){
                html = '<li class="house-item">'
                html += '    <a href="/home/detail/?id='+ data.house_list[j].id +'"><img src="/static/house/'+ data.house_list[j].image +'"></a>'
                html += '    <div class="house-desc">'
                html += '        <div class="landlord-pic"><img src="/static/avatar/'+ data.house_list[j].user_avatar +'"></div>'
                html += '        <div class="house-price">￥<span>'+ data.house_list[j].price +'</span>/晚</div>'
                html += '        <div class="house-intro">'
                html += '            <span class="house-title">'+ data.house_list[j].title +'</span>'
                html += '            <em>出租'+ data.house_list[j].room_count +'间 - '+ data.house_list[j].order_count +'人已住过 - '+ data.house_list[j].address +'</em>'
                html += '        </div>'
                html += '    </div>'
                html += '</li>'
                $('.house-list').append(html)
           }
    });
    $("#start-date").val(startDate);
    $("#end-date").val(endDate);
    updateFilterDateDisplay();
    $(".filter-title-bar>.filter-title").eq(1).children("span").eq(0).html(areaName);
    $(".input-daterange").datepicker({
        format: "yyyy-mm-dd",
        startDate: "today",
        language: "zh-CN",
        autoclose: true
    });
    var $filterItem = $(".filter-item-bar>.filter-item");
    $(".filter-title-bar").on("click", ".filter-title", function(e){
        var index = $(this).index();
        if (!$filterItem.eq(index).hasClass("active")) {
            $(this).children("span").children("i").removeClass("fa-angle-down").addClass("fa-angle-up");
            $(this).siblings(".filter-title").children("span").children("i").removeClass("fa-angle-up").addClass("fa-angle-down");
            $filterItem.eq(index).addClass("active").siblings(".filter-item").removeClass("active");
            $(".display-mask").show();
        } else {
            $(this).children("span").children("i").removeClass("fa-angle-up").addClass("fa-angle-down");
            $filterItem.eq(index).removeClass('active');
            $(".display-mask").hide();
            updateFilterDateDisplay();
        }
    });
    $(".display-mask").on("click", function(e) {
        $(this).hide();
        $filterItem.removeClass('active');
        updateFilterDateDisplay();
        cur_page = 1;
        next_page = 1;
        total_page = 1;
        updateHouseData("renew");

    });
    $(".filter-item-bar>.filter-area").on("click", "li", function(e) {
        if (!$(this).hasClass("active")) {
            $(this).addClass("active");
            $(this).siblings("li").removeClass("active");
            $(".filter-title-bar>.filter-title").eq(1).children("span").eq(0).html($(this).html());
        } else {
            $(this).removeClass("active");
            $(".filter-title-bar>.filter-title").eq(1).children("span").eq(0).html("位置区域");
        }
    });
    $(".filter-item-bar>.filter-sort").on("click", "li", function(e) {
        if (!$(this).hasClass("active")) {
            $(this).addClass("active");
            $(this).siblings("li").removeClass("active");
            $(".filter-title-bar>.filter-title").eq(2).children("span").eq(0).html($(this).html());
        }
    })
})