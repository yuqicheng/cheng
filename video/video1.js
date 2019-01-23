








function showVideoSrc(url) {

    var time=(new Date()).valueOf();
    var id="roomVideo"+time;
    var html='<video   playsinline="true" poster="../img/timg.jpg"    class="video-js vjs-default-skin vjs-big-play-centered vjs-fluid" data-setup="{}"  id="'+id+'"></video>';
    layer.open({
        title:"播放窗口",
        type: 1,
        offset:"t",
        skin: 'layui-layer-demo', //样式类名
        closeBtn: 0, //不显示关闭按钮
        anim: 2,
        shadeClose: true, //开启遮罩关闭
        content: html,
        area:"100%",
    });
    new_player(id,url);
}

function showVideo(videoList,error) {
    var time=(new Date()).valueOf();
    console.log(videoList);

    if(videoList.length==0){
        layer.msg("未检索到信息");
        return;
    }
    $('.gallery').html("");
        for (var i = 0; i < videoList.length; i++) {
            var id="roomVideo"+time+i;
            var url = videoList[i].mrl;
            url=url+".m3u8";
            url=url.replace('rtmp','http');
            url=url.replace('1935','8000');



            url=url+error;
            var name=videoList[i].vname;

            if(name.indexOf("博野") != -1 ){
                url=url.replace('8000','1935');
            }
            if(flag){
                $('.gallery').append('<li><video  playsinline="true" poster="../img/timg.jpg"    class="video-js vjs-default-skin vjs-big-play-centered vjs-fluid" data-setup="{}"  id="'+id+'"></video><p >'+name+'</p></li>');
                new_player(id,url,name);
                videosreean(id);
            }else{
                $('.gallery').append('<li>' +
                    '                        <a onclick="showVideoSrc(\''+url+'\')">\n' +
                    '                            <img src="../img/timg.jpg" alt=""/>\n' +
                    '                        </a>\n' +
                    '                    <p >'+name+'</p></li>');
            }


        }

}

function new_player(viname,url,name){
    var play= videojs(viname,{
        bigPlayButton : true,
        textTrackDisplay : false,
        posterImage: false,
        errorDisplay : false,
        controlBar : false,
        width:"100%",
        height:"100%",
        controls:true,//控制条：boolean
        preload:"auto",//预加载：string；'auto'|'true'|'metadata'|'none'
        autoplay:true,//自动播放：boolean
        muted:true,//静音：boolean
        sources:[
            {
                src:url,
                type:'application/x-mpegURL'
            }
            ],

        controlBar : {
            captionsButton: false,
            chaptersButton : false,
            liveDisplay:false,
            playbackRateMenuButton: false,
            subtitlesButton:false

        }
    },function(){
        this.on('loadedmetadata',function(){
            console.log('loadedmetadata');
            //加载到元数据后开始播放视频
            console.log("id:"+play.id());
            startVideo(play,url,name);
        })
        this.on('ended',function(){
            console.log('ended')
        })
        this.on('firstplay',function(){
            console.log('firstplay')
        })
        this.on('loadstart',function(){
            //开始加载
            console.log('loadstart')
        })
        this.on('loadeddata',function(){
            console.log('loadeddata')
        })
        this.on('seeking',function(){
            //正在去拿视频流的路上
            console.log('seeking')
        })
        this.on('seeked',function(){
            //已经拿到视频流,可以播放
            console.log('seeked')
        })
        this.on('waiting',function(){
            console.log('waiting')
        })
        this.on('pause',function(){
            console.log('pause')
        })
        this.on('play',function(){
            console.log('play')
        })
    })
}

function startVideo(play,url,name) {
    var isVideoBreak;
    play.play();
    // //微信内全屏支持
    // document.getElementById('roomVideo').style.width = window.screen.width + "px";
    // document.getElementById('roomVideo').style.height = window.screen.height + "px";
    //判断开始播放视频，移除高斯模糊等待层
    var isVideoPlaying = setInterval(function(){
        var currentTime = play.currentTime();
        if(currentTime > 0){
            $('.vjs-poster').remove();
            clearInterval(isVideoPlaying);
        }
    },200)

    //判断视频是否卡住，卡主3s重新load视频
    var lastTime = -1,
        tryTimes = 0;
    clearInterval(isVideoBreak);
    isVideoBreak = setInterval(function(){
        var currentTime = play.currentTime();
        console.log('currentTime'+currentTime+'lastTime'+lastTime);
        if(currentTime == lastTime){
            //此时视频已卡主3s
            //设置当前播放时间为超时时间，此时videojs会在play()后把currentTime设置为0
            play.currentTime(currentTime+10000);
            play.play();
            //尝试5次播放后，如仍未播放成功提示刷新

            if(tryTimes > 5){
                window.location.reload();
            }

            if(++tryTimes > 1){
                shuaxin(play.id(),url,name);
            }
        }else{
            lastTime = currentTime;
            tryTimes = 0;
        }
    },3000)
}

function  shuaxin(id,url,name) {
    var newid="video"+(new Date()).valueOf();
    var html='<video  playsinline="true" poster="../img/timg.jpg"    class="video-js vjs-default-skin vjs-big-play-centered vjs-fluid" data-setup="{}"  id="'+newid+'"></video>';
      if(name==undefined||name==null){

      }else{
          html=html+'<p >'+name+'</p>';
      }
    $("#"+id).parent().html(html);
    new_player(newid,url,name);
    videosreean(newid);
}

function postRequest(postdata) {
        $.ajax({
            type: "POST",
            //async:true,
            url: "/main/getVideo1",
            dataType: "json",
            timeout: 10000,
            data: postdata,
            success: function (jsondata) {
                // console.log(jsondata);
                if (jsondata != null) {
                    if (jsondata.status === 'Success') {
                        var str = "数据加载完成";
                        layer.msg( str);
                        video_list = jsondata.result;

                        showVideo(video_list,jsondata.error);
                    } else if(jsondata.status === 'LoginTimeOut'){
                        layer.msg(jsondata.error);
                        window.location.href ="/login";
                    }else {
                        var str = jsondata.error;
                        layer.msg( str);
                    }

                } else {
                    var str = "对象为空";
                    layer.msg( str);
                }

            },
            error: function () {
                var str = "系统错误";
                layer.msg(str);
            }
        })
    }
function videosreean(name){
    videojs(name).ready(function() {
        this.hotkeys({
            volumeStep: 0.1,
            seekStep: 5,
            enableVolumeScroll: false, //禁用鼠标滚轮调节问音量大小
            enableModifiersForNumbers: false
        });
    });
}













