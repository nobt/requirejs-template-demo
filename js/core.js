/**
 * @description 基于artTmplate.js模板的基础上改造的
 * @author lilin
 * @todo 方便于页面渲染
 * @version：1.0.0
 */

define(['template', 'jquery', 'layer', 'Base64', 'cryptojs', 'filter'], function(template, $, layer, Base64) {
  var temparr = [];
  // 临时存储模板数据
  var _temporaryTemplateHTML = {};

  /**
   * @description options 配置对象
   * @callback  callBack 回调函数
   * @property {String} options.elementId: 将模板的内容渲染到页面指定的id选择器
   * @property {String} options.templateId: 模板的id名字，用id选择器
   * @property {Object} options.data: 模板页面的数据
   * @property {Boolean} options.isDraw: 默认是直接渲染，如果想拿到模板字符串，可设置 isDraw = true
   * @property {Boolean} options.isStore: 默认是模板不保留，如果想保持模板字符串，可设置 isStore = true
   * @property {Function} options.callback  默认处理方法，返回模板处理后的字符串
   * @see 注意：只支持本页面模板化
   */

  function templateView(options, callBack) {
    var html = template(options.templateId, options.data);
    var isDraw = options.isDraw ? options.isDraw : false;
    var isStore = options.isStore ? options.isStore : false;
    if (!isStore) {
      $(options.templateId).remove();
    }
    if (isDraw) {
      return html;
    } else if (typeof(options.callback) == 'function') {
      options.callback(html);
    } else {
      $(options.elementId).html(html);
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
   * @description 按文件与目录组织模板,在没有预编译的情况下可以使用如下请求获取模板页面，里面不能包含子模板
   * @param {Object} options 配置对象
   * @callback  callBack 回调函数
   * @property {String} options.templateId: 模板地址， /tpl/xxx.html 或 tpl/xxx.tpl
   * @property {Function} options.callback  默认处理方法，返回模板处理后的字符串
   * @see _temporaryTemplateHTML存储所有加载过的模板，可以减少请求
   */

  function templateLoaderRender(options, callBack) {
    var lt = (options.templateId).split('.')[0].split('/');
    var templateIdToStr = Base64.encode(lt.join('-'));
    if (!_temporaryTemplateHTML[templateIdToStr]) {
      $.ajax({
        type: 'get',
        url: options.templateId,
        data: {
          version: version
        },
        dataType: 'html',
        timeout: 1000 * 60,
        success: function(response) {
          _temporaryTemplateHTML[templateIdToStr] = response;
          var render = template.compile(response);
          var html = render(options.data);
          if (options.callback && typeof(options.callback) == 'function') {
            options.callback(html);
          } else {
            $(options.elementId).html(html);
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
        },
        error: function(error) {
          layer.msg('模板加载失败！');
        }
      });
    } else {
      var render = template.compile(_temporaryTemplateHTML[templateIdToStr]);
      var html = render(options.data);
      if (options.callback && typeof(options.callback) == 'function') {
        options.callback(html);
      } else {
        $(options.elementId).html(html);
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
  }
  /*
   * 按文件与目录组织加载模板, 数据处理
   * @param {string} url 模板路径
   * @param {object} data 数据对象
   * @return {string} 返回编译过后子模板的html字符串
   */

  function loadingTpl(url, data) {
    var htmlString = '';
    $.ajax({
      type: 'get',
      url: url,
      data: {
        version: version
      },
      dataType: 'html',
      timeout: 1000 * 60,
      async: false,
      success: function(response) {
        var render = template.compile(response);
        htmlString = render(data);
      },
      error: function(error) {
        layer.msg('子模板加载失败！');
      }
    });
    return htmlString;
  }

  /**
   * @description 注册加载子模板的方法
   * @param {Object} data 数据对象
   * @param {string} url 子模版路径
   * @param {string} argsOne 形参1
   * @param {string} argsTwo 形参2
   * @return {string} 返回编译过后子模板的html字符串
   */
  template.defaults.imports.include = function(data, url, argsOne, argsTwo) {
    data = {
      data: data,
      argsOne: argsOne,
      argsTwo: argsTwo
    };
    return loadingTpl(url, data);
  }
  /**
   * @description 设置cookie的函数
   * @property {object} _cookie.setCookie - 存储cookie
   * @property {object} _cookie.getCookie - 获取cookie
   * @property {object} _cookie.set - 存之之前对数据进行base_64加密处理
   * @property {object} _cookie.get - 获取数据之前base_64解密处理
   * @property {object} _cookie.del - 删除cookie的值
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
    set: function(name, value) {
      if (typeof value == 'number') {
        value = value.toString();
      } else if (typeof value == 'object') {
        value = JSON.stringify(value);
      }
      this.setCookie(name, Base64.encode(value));
    },
    get: function(name) {
      return Base64.decode(this.getCookie(name));
    },
    del: function(name) {
      this.set(name, '', -1);
    }
  };

  /**
   * @description Http - 请求
   */
  var Http = {};

  /**
   * @name get - 请求
   * @param {string} url  - 请求接口地址
   * @param {object} params - 请求参数
   * @param {object} callback - 回调方法
   */
  Http.get = function(url, params, callback, async) {
    requestAjax(url, 'get', params, callback, async);
  }

  /**
   * @name post - 请求
   * @param {string} url  - 请求接口地址
   * @param {object} params - 请求参数
   * @param {object} callback - 回调方法
   */
  Http.post = function(url, params, callback, async) {
    requestAjax(url, 'post', params, callback, async);
  }
  
  /**
   * @des async异步请求
   * @param {string} url 请求地址
   * @param {object} params 数据参数
   * @callback {function} callback 回调方法
  */
  Http.async = function (url, params, callback) {
      requestAjax(url, 'post', params, callback, false);
  }

  /**
   * @description 封装的ajax请求
   * @param {string} url  - 请求接口地址
   * @param {string} method - 请求类型
   * @param {object} data - 请求参数
   * @param {object} callback - 回调方法
   * @global serverUrl 项目请求地址
   */

  function requestAjax(url, method, data, callback, async) {
    var params = data;
    async = typeof(async) == 'boolean' ? async : true;
    $.ajax({
      type: method,
      url: serverUrl + url,
      data: params,
      async: async,
      dataType: 'json',
      timeout: 1000 * 60,
      beforeSend: function() {
        layer.load(2, {
          shade: 0
        });
        temparr.push(1);
      },
      success: function(response) {
        if (response.code == 200) {
          callback(null, response.data);
        } else {
          callback(response);
        }
      },
      error: function(error) {
        callback({
          code: error.status,
          data: null,
          msg: '网络异常，请稍候重试!'
        });
      },
      complete: function() {
        temparr.pop();
        if (!temparr.length) {
          layer.closeAll('loading');
        }
      }
    });
  }
  /**
   * @description  上传附件插件
   * @param {string} element - element：绑定按钮元素id
   * @param {string} method - url：上传地址
   * @param {string} type - type：1-普通文件上传  2-知识库文件上传  3-只允许图片上传
   * @param {string} upUrl - upUrl: 当有值时优先使用该地址，没有则使用默认地址
   * @callback callback - 回调方法
   * @global upload_file_url - 上传附件的路径
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
      var formDataObj = {
        source: 'webSource'
      };
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
  /**
   * @description 获取对象的所有方法
   * @param {object} data 对象
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
  /**
   * @description 执行对象中的方法
   * @param {string} obj 对象
   */

  function executeFunc(obj) {
    var result = getAllFunc(obj);
    for (var i = 0, t = result.length; i < t; i++) {
      result[i]();
    }
  }
  /**
   * @description 自定义函数：根据传入的函数名，调用函数
   * @name functionName 执行函数
   */

  function callFuncByName(functionName) {
    //根据函数名得到函数类型
    var func = eval(functionName);
    //创建函数对象，并调用
    new func();
  }

  /**
   * @description 根据url获取参数
   * @param {string} name 参数名
   */

  function getQueryString(name) {
    var url = decodeURI(location.search);
    var theRequest = {};
    if (url.indexOf("?") != -1) {
      var str = url.substr(1);
      strs = str.split("&");
      for (var i = 0; i < strs.length; i++) {
        var num = strs[i].indexOf("=");
        if (num > 0) {
          theRequest[strs[i].substring(0, num)] = unescape(strs[i].substr(num + 1));
        }
      }
    }
    return theRequest[name];
  }

  /**
   * @description 自定义console.log
   * @param {string} params 数据
   * @param {boolean} type 判断是否打印字符串
   */

  function _log(params, type) {
    if (config.debug) {
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
    templateLoaderRender: templateLoaderRender,
    getAllFunc: getAllFunc,
    executeFunc: executeFunc,
    callFuncByName: callFuncByName,
    log: _log,
    Base64: Base64
  };
})