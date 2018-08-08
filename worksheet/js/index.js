/**
 * Created by th on 2018/8/1.
 */
$(function () {
  var $hover = $('.hover')
  $hover.mouseenter(function () {
    $(this).show()
  }).mouseleave(function () {
    $(this).hide()
  })
  function initpicker() {
    var o= {}
    var list = $('.fillInfor .infor_list')
    $('.picker').colpick({
      flat:true,
      layout:'hex',
      color:'#eeeeee'
    });
    list.eq(list.length-1).find('.picker .colpick_submit').click(function () {
      list.eq(list.length-1).find('.color span').eq(1).css('backgroundColor',list.eq(list.length-1).find('.colpick_current_color').css('backgroundColor'))
      $('.color .picker').hide()
    })

    list.eq(list.length-1).find('.color span').eq(1).css('backgroundColor',(o.color?o.color:'#eee')).click(function () {
      $('.fillInfor .picker').show()
    })
  }
  // post 请求
  var myName='',enterBtn=false,enterView=false;
  function sendPost(data,fn) {
    var json = JSON.stringify(data)
    $(".loading").show()
    $.ajax({
      type: "POST",
      url: "http://192.168.60.129:8080/workflow/",
      data: json,
      success: function(msg){
        $(".loading").hide()
        fn( msg );
      },
      error: function (mes) {
        (mes.status === 500)&&document.write(mes.responseText);
        alert("数据出错")
      }
    });
  }
  function login() {
    var $login = $(".login"),localMes = localStorage.getItem('donews_Web_worksheet')
    localMes && $login.find('input').val(localMes)

    function enter() {
      myName = $login.find('input').val()
      var r = (localMes === myName)?true:confirm("您的姓名为"+myName)
      if(r){
        if(myName){
          (localMes!=myName) && localStorage.setItem('donews_Web_worksheet',myName)
          sendPost({action:"login",user:myName},function (data) {
            if(data.code===0){
              $login.hide()
              $("#main").show()
              initDataView()
            }
          })

        }else {
          alert('请输入您的姓名')
        }
      }
    }
    $login.find('button').click(enter)
    $(document).on('keyup',function keyUp(e){
      if($login.css("display")==="block"){
        (e.keyCode===13)&&enter()
      }
    })
  }
  login()

  function initDataView(dayLength) {
    var dL =  dayLength?dayLength:7, // 显示天数 默认7天
      nowDate = new Date(),  //当前时间
      nowYear = nowDate.getFullYear(),
      nowMonth = nowDate.getMonth()+1,
      nowDay = nowDate.getDate(),
      nowIndex=0,
      resultList=[],
      newDate=new Date(nowYear,nowMonth-1,nowDay);
    var $topFix = $('.topFix'),ismove=false
    $('.btn').click(function () {
      if(!ismove){
        ismove = true
        $topFix.hide()
        var $wrapper = $(".dataView .wrapper");
        if($(this).hasClass('rightBtn')){
          //向右
          nowIndex++
          newDate = new Date(newDate.getTime()+1000*3600*24*7)
          if(nowIndex>=resultList.length){
            $wrapper.append('<div class="list fl"><ul><li></li></ul></div>')
            $wrapper.css({
              width: $('.dataView .list').length*910,
            })
            getViewList(newDate,'move')
          }

        }else {
          //向左
          nowIndex--
          newDate = new Date(newDate.getTime()-1000*3600*24*7)
          if(nowIndex<0){
            nowIndex=0
            $wrapper.prepend('<div class="list fl"><ul><li></li></ul></div>')
            $wrapper.css({
              width: $('.dataView .list').length*910,
              left:-910
            })
            getViewList(newDate,'leftmove')
          }
        }
        $wrapper.animate({
          left: -910*nowIndex
        },500)
        $topFix.html('<span>姓名</span>').append($wrapper.find('.list').eq(nowIndex).find('li').eq(0).html())
        setTimeout(function () {
          $topFix.show()
          ismove = false
        },500)
      }
    })
    //
    function getViewList(date, move) {
      var dates = getdates(date),
        dzDates = dz(dates)
      function dz(num) {
        var arr=[]
        for(var i=0;i<num.length;i++){
          var arr1 = num[i].split('.')
          $.each(arr1,function (i,o) {
            if(o<10){
              o = '0' + o
            }
            arr1[i]= o
          })
          arr.push(arr1.join('-'))
        }

        return arr
      }
      //  初始化头部日期
      var nowList = $(".dataView .list").eq(nowIndex),
        $firstLi = nowList.find('li').eq(0), liHtml = '';
      $.each(dates,function (i,o) {
        var arr = o.split('.');
        var color ='deepskyblue'
        if(i>4){
          color ='cadetblue'
        }
        if( o === (nowYear+"."+nowMonth+"."+nowDay) ){
          color = '#e65b05'
        }
        if(parseInt(arr[0]) === nowYear){
          liHtml += '<span style="background: '+ color +'">'+arr[1]+ "."+arr[2]+'</span>'
        }else {
          liHtml += '<span style="background: '+ color +'">'+ o +'</span>'
        }

      })
      $firstLi.html(liHtml)
      // initTopFix()
      $('.topFix').html('<span>姓名</span>').append(liHtml)
      var $dataView = nowList,$name = $(".name ul")
      //获取列表信息
      var startime = dzDates[0]
      sendPost({"action":"works","name":myName, "day":startime, "num":7},function (data) {
        var result = data.result;
        (move==='leftmove')?resultList.unshift(result):resultList.push(result)
        if(result.length===0){
          if(move){
            var liList = '',$namelength = $('.name li').length-1
            for(var i=0;i<$namelength;i++){
              liList+='<li><span></span><span></span><span></span><span></span><span></span><span></span><span></span></li>'
            }
            $dataView.find('ul').html($firstLi).append(liList)
          }else {
            $name.html($name.find('li').eq(0)).append('<li>'+myName+'</li>')
            console.log($dataView.find('ul'))
            $dataView.find('ul').html($firstLi).append('<li><span></span><span></span><span></span><span></span><span></span><span></span><span></span></li>')
          }
          initMain()
        }else {
          var nameHtml = '<li>'+myName+'</li>',arrName=[myName],datalist='';
          if(!move){
            $.each(resultList[nowIndex],function (i,o) {
              if(arrName.indexOf(o.user)===-1){
                arrName.push(o.user)
                nameHtml+='<li>'+o.user+'</li>'
              }
            })
            $name.html($name.find('li').eq(0)).append(nameHtml)
          }else {
            var $nameList = $('.name li');
            $.each($nameList,function (i,o) {
              if(i>1){
                arrName.push($(o).html())
              }
            })
          }
          $.each(arrName,function (i,o) {
            var spans=''
            $.each(dzDates,function (j,q) {
              var obj = getdatas(o,q,resultList[nowIndex])[0]
              if(!obj){
                obj={}
              }
              var color = '#eee'
              if(j>4){
                color = 'lightblue'
              }
              spans += '<span data="'+ obj.id +'" style="background: '+(obj.color?obj.color:color)+'">'+  (obj.project?obj.project:"") +'</span>'
            })
            datalist +='<li>'+ spans +'</li>'
          })
          $dataView.find('ul').html($firstLi).append(datalist)

  //   鼠标划入 按钮显示
          $dataView.mouseenter(function () {
            enterView = true
            $(".btn").stop().animate({
              opacity: 0.5
            },300)
          }).mouseleave(function () {
            enterView = false
            setTimeout(function () {
              if(!enterBtn){
                $(".btn").stop().animate({
                  opacity: 0
                },300)
              }
            },20)
          })
        }
        $('.dataView').css('height',$dataView.css('height'))
        // 点击显示 任务
        $.each($dataView.find('li').eq(1).find('span'),function (i,o) {
          o.onclick = function () {

            $('.fillInfor .tips').hide()
            //  修改添加 信息
            var id = $(this).attr('data')
            var $self = $(this),$fillinfor = $('.fillInfor'),thisData = getdatas(myName,dzDates[$self.index()],resultList[nowIndex])
            $fillinfor.show()
            $fillinfor.find('.wrapper').html('')
            infordata = {user:myName,day:dzDates[$self.index()]}
            inforpage = 0
            if(thisData.length==0){
              cloneinforList()
              $('.fillInfor .infor_list').find('.color span').eq(1).css('backgroundColor',(o.color?o.color:$self.css('backgroundColor'))).click(function () {
                $('.fillInfor .picker').show()
              })
            }else {
              $.each(thisData,function (i,o) {
                cloneinforList()
                var $infor = $('.fillInfor .infor_list').eq(i)
                $infor.attr('data',o.id)
                $infor.find('.project input').val(o.project)
                initBlock(o.stage,$('.fillInfor .infor_list').eq(i).find('.block'))
                $infor.find('.describe textarea').val(o.content&&o.content.replace(/<br>/g,'\n'));
                $infor.find('.color .bc').css('backgroundColor',(o.color?o.color:$self.css('backgroundColor'))).click(function () {
                  $('.fillInfor .picker').show()
                })
              })
            }
            infor_listmove('fast')

            // 点击确定
            var removeid = []
            $('.fillInfor .submit div')[0].onclick = function () {

              if(removeid.length>=1){
                $.each(removeid,function (i,o) {
                  var dataarr=[],id=o
                  $.each(resultList[nowIndex],function (i,o) {
                    if(o.id!=id){
                      dataarr.push(o)
                    }
                  })
                  resultList[nowIndex] = dataarr
                  sendPost({action:'delwork',id:id},function (data) {})
                })
              }
              var arr=[],$infor = $('.fillInfor .infor_list')
              $.each($infor,function (i,o) {
                var name =$(o).find('.project input').val(),
                  json = {"user":myName, "day":dzDates[$self.index()], "content":$(o).find('.describe textarea').val().replace(/\n/g,'<br>'), "project": name, "stage":$(o).find('.block i').html(), "color":$(o).find('.bc').css('backgroundColor')}
                if($(o).attr('data')){
                  json.id=parseInt($(o).attr('data'))
                }
                arr.push(json)
              })

              // 判断 项目名称是否为空
              var isSendPost = true

              $.each(arr,function (i,o) {
                if(!o.project){
                  isSendPost = false;
                  $infor.eq(i).find('.tips').show()
                  inforpage = i
                  infor_listmove()
                  return false
                }
              })
              if(isSendPost||(!isSendPost&&arr.length==1)){
                $self.html(arr[0].project).css('backgroundColor',$infor.eq(0).find('.bc').css('backgroundColor'))
                $infor.eq(i).find('.tips').hide()
                $('.fillInfor').hide()
                if(isSendPost){
                  $.each(arr,function (i,o) {
                    if(o.id){
                      //  修改
                      o.action = 'modwork'
                      var id = o.id,dats = o
                      sendPost(o,function (data) {
                        var arr=[]
                        $.each(resultList[nowIndex],function (i,o) {
                          if(o.id!=id){
                            arr.push(o)
                          }else{
                            arr.push(dats)
                          }
                        })
                        resultList[nowIndex] = arr
                      })
                    }else {
                      // 添加
                      o.action= 'addwork'
                      sendPost(o,function (data) {
                        o.id = parseInt(data.message)
                        if(!$self.attr('data')){
                          $self.attr('data',data.message)
                        }
                        resultList[nowIndex].push(o)
                      })
                    }
                  })
                }
              }
            }
            // 取消
            $('.fillInfor .submit div')[1].onclick = function () {
              $('.fillInfor').hide()
            }

            $('.fillInfor .project input').focus(function () {
              $('.fillInfor .tips').hide()
            })
              //  删除

            $(".fillInfor .remove")[0].onclick= function () {
              var $inforlist = $(".fillInfor .wrapper .infor_list"),arr=[],id=parseInt($inforlist.eq(inforpage).attr('data')),dataarr=[]
              if(id){
                //保存id 点击确定时 删除数据
                removeid.push(id)
              }
              if($inforlist.length>1){
                $.each($inforlist,function (i,o) {
                  if(i!=inforpage){
                    arr.push(o)
                  }
                })
                $(".fillInfor .wrapper").html('').append(arr).css('width',614*$(".fillInfor .wrapper .infor_list").length)
                if( inforpage > ($(".fillInfor .wrapper .infor_list").length-1)){
                  inforpage--
                  infor_listmove()
                }else {
                  inforpage--
                  infor_listmove('fast')
                  inforpage++
                  infor_listmove()
                }
              }else {
                $(".fillInfor .wrapper").html('')
                cloneinforList()
                initpicker()
              }
            }
          }
        })
        // 鼠标滑过显示任务
        $.each($dataView.find('li'),function (i,o) {
          if(i>0){
            $(o).find('span').mouseenter(function () {
              $hover.show().css({
                left:$(this).offset().left+70,
                top: $(this).offset().top+18
              })
              var datalist=getdatas(arrName[$(this).parent().index()-1],dzDates[$(this).index()],resultList[nowIndex])
              $hover.html('')
              $.each(datalist,function (i,o) {
                var obj = o;
                if(!obj){
                  obj={}
                }
                var pj=obj.project?obj.project:'',
                  cn=obj.content?obj.content:'',
                  pr=obj.stage?obj.stage/10*100+"%":'';
                $hover.append("<div class='pj clearfix'>"+
                    "            <div class='tle fl'>项目：</div>"+
                    "            <div class='des fl'>"+pj+"</div>"+
                    "        </div>"+
                    "        <div class='cn clearfix'>"+
                    "            <div class='tle fl'>描述：</div>&nbsp;"+
                    "            <div class='fl des'>"+cn+"</div>"+
                    "        </div>"+
                    "        <div class='pr clearfix'>"+
                    "            <div class='tle fl'>进度：</div>"+
                    "            <div class='fl des'>"+pr+"</div>"+
                    "        </div>"+
                    "        <div class='line'></div>"
                )
              })
            }).mouseleave(function () {
              $hover.hide()
            })
          }
        })
      })
    }
    getViewList(newDate)
    initMain()
    function getdates(date) {//获取显示时间段
      var nowYear = date.getFullYear(),
        nowMonth = date.getMonth()+1,
        nowDay = date.getDate(),
        nowWeek = date.getDay(),
        preDay=nowDay-nowWeek+1,preMonth=nowMonth,preYear=nowYear;
      function preMonthDay() {
        var lastDay =  MonthLastDay(new Date(preYear,preMonth-2))
        if(preDay<0){
          preMonth--
          if(preMonth<0){
            preYear--;
            preMonth = 12
          }
          preDay = preDay+lastDay
          if(preDay<0){
            preMonthDay()
          }
        }
      }
      preMonthDay()

      var dates = [preYear+"."+preMonth+"."+preDay],time = new Date(preYear,preMonth-1,preDay)
      for(var i=1;i<7;i++){
        var times = new Date(time.getTime()+1000*3600*24*i),
          year = times.getFullYear(),
          month = times.getMonth()+1,
          day = times.getDate()
        dates.push(year+"."+month+"."+day)
      }
      return dates
    }
    function MonthLastDay(date) { //获取这个月的 最后一天
      var month = new Date(date.getTime()).getMonth()+1,
        day = new Date(date.getTime()).getDate();
      for(var i=28;i<=32;i++){
        var dates = date.getTime() + (i-day)*1000*3600*24;
        if((new Date(dates).getMonth()+1)!=month){
          return (i-1)
        }
      }
    }
  }
  function initMain() {
    var mainHeight = parseInt(($(window).height()-8)/30)*30+1
    if($(".dataView").height()>mainHeight){
      $("#main").css({
        overflowY:'auto'
      })
    }else {
      $("#main").css({
        overflowY:'inherit'
      })
    }
    $(".btn").css('top','50%').mouseenter(function () {
      enterBtn = true
      $('.btn').css('opacity','0.5')
      $(this).css('opacity','0.7')
    }).mouseleave(function () {
      enterBtn = false
      $(this).css('opacity','0.5')
      setTimeout(function () {
        if(!enterView){
          $('.btn').css('opacity','0')
        }
      },20)

    })
    $("#main").css({
      maxHeight: mainHeight,
      margin: ($(window).height()-mainHeight)/2+'px auto'
    }).scroll(function () {
      $(".btn").css('top',mainHeight/2+$(this).scrollTop())
      $('.topFix').css("top",$(this).scrollTop())
    })

  }

  $(window).resize(function () {
    initMain()
  })
  var $block=$('.block')
  function initBlock(num,el) {
    if(num){
      el.find('span i').html(num)
      $.each(el.children('div'),function (i,o) {
        if($(o).index()<num){
          $(o).css('backgroundColor','#24cf4c')
        }else {
          $(o).css('backgroundColor','#fff')
        }
      })
    }else {
      $block.find('span i').html(0)
      $block.children('div').css('backgroundColor','#fff')
    }
  }
  // 进度点击事件
  function blockclick() {
    $.each($('.fillInfor .infor_list'),function (i,o) {
      $(o).find('.block').children('div').click(function () {
        $(this).css('backgroundColor','#24cf4c')
        var $self = $(this)
        $(this).siblings('span').children('i').html($self.index()+1)
        $.each($(this).siblings('div'),function (i,o) {
          if($(o).index()<$self.index()){
            $(o).css('backgroundColor','#24cf4c')
          }else {
            $(o).css('backgroundColor','#fff')
          }
        })
      })
    })
  }
  blockclick()
  initBlock()
  //由id获取数据
  function getlistData(id,data){
    var arr ={}
    $.each(data,function (i,o) {
      if(o.id==id){
        arr = o
      }
    })
    return arr
  }
  //由姓名、日期获取数据
  function getdatas(name,day,date) {
    var arr = [],obj=[]
    $.each(date,function (i,o) {
      if(o.user===name){
        arr.push(o)
      }
    })
    $.each(arr,function (i,o) {
      if(o.day === day){
        obj.push(o)
      }
    })
    return obj
  }

//  fillinfor内的点击事件
  var inforpage = 0,$page = $(".fillInfor .inforBtn .page"),informove =false,infordata={};

  //  添加
  $(".fillInfor .add").click(function () {
    if(informove){
      return
    }
    cloneinforList()
    inforpage = $(".fillInfor .wrapper .infor_list").length-1
    infor_listmove()
  })

  //  向左
  $(".fillInfor .inforBtn .left").click(function () {
    if(inforpage>0 && !informove){
      inforpage--
      infor_listmove()
    }

  })
  //  向右
  $(".fillInfor .inforBtn .right").click(function () {
    if(informove){
      return
    }
    if(inforpage<($(".fillInfor .wrapper .infor_list").length-1) && !informove){
      inforpage++
      infor_listmove()
    }
  })


  //复制infor_list
  function cloneinforList() {
    var newinfor_list ="<div class='infor_list fl'>"+
      "                   <div class='dataname clearfix'>"+
      "                        <div class='data fl'>"+
      "                            <span>日期：</span> <span>"+infordata.day+"</span>"+
      "                        </div>"+
      "                        <div class='yourName fl'>"+
      "                            <span>姓名：</span><span>"+infordata.user+"</span>"+
      "                        </div>"+
      "                    </div>"+
      "                    <div class='project'>"+
      "                        <span>项目：</span><input type='text' placeholder=''> <span class='tips'>请填写项目名称</span>"+
      "                    </div>"+
      "                    <div class='describe clearfix'>"+
      "                        <span class='fl'>描述：</span> <textarea  class='fl' rows='3'></textarea>"+
      "                    </div>"+
      "                    <div class='progress clearfix'>"+
      "                        <span class='fl'>进度：</span>"+
      "                        <div class='block fl clearfix' >" +
      "<div></div><div></div><div></div><div></div><div></div><div></div> <div></div><div></div><div></div><div></div>"+
      "                            <span><i>0</i>/10</span>"+
      "                        </div>"+
      "                    </div>"+
      "                    <div class='color clearfix'>"+
      "                        <span class='fl'>背景:</span> <span class='fl bc'></span> <div class='picker'></div>"+
      "                    </div>"+
      "                </div>";
    $(".fillInfor .wrapper").append(newinfor_list).css('width',614*$(".fillInfor .wrapper .infor_list").length)
    initpicker()
    blockclick()
  }
  //infor_list 移动
  function infor_listmove(str) {
    var speed=500
    if(str){
      speed=0
    }
    informove = true
    $(".fillInfor .wrapper").animate({
      left: -614*inforpage
    },speed)

    $page.find(".now").html(inforpage+1)
    $page.find(".tol").html($(".fillInfor .wrapper .infor_list").length)
    setTimeout(function () {
      informove = false
    },speed)
  }

})