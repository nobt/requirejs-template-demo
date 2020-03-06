/*
 * time: 2018-8-25
 * author: lilin
 * config: 承载各个类型参数
 * serverUrl：请求地址
 * upload_file_url: 附件上传地址
 * currentPathName：通过对当前url的截取获取页面名称
 * version：当前版本号
 * options : 配置各个页面的require的参数
 * alias: js的路劲别名
 * model: 需要加载的js的别名
 * 如需css、非AMD模块的加载，请参照requirejs文档的map、shim配置
 * CSS在加载的时候尽量使用原始方法加载，除非用到插件、扩展的CSS
 * urlArgs: 版本的配置
 */
var config = {};
var serverUrl = '';
var upload_file_url = '';
var version = '0.0.1';
// 基础js路径配置
var _baseUrl = './';
var _basePaths = {
	'utils': 'js/utils',
	'core': 'js/core',
	'filter': 'js/filter',
	'webUploader': 'lib/uploader/webuploader'
};
// 基础引用模块
var _baseModel = ['jquery', 'utils'];
var _baseMap = {
	'*': {
		css: 'lib/css.js'
	}
};
// 基础处理引用第三方模块
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
/**
 * 配置当前模块引入的
 */
var _options = {
	'index': {
		paths: {
			index: 'js/index',
		}
	},
	'404': {
		model: []
	}
};
/**
 * debug 配置
 */
config.debug = false;