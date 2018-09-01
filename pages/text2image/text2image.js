// pages/text2image/text2image.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    windowWidth: 0,
    contentHeight: 0,
    content: '',
    lineHeight: 30,
    fontColorIndex: 0,
    fontColors: [
      'black',
      'red',
      'white',
      'green'
    ],
    backgroundImage: '../../src/images/leaves.png',
    hasGenerate: false
  },

  onLoad: function (options) {
    let that = this;

    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          windowWidth: res.windowWidth
        })
      }
    });
  },

  parseContent: function () {
    let that = this;

    let i = 0;
    let lineNum = 1;
    let thinkStr = '';
    let thinkList = [];
    
    for (let item of that.data.content) {
      if (item == '\n') {
        thinkList.push(thinkStr);
        thinkList.push('a');
        i = 0;
        thinkStr = '';
        lineNum++;
      } else if (i === 19) {
        thinkList.push(thinkStr);
        i = 1;
        thinkStr = item;
        lineNum++;
      } else {
        thinkStr += item;
        i++;
      }
    }

    thinkList.push(thinkStr);

    return thinkList;
  },

  drawBackground: function (ctx) {
    ctx.drawImage(this.data.backgroundImage, 0, 0, this.data.windowWidth, this.data.contentHeight);
  },

  drawFont: function (ctx, content, height) {
    ctx.setFontSize(16);
    ctx.setFillStyle(this.data.fontColors[this.data.fontColorIndex]);
    ctx.setTextAlign('center');
    ctx.fillText(content, this.data.windowWidth / 2, height);
  },

  clearCanvas: function (ctx, width, height) {
    ctx.clearRect(0, 0, width, height);
  },

  createNewImg: function (thinkList) {
    let that = this;

    let lineNum = thinkList.length;

    let ctx = wx.createCanvasContext('myCanvas');

    that.clearCanvas(ctx, that.data.windowWidth, that.data.contentHeight);

    let height = 60;

    let contentHeight = (lineNum - 1) * that.data.lineHeight + 2 * height;

    that.setData({
      contentHeight: contentHeight
    });

    that.drawBackground(ctx, contentHeight);

    for (let item of thinkList) {
      if (item !== 'a') {
        that.drawFont(ctx, item, height);
        height += that.data.lineHeight;
      }
    }

    ctx.draw();
  },

  generateImage: function () {
    let thinkList = this.parseContent();

    this.createNewImg(thinkList);

    this.setData({
      hasGenerate: true
    });
  },

  onShow: function (options) {
    this.generateImage();
  },

  typeNewContent: function (e) {
    this.setData({
      content: e.detail.value.trim()
    });

    this.generateImage();
  },

  chooseBackgroundImage: function () {
    let that = this;

    wx.chooseImage({
      success: function (res) {
        that.setData({
          backgroundImage: res.tempFilePaths[0]
        });

        that.generateImage();
      }
    });
  },

  bindPickerChange: function (e) {
    let that = this;

    that.setData({
      fontColorIndex: e.detail.value
    });

    that.generateImage();
  },

  savePic: function () {
    let that = this;
    wx.canvasToTempFilePath({
      x: 0,
      y: 0,
      width: that.data.windowWidth,
      hegiht: that.data.contentHeight,
      canvasId: 'myCanvas',
      success: function (res) {
        that.savePicToAlbum(res.tempFilePath);
      }
    }, this);
  },

  savePicToAlbum: function (tempFilePath) {
    let that = this;
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.writePhotosAlbum']) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success() {
              wx.saveImageToPhotosAlbum({
                filePath: tempFilePath,
                success(res) {
                  wx.showToast({
                    title: '保存成功'
                  });
                },
                fail(res) {
                  console.log(res);
                }
              })
            },
            fail() {
              wx.openSetting({
                success: function (data) {
                  console.log("openSetting: success");
                },
                fail: function (data) {
                  console.log("openSetting: fail");
                }
              });
            }
          })
        } else {
          wx.saveImageToPhotosAlbum({
            filePath: tempFilePath,
            success(res) {
              wx.showToast({
                title: '保存成功',
              });
            },
            fail (res) {
              console.log(res);
            }
          })
        }
      },
      fail (res) {
        console.log(res);
      }
    });
  }
})