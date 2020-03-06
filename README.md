# RTJ框架
* requirejs-template-js简称RTJ，是以requirejs模块加载器为辅以template.js，模板引擎为主的js的前端框架
*主要是为了解决有些项目需要支持ie8浏览器，并且前后端分离的项目，在处理数据的时，用原始的jquery拼写页面是十分痛苦的事。为了简化前端的工作，通过使用requiresjs与artTemplate模板编写一套适合ie8的前端框架
* 减少以jQuery开发时，前端拼写页面的工作量
* 可以使功能模块化，使用大量模板进行开发
* 既支持做单页面，也支持做多也页面
* 支持IE8浏览器时依赖es5-sham.min.js、es5-shim.min.js

### 目录结构
 > -- css
 
 > -- images
 
 > -- js
 
 > -- lib
 
 > -- tpl
 
 > -- index.html

### js目录
> config.js 一些基本的配置

> core.js 核心方法

> filter.js 过滤器方法

> utils.js 公共的一些方法

> index.js 入口文件
### lib目录
> lib包含了一些插件，例如layer弹框、layerdata时间插件以及webUploader插件，ie8下需要加载使用es5-sham.min.js、es5-shim.min.js、json3.min.js，因为在ie8下template.js需要依赖它们
### tpl目录
> 存放组件模板的地方
### 核心的方法简单介绍
* config.js配置一些全局的变量以及requirejs的一些配置内部都有详细的注释
* utils.js 的方法依赖core.js的方法
  1.1 utils.Http  请求方式
  ```javascript
  var Http = utils.Http;
  // post请求
  Http.post(url, data, function(errorcode, result){
      if(errorcode){
	     return false;
       }
       console.log(result);	
  });
  // get请求 
  Http.get(url, data, function(errorcode, result){
      if(errorcode){
	     return false;
       }
       console.log(result);	
  });
  // async POST同步请求 
  Http.async(url, data, function(errorcode, result){
      if(errorcode){
	     return false;
       }
       console.log(result);	
  });
  ```
  2.2 utils.layer layer的弹窗组件
  ```javascript
     var layer = utils.layer;
     layer.msg('你好！');
     layer.alert('你好！');
  ```
  2.3 utils.getQueryString 获取地址栏url的参数
  ```javascript
     // 例如：'http://xx/xxservice.html?id=1';
     var id = utils.getQueryString('id');
     // id = 1
  ```
  2.4 utils.webUploaderFiles 初始化上传按钮
  ```html
    <div id="uploadFile">上传</div>
  ```
  ```javascript
  /**
   * @description  上传附件插件
   * @param {string} element - element：绑定按钮元素id
   * @param {string} method - url：上传地址
   * @param {string} type - type：1-普通文件上传  2-知识库文件上传  3-只允许图片上传
   * @param {string} upUrl - upUrl: 当有值时优先使用该地址，没有则使用默认地址
   * @callback callback(file, response) - 回调方法
   */
    utils.webUploaderFiles(element, type, callback, upUrl);
    // 例如
    utils.webUploaderFiles('#uploadFile', 1, function(file, response){
       console.log(file, response);
    });
  ```
  2.5 utils.cookie cookie的存储以及获取
  ```javascript
     var cookie = utils.cookie;
     // 存储
     cookie.set('userinfo', {id:1,name:'白云'});
     // 获取
     cookie.get('userinfo');
  ```
  2.6 utils.templateView 渲染组件的方法
  ```javascript
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
	var options = {
		elementId: '#demo-con',
		templateId: 'demo-con-tpl',
		data: {message: '你好！这是一个demo！'}
	};
	utils.templateView(options);
  ```
  ```html
	<div id="demo-con"></div>
	<script id="demo-con-tpl" type="text/html">
		<span>{{message}}</span>
	</script>
  ```
  2.7 utils.templateLoaderRender 加载组件并且渲染组件()
  ```javascript
  /**
   * @description 按文件与目录组织模板,在没有预编译的情况下可以使用如下请求获取模板页面，里面不能包含子模板
   * @param {Object} options 配置对象
   * @callback  callBack 回调函数
   * @property {String} options.templateId: 模板地址， /tpl/xxx.html 或 tpl/xxx.tpl
   * @property {Function} options.callback  默认处理方法，返回模板处理后的字符串
   * @see _temporaryTemplateHTML存储所有加载过的模板，可以减少请求
   */
	var options = {
		elementId: '#demo-con-1',
		templateId: 'tpl/test-content-template.tpl',
		data: {title: '你加载了模板test-content-template.tpl'}
	};
	utils.templateLoaderRender(options);
  ```
  ```html
    <!DOCTYPE html>
	<html xmlns="http://www.w3.org/1999/xhtml">
    	<head>
    		<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    		<title>demo</title>
    	</head>
    <body>
		<div id="demo-con-1"></div>
        	<script type="text/javascript" src="js/config.js"></script>
        	<script data-main="js/index" src="lib/require.js"></script>
    	</body>
	</html>
  ```
  2.8 模板中使用 include 方法可以在模板中引入子模版
  ```javascript
  /**
   * @description 注册加载子模板的方法
   * @param {Object} data 数据对象
   * @param {string} url 子模版路径
   * @param {string/object} argsOne 形参1
   * @param {string/object} argsTwo 形参2
   * @return {string} 返回编译过后子模板的html字符串
   */
   // 模板中调用方式如下：
  ```
  ```html
    <h1>{{@title | include 'tpl/test-content.html', msg, '345'}}</h1>
  ```
  2.9 utils.loadingTpl 按文件与目录组织加载组件,在回调函数渲染组件
  ```javascript
    /**
     * @description 按文件与目录组织加载组件, 数据处理在回调函数里进行，可以在组件里，创建多个
     * @param {String} url 组件的地址
     * @callback 在callBack回调中处理组件的渲染
     * @see /tpl/xxx.html 或 tpl/xxx.tpl 中创建多个组件
     */
     utils.loadingTpl(url, function(){
	// 执行方法
     })
  ```
  2.10 utils.log 打印日志
  ```javascript
  /**
   * @description 自定义console.log
   * @param {string} params 数据
   * @param {boolean} type 判断是否打印字符串
   */
    utils.log(params, type);
   // 例如
   var log = utils.log;
   var obj = {a: 123, b: 1234};
   log(obj);
   // 或者
   utils.log(obj);
  ```
