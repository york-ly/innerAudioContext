//index.js
//获取应用实例
const app = getApp()
var time = 0;
var step = 0;
const innerAudioContext = wx.createInnerAudioContext();
innerAudioContext.src = 'http://fs.w.kugou.com/201803181935/9aaf6e5039c2c78eff54f203e4db6ef9/G004/M05/0A/1B/RA0DAFS-eZWALQYiAEBw8KYtLCk118.mp3';
Page({
    data: {
        duration: 0,
        curTimeVal: 0,
        startSecond: "00:00",
        endSecond: "00:00",
        curval: 0,
        isSlider: false,
        animationData: {}
    },
    play: function () {
        var page = this
        var animation = wx.createAnimation({
            duration: 100,
            timingFunction: 'liner',
        })
        this.animation = animation

        if (time == 0) {
            time = setInterval(function () {
                animation.rotate(step += 1).step()
                this.setData({
                    animationData: animation.export()
                })
            }.bind(this), 50)
        }

        innerAudioContext.play();

        innerAudioContext.onPlay(     //没有这个事件触发，无法执行updatatime
            function (res) {
                page.updateTime()
            }
        )
    },
    handSliderStart: function () {
        console.log("手动滑动开始")
        this.setData({
            isSlider: true
        })
    },
    handSliderEnd: function () {
        console.log("手动滑动结束")
        this.setData({
            isSlider: false
        })
    },

    pause: function () {
        clearInterval(time);
        time = 0;
        innerAudioContext.pause();
    },

    updateTime: function () {
        var page = this

        innerAudioContext.onTimeUpdate(
            function (res) {
                console.log("运行onTimeUpdate中的回调函数")

                page.setData({
                    startSecond: page.processTime(innerAudioContext.currentTime)
                })
                if (!page.data.isSlider) {
                    page.setData({      //更新时把当前的值给slide组件里的value值。slide的滑块就能实现同步更新
                        duration: innerAudioContext.duration.toFixed(2) * 100,
                        curTimeVal: innerAudioContext.currentTime.toFixed(2) * 100,
                        endSecond: page.processTime(innerAudioContext.duration)
                    })
                }

            })
//播放到最后一秒
        if (innerAudioContext.duration.toFixed(2) - innerAudioContext.currentTime.toFixed(2) <= 0) {
            innerAudioContext.onEnded(
                function () {
                    page.setStopState()
                    console.log("运行了结束的函数")
                }
            )
        }

    },
    //对时间进行处理的函数
    processTime: function (fullsecond) {
        let fullSecond = Math.floor(fullsecond)
        let min = parseInt(fullSecond / 60)
        let second = fullSecond % 60
        let processStr = ""

        if (min < 10) {
            if (second < 10) {
                processStr = "0" + min + ":" + "0" + second
            } else {
                processStr = "0" + min + ":" + second
            }
        } else {
            if (second < 10) {
                processStr = min + ":" + "0" + second
            } else {
                processStr = min + ":" + second
            }
        }
        return processStr
    },

//拖动滑块

    slideBar: function (e) {
        var page = this;

        page.setData({curval: e.detail.value}) //滑块拖动的当前值

        innerAudioContext.seek(e.detail.value.toFixed(2) / 100); //让滑块跳转至指定位置

        innerAudioContext.onSeeked(
            function (res) {
                page.updateTime() //注意这里要继续出发updataTime事件
            }
        )

    },

    setStopState: function () {
        clearInterval(time);
        time = 0;
        this.setData({
            curTimeVal: 0,
            startSecond: "00:00"
        })
        innerAudioContext.stop()
    }
})


