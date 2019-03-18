/*
* time: 2018-8-25
* author: lilin
*/
var config = {}; 

//请求地址
var serverUrl = '';
/*附件上传地址*/
var upload_file_url = '';
/*
*  PathAlias: 前缀
*  config: 承载各个类型参数
*  currentPathName: 通过对当前url的截取获取页面名称 
*  is_open_custom: 自定义url
*  custom_path: 自定义映射路径
*  options : 配置各个页面的require的参数
*  alias: js的路劲别名
*  model: 需要加载的js的别名
*  如需css、非AMD模块的加载，请参照requirejs文档的map、shim配置
*  CSS在加载的时候尽量使用原始方法加载，除非用到插件、扩展的CSS
*  urlArgs: 版本的配置
*/

/*通用配置*/
var version = '0.0.1';
var _basePaths = {
    'jquery': 'lib/jquery-1.11.1.min',
    'es5-shim': 'lib/es5-shim.min',
    'es5-sham': 'lib/es5-sham.min',
    'json3': 'lib/json3.min',
    'template': 'lib/template',
    'cryptojs': 'lib/cryptojs',
    'layer': 'lib/layer/layer',
    'utils': 'js/utils',
    'core': 'js/core',
    'webUploader': 'lib/uploader/webuploader'
};

var _baseModel = ['jquery', 'utils'];
var _baseMap = {
    '*': {
        css: 'lib/css.js'
    }
};
var _baseShim = {
    template: {
        deps: ['es5-shim', 'es5-sham', 'json3']
    },
    layer: {
        deps: ['jquery', 'css!lib/layer/theme/default/layer.css']
    },
    //上传附件插件
    webUploader: {
        deps: ['jquery', 'css!lib/uploader/webuploader.css']
    }
};
/*
* 配置
*/
var _options = {
	'index': {
		paths: {},
		model: []
	},
	'404': {
		paths: {},	
		model: []
	}
};
/*
* 获取当前页面的url
*/
var currentPathName = (window.location.pathname).split('/').pop().split('.')[0];
/*
* 路由
*/
var Router = function (pathName){
	return 	_options[pathName] || _options['404'];
};
var ops = Router(currentPathName);
var eachObject = function(oldObj, obj){
	for (var index in obj){ 
	    oldObj[index] = obj[index];
	}
	return oldObj;
};
/*
* require 配置
*/
config.operate = {
	alias:{
		baseUrl: './',
		urlArgs: version,
		paths: eachObject(_basePaths, ops.paths),
		map: (ops.map && eachObject(_baseMap, ops.map)) || _baseMap,
		shim: (ops.shim && eachObject(_baseShim, ops.shim)) || _baseShim,
		waitSeconds: 0
	},	
	model: (function(){
		var  lt = ops.model;
		for (var i = 0; i < lt.length; i++) {
			_baseModel.push(lt[i]);
		};
		return _baseModel;
	})()	
};
/*
* debug 配置
*/
config.debug = false;