* filter.js 各种过滤函数的方法
> 目前只提供几个常用的过滤函数
> dateFormat ：格式化时间 yyyy-MM-dd hh:mm:ss
> substrByLength ：字符串截取
> dateDiff ：时间戳显示为多少分钟前，多少天前的处理
> getSubString ：判断字符串超过多少就开始截取
> 下面就是格式化时间例子:
```html
  <div id="demo-con"></div>
  <script id="demo-con-tpl" type="text/html">
	<span>{{message}}答：{{sendTime | dateFormat}}</span>
  </script>
```
```javascript
  // 例如 时间的格式 'yyyy-MM-dd hh:mm:ss'
  var options = {
	elementId: '#demo-con',
	templateId: 'demo-con-tpl',
	data: {message: '你好,现在几点了？', sendTime: 1565858448014}
  };
  utils.templateView(options);
  // 结果：你好,现在几点了？答：2019-8-15 16:40:48
```
> 创建过滤函数的方法
```javascript
var data = {content: 'world'};
filter.getContent = function(data){
  var str = 'hello ' + data;
  retrun str;
}
```
```html
<!-- 调用filter的方法getContent -->
<div>{{content | getContent }}</div>
<!-- 渲染之后的结果 -->
<div>hello world</div>
```

* template.js 的用法
> 1. artTemplate是腾讯开源的前端模版引擎，无论就速度，兼容性还是相当可以
> 2. web前端vue.js、react.js、angularjs等技术，支持的浏览器本IE10以上/firefox/chrome等高版本浏览器
> 3. 而artTemplate在兼容IE8浏览器做的很出色，可以大大提高一些项目需要支持IE8浏览器的开发速度

> artTemplate常用的一些方法
  * each的遍历
```html
<div id="content"></div>
<-- 在index.html内编写模板：使用一个type="text/html"的script标签存放模板： -->
<script id="test" type="text/html">
<h1>{{title}}</h1>
<ul>
    {{each list val i}}
        <li>索引 {{i + 1}} ：{{val}}</li>
    {{/each}}
</ul>
</script>
```
```javascript
<!-- js渲染模板 -->
var data = {
    title: '标签',
    list: ['文艺', '博客', '摄影', '电影', '民谣', '旅行', '吉他']
};
  var options = {
	elementId: '#content',
	templateId: 'test',
	data: {list: data}
  };
  utils.templateView(options);
```
 * if判断
```html
{{if admin}}
    <div>{{title}}</div>
{{/if}}
<!-- if...else... -->
{{if admin}}
    <div>{{title}}</div>
{{else}}
    <div>没有结果</div>
{{/if}}
<!-- if...else if....else... -->
{{if admin == 1}}
    <div>admin等于1</div>
{{else if admin == 2}}
    <div>>admin等于2</div>
{{else}}
    <div>>既不等于1也不等于2</div>
{{/if}}
```
* @表示对内容的html进行渲染
```javascript
 var data = {
      content: '<h>这是一个@标题测试</h>'
  }
```
```html
<!-- content内容中的<h>标签，将被浏览器渲染 -->
<div>{{@content}}</div>
```
* 创建过滤函数 filter,上面已经说了就不再介绍
### 以上就是RTJ框架的基本结构，非常简单
### 只要初略熟悉一下requirejs和template.js 可以开始写项目了, 不需要任何打包工具
