/**
 * time: 2019-9-2
 * author: lilin
 */
var currentPathName = (window.location.pathname).split('/').pop().split('.')[0];
/**
 * 路由
 */
var Router = function(pathName) {
	return _options[pathName] || _options['404'];
};
var ops = Router(currentPathName);
var eachObject = function(oldObj, obj) {
	for (var index in obj) {
		oldObj[index] = obj[index];
	}
	return oldObj;
};
/**
 * 默认配置
 */
 _basePaths['jquery'] = 'lib/jquery-1.11.1.min';
 _basePaths['Base64'] = 'lib/base_64';
 _basePaths['es5-shim'] = 'lib/es5-shim.min';
 _basePaths['es5-sham'] = 'lib/es5-sham.min';
 _basePaths['json3'] = 'lib/json3.min';
 _basePaths['template'] = 'lib/template';
 _basePaths['cryptojs'] = 'lib/cryptojs';
 _basePaths['layer'] = 'lib/layer/layer';
/**
 * require 配置
 */
config.operate = {
	alias: {
		baseUrl: _baseUrl,
		urlArgs: version,
		paths: eachObject(_basePaths, ops.paths),
		map: (ops.map && eachObject(_baseMap, ops.map)) || _baseMap,
		shim: (ops.shim && eachObject(_baseShim, ops.shim)) || _baseShim,
		waitSeconds: 0
	},
	model: [currentPathName]
};

/*
 * 给模块配置别名
 */
require.config(config.operate.alias);
/*
 * 加载文件
 */
require(config.operate.model, function($, utils, modular) {
	modular && modular.init();
});