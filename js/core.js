/*
 * 一些必要的公共方法
 */

define(['template', 'jquery', 'layer', 'cryptojs'], function(template, $, layer) {
  var temparr = [];
  //模板过滤器
  var filter = template.defaults.imports;


  /**
  *  Base64 encode / decode
  **/
  var Base64 = {
      _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", 
      encode: function (input){
          var output = "";
          var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
          var i = 0;

          input = Base64._utf8_encode(input);

          while (i < input.length)
          {
              chr1 = input.charCodeAt(i++);
              chr2 = input.charCodeAt(i++);
              chr3 = input.charCodeAt(i++);

              enc1 = chr1 >> 2;
              enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
              enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
              enc4 = chr3 & 63;

              if (isNaN(chr2))
              {
                  enc3 = enc4 = 64;
              }
              else if (isNaN(chr3))
              {
                  enc4 = 64;
              }

              output = output +
                  this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
                  this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
          } // Whend 

          return output;
      },
      decode: function (input)
      {
          var output = "";
          var chr1, chr2, chr3;
          var enc1, enc2, enc3, enc4;
          var i = 0;
          input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
          while (i < input.length)
          {
              enc1 = this._keyStr.indexOf(input.charAt(i++));
              enc2 = this._keyStr.indexOf(input.charAt(i++));
              enc3 = this._keyStr.indexOf(input.charAt(i++));
              enc4 = this._keyStr.indexOf(input.charAt(i++));

              chr1 = (enc1 << 2) | (enc2 >> 4);
              chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
              chr3 = ((enc3 & 3) << 6) | enc4;

              output = output + String.fromCharCode(chr1);

              if (enc3 != 64)
              {
                  output = output + String.fromCharCode(chr2);
              }
              if (enc4 != 64)
              {
                  output = output + String.fromCharCode(chr3);
              }

          }
          output = Base64._utf8_decode(output);
          return output;
      },
      _utf8_encode: function (string){
          var utftext = "";
          string = string.replace(/\r\n/g, "\n");

          for (var n = 0; n < string.length; n++)
          {
              var c = string.charCodeAt(n);

              if (c < 128)
              {
                  utftext += String.fromCharCode(c);
              }
              else if ((c > 127) && (c < 2048))
              {
                  utftext += String.fromCharCode((c >> 6) | 192);
                  utftext += String.fromCharCode((c & 63) | 128);
              }
              else
              {
                  utftext += String.fromCharCode((c >> 12) | 224);
                  utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                  utftext += String.fromCharCode((c & 63) | 128);
              }

          } // Next n 

          return utftext;
      },
      _utf8_decode: function (utftext){
          var string = "";
          var i = 0;
          var c, c1, c2, c3;
          c = c1 = c2 = 0;

          while (i < utftext.length)
          {
              c = utftext.charCodeAt(i);
              if (c < 128)
              {
                  string += String.fromCharCode(c);
                  i++;
              }
              else if ((c > 191) && (c < 224))
              {
                  c2 = utftext.charCodeAt(i + 1);
                  string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                  i += 2;
              }
              else
              {
                  c2 = utftext.charCodeAt(i + 1);
                  c3 = utftext.charCodeAt(i + 2);
                  string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                  i += 3;
              }

          }
          return string;
      }
  }
  /*
   * 模板的渲染
   */
  function templateView(options, callBack) {
    /* options 参数说明
     * options.elementId: 将模板的内容渲染到页面指定的id处
     * options.templateId: 模板的id名字
     * options.data: 模板页面的数据
     * options.isDraw: 默认是直接渲染，如果想拿到模板字符串，可设置 isDraw = 1
     * options.isStore: 默认是模板不保留，如果想保持模板字符串，可设置 isStore = 1
     * 注意：只支持本页面模板化
     */
    var html = template(options.templateId, options.data);
    var isDraw = options.isDraw ? options.isDraw : false;
    var isStore = options.isStore ? options.isStore : false;
    if(!isStore) $('#'+options.templateId).remove();
    if (isDraw) {
      return html;
    } else {
      document.getElementById(options.elementId).innerHTML = html;
      if (callBack) {
        try {
          if (typeof(eval(callBack)) == "function") {
            callBack();
          }
        } catch (e) {
          alert(e.name + ": " + e.message);
        }
      }
    }
  }
  /**
   * 按文件与目录组织模板,在没有预编译的情况下可以使用如下请求获取模板页面
   * templateId: 模板地址， /tpl/xxx.html 或 tpl/xxx.tpl
   * saveTemplate: true 或 flase 模板是否保存
   * 单模板异步加载，支持多模板加载，多模板只能放在该模板之后
   */

  function templateLoader(options, callBack) {
    var lt = (options.templateId).split('.')[0].split('/');
    var templateIdToStr = lt.join('-');
    if ($('#' + templateIdToStr).length) {
      options.templateId = templateIdToStr;
      templateView(options, callBack);
      return false;
    } else {
      $.get(options.templateId, function(result, status) {
        if (status == "success") {
          var len = result.indexOf('<script');
          if (len == -1) {
            var render = template.compile(result);
            var html = render(options.data);
            document.getElementById(options.elementId).innerHTML = html;
          } else {
            //$('<script id="' + templateIdToStr + '" type="text/html">' + result + '</script>').appendTo('body');
            // var html = template(templateIdToStr, options.data);
            // document.getElementById(options.elementId).innerHTML = html;
            var str = result.substring(0, len);
            var render = template.compile(str);
            var html = render(options.data);
            var saveTemplate = options.saveTemplate || false;
            if(saveTemplate){
              $('<script id="' + templateIdToStr + '" type="text/html">' + str + '</script>').appendTo('body');
            }
            document.getElementById(options.elementId).innerHTML = html;
            //子模版
            var tpl = result.substring(len);
            $(tpl).appendTo('body');
          }
          if (callBack) {
            try {
              if (typeof(eval(callBack)) == "function") {
                callBack();
              }
            } catch (e) {
              alert(e.name + ": " + e.message);
            }
          }
        } else {
          layer.msg('加载模板失败！', {
            icon: 2
          });
        }
      });
    }
  }
  /*
   * 按文件与目录组织加载模板, 数据处理在回调函数里进行
   * 可以在模板里，创建多个
   * /tpl/xxx.html 或 tpl/xxx.tpl 中创建多个模板
   * 模板的渲染在callBack回调中处理
   */

  function loadingTpl(url, callBack) {
    $.get(url, function(result, status) {
      if (status == "success") {
        $(result).appendTo('body');
        if (callBack) {
          try {
            if (typeof(eval(callBack)) == "function") {
              callBack();
            }
          } catch (e) {
            alert(e.name + ": " + e.message);
          }
        }
      } else {
        layer.msg('加载模板失败！', {
          icon: 2
        });
      }
    });
  }
  /*
   * cookie
   */
  var _cookie = {
    setCookie: function(name, value) {
      var t = new Date();
      t.setTime(t.getTime() + 1 * 1 * 3600 * 1000);
      document.cookie = escape(name) + "=" + escape(value) + ";path=/;expires=" + t.toGMTString();
    },
    getCookie: function(name) {
      if (new RegExp("\\b" + name + "=([^;]+)", "g").test(document.cookie)) return unescape(RegExp.$1 || '');
      return '';
    },
    set: function(name, value){
      if(typeof value == 'number'){
        value = value.toString();
      }else if(typeof value == 'object'){
        value = JSON.stringify(value);
      }
      this.setCookie(name, Base64.encode(value));
    },
    get: function(name){
      return Base64.decode(this.getCookie(name));
    },
    del: function(name) {
      this.set(name, '', -1);
    }
  };

  /*
   * Http请求
   */
  var Http = {};

  /*
   * get请求
   */
  Http.get = function(url, params, callback) {
    requestAjax(url, 'get', params, callback);
  }
  /*
   * post请求
   */
  Http.post = function(url, params, callback, visitUrl) {
    requestAjax(url, 'post', params, callback, visitUrl);
  }
  /*
   * 请求
   */

  function requestAjax(url, method, data, callback) {
    var params = data;
    var finalUrl = serverUrl;
    $.ajax({
      'type': method,
      'url': finalUrl + url,
      'data': params,
      'async': true,
      'dataType': 'json',
      'timeout': 1000 * 60,
      'beforeSend': function() {
        layer.load(2, {
          shade: 0
        });
        temparr.push(1);
      },
      'success': function(response) {
        if (response.code == 200) {
          callback(null, response.data);
        } else {
          callback(response);
        }
      },
      'error': function(error) {
        callback({
          code: error.status,
          data: null,
          msg: '网络异常，请稍候重试!'
        });
      },
      'complete': function() {
        temparr.pop();
        if (!temparr.length) {
          layer.closeAll('loading');
        }
      }
    });
  }
  /*
   * 上传附件插件
   * element：绑定按钮元素id
   * url：上传地址
   * type：1-普通文件上传  2-知识库文件上传  3-只允许图片上传
   * callback：回调方法
   * upUrl: 当有值时优先使用该地址，没有则使用默认地址
   */

  function webUploaderFiles(element, type, callback, upUrl) {
    require(['webUploader'], function(webUploader) {
      var accept = {};
      var fileSingleSizeLimit = 0; //单个文件大小限制,为0 不限制
      //普通文件上传格式
      if (type == 1) {
        accept = {
          title: 'intoTypes',
          extensions: 'doc,xls,docx,xlsx,pdf,csv,ppt,pptx,txt,rar,gif,jpg,jpeg,bmp,png',
          mimeTypes: '.doc,.xls,.docx,.xlsx,.pdf,.csv,.ppt,.pptx,.txt,.rar,.gif,.jpg,.jpeg,.bmp,.png'
        }
      } else if (type == 2) {
        //知识库的文件上传格式
        accept = {
          title: 'intoTypes',
          extensions: 'doc,xls,docx,xlsx,pdf,ppt,pptx',
          mimeTypes: '.doc,.xls,.docx,.xlsx,.pdf,.ppt,.pptx'
        }
      } else if (type == 3) {
        //只允许选择图片文件
        accept = {
          title: 'Images',
          extensions: 'jpg,jpeg,png',
          mimeTypes: 'image/*'
        }
        fileSingleSizeLimit = 1024 * 1024 * 10;
      }

      var uploadUrl = upUrl || upload_file_url;
      var formDataObj = transformRequestParams(uploadUrl, {
        source: 'webSource'
      });
      var uploader = webUploader.create({
        auto: true,
        swf: '../lib/uploader/Uploader.swf',
        server: uploadUrl,
        pick: element,
        duplicate: true,
        accept: accept,
        formData: formDataObj,
        method: 'POST',
        fileSingleSizeLimit: fileSingleSizeLimit
      });
      uploader.on('uploadProgress', function(file, percentage) {

      });
      //上传成功
      uploader.on('uploadSuccess', function(file, response) {
        if (response.code == 200) {
          var result;
          if (response.data instanceof Array) {
            result = response.data[0];
          } else {
            result = response.data;
          }
          callback(null, result);
          layer.msg('上传成功', {
            icon: 6
          });
        } else {
          layer.alert('文件上传失败！');
          callback(response);
        }
      });
      // 上传失败，显示上传出错。
      uploader.on('uploadError', function(file, reason) {
        layer.alert('文件上传失败！');
        callback(reason);
      });
      //选择封面错误触发事件;
      uploader.on('error', function(code) {
        var text = '';
        switch (code) {
          case 'F_DUPLICATE':
            text = '该文件已经被选择了!';
            break;
          case 'Q_EXCEED_NUM_LIMIT':
            text = '文件数量超过限制!';
            break;
          case 'F_EXCEED_SIZE':
            text = '文件大小超过限制!';
            break;
          case 'Q_EXCEED_SIZE_LIMIT':
            text = '所有文件总大小超过限制!';
            break;
          case 'Q_TYPE_DENIED':
            text = '文件类型不正确或者是空封面!';
            break;
          default:
            text = '未知错误!';
            break;
        }
        layer.alert(text);
      });
    });
  }
  /*
   * 时间戳转换
   */
  filter.dateFormat = function(date, format) {
    date = new Date(date);
    if (date == 'Invalid Date') {
      return '';
    }
    var map = {
      "M": date.getMonth() + 1, //月份 
      "d": date.getDate(), //日 
      "h": date.getHours(), //小时 
      "m": date.getMinutes(), //分 
      "s": date.getSeconds(), //秒 
      "q": Math.floor((date.getMonth() + 3) / 3), //季度 
      "S": date.getMilliseconds() //毫秒 
    };
    format = format.replace(/([yMdhmsqS])+/g, function(all, t) {
      var v = map[t];
      if (v !== undefined) {
        if (all.length > 1) {
          v = '0' + v;
          v = v.substr(v.length - 2);
        }
        return v;
      } else if (t === 'y') {
        return (date.getFullYear() + '').substr(4 - all.length);
      }
      return all;
    });
    return format;
  };


  /** 
   * 时间戳显示为多少分钟前，多少天前的处理
   */
  filter.dateDiff = function(date) {
    var timestamp = new Date(date).getTime();
    // 补全为13位
    var arrTimestamp = (timestamp + '').split('');
    for (var start = 0; start < 13; start++) {
      if (!arrTimestamp[start]) {
        arrTimestamp[start] = '0';
      }
    }
    timestamp = arrTimestamp.join('') * 1;

    var minute = 1000 * 60;
    var hour = minute * 60;
    var day = hour * 24;
    var halfamonth = day * 15;
    var month = day * 30;
    var now = new Date().getTime();
    var diffValue = now - timestamp;

    // 如果本地时间反而小于变量时间
    if (diffValue < 0) {
      return '不久前';
    }

    // 计算差异时间的量级
    var monthC = diffValue / month;
    var weekC = diffValue / (7 * day);
    var dayC = diffValue / day;
    var hourC = diffValue / hour;
    var minC = diffValue / minute;

    // 数值补0方法
    var zero = function(value) {
      if (value < 10) {
        return '0' + value;
      }
      return value;
    };

    // 使用
    if (monthC > 12) {
      // 超过1年，直接显示年月日
      return (function() {
        var date = new Date(timestamp);
        return date.getFullYear() + '年' + zero(date.getMonth() + 1) + '月' + zero(date.getDate()) + '日';
      })();
    } else if (monthC >= 1) {
      return parseInt(monthC) + "月前";
    } else if (weekC >= 1) {
      return parseInt(weekC) + "周前";
    } else if (dayC >= 1) {
      return parseInt(dayC) + "天前";
    } else if (hourC >= 1) {
      return parseInt(hourC) + "小时前";
    } else if (minC >= 1) {
      return parseInt(minC) + "分钟前";
    }
    return '刚刚';
  }

  /*
   * 字符串截取
   */
  filter.substring = function(data, start, length) {
    length = length || 20;
    start = start || 0;
    if (data.length > length) {
      return data.substring(start, length) + "....";
    } else {
      return data;
    }
  }
  /*
   * 获取对象的所有方法
   */

  function getAllFunc(data) {
    var stack = [];
    for (var key in data) {
      if (typeof data[key] == 'function') {
        // 若当前属性是function，则进行存储
        stack.push(data[key]);
      } else if (typeof data[key] == 'object') {
        // 若当前属性是object，则进行递归检查
        stack = stack.concat(getAllFunc(data[key]));
      }
      // 其他类型不进行操作
    }
    return stack;
  }
  /*
   * 执行对象中的方法
   */

  function executeFunc(obj) {
    var result = getAllFunc(obj);
    for (var i = 0, t = result.length; i < t; i++) {
      result[i]();
    }
  }
  /*
   * 自定义函数：根据传入的函数名，调用函数
   */

  function callFuncByName(functionName) {
    //根据函数名得到函数类型
    var func = eval(functionName);
    //创建函数对象，并调用
    new func();
  }
  /* 
   * 获取url的参数
   */

  function getQueryString(name) {
    var url = decodeURI(location.search);
    var theRequest = {};  
    if (url.indexOf("?") != -1) {  
      var str = url.substr(1);  
      strs = str.split("&");  
      for(var i = 0; i < strs.length; i ++) {  
        var num = strs[i].indexOf("="); 
        if(num > 0){ 
           theRequest[strs[i].substring(0,num)] = unescape(strs[i].substr(num+1));
        }  
      }  
    }  
    return theRequest[name]; 
  }
  /*
   * 截取字符串
   */
  filter.getSubString = function(strqwe, len, hasDot) {
    hasDot = hasDot || 1;
    var newLength = 0;
    var newStr = "";
    var chineseRegex = /[^\x00-\xff]/g;
    var singleChar = "";
    var strLength = strqwe.replace(chineseRegex, "**").length;
    for (var i = 0; i < strLength; i++) {
      singleChar = strqwe.charAt(i).toString();
      if (singleChar.match(chineseRegex) != null) {
        newLength += 2;
      } else {
        newLength++;
      }
      if (newLength > len) {
        break;
      }
      newStr += singleChar;
    }


    if (hasDot && strLength > len) {
      newStr += "...";
    }
    newStr = newStr.replace(/\s+/g, "");
    return newStr;
  }
  /*
  * 自定义console.log 
  */
  function _log(params, type) {
    if(config.debug){
       type ? console.log(JSON.stringify(params)) : console.log(params);
    }
  };

  return {
    Http: Http,
    layer: layer,
    getQueryString: getQueryString,
    webUploaderFiles: webUploaderFiles,
    cookie: _cookie,
    templateView: templateView,
    templateLoader: templateLoader,
    getAllFunc: getAllFunc,
    executeFunc: executeFunc,
    callFuncByName: callFuncByName,
    template: template,
    loadingTpl: loadingTpl,
    log: _log,
    filter: filter
  }
})