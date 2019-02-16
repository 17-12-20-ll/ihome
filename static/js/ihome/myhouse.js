$(document).ready(function(){
    $(".auth-warn").show();
    $.get('/home/get_myhouse/',function(data){
        for (i in data.data){
            html = '<li><a href="/home/detail/?id='+ data.data[i].id +'">'
            html += '<div class="house-title">'
            html += '<h3> —— '+ data.data[i].title +'</h3>'
            html += '</div>'
            html += '<div class="house-content">'
            html += '<img src="/static/house/'+ data.data[i].image +'">'
            html += '<div class="house-text">'
            html += '<ul>'
            html += '<li>位于：'+ data.data[i].address +'</li>'
            html += '<li>价格：￥'+ data.data[i].price +'/晚</li>'
            html += '<li>发布时间：'+ data.data[i].create_time +'</li>'
            html += '</ul>'
            html += '</div>'
            html += '</div>'
            html += '</a>'
            html += '</li>'
            $('#houses-list').append(html)
        }
    })
})