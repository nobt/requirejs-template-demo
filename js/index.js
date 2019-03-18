/*
* 给模块配置别名
*/
require.config(config.operate.alias);
/*
* 加载文件
*/
require(config.operate.model, function($, utils) {

    	var layer = utils.layer;
    	var Http = utils.Http;

     	/*开始编写js 代码*/
		var options = {
			elementId: 'demo-con',
			templateId: 'demo-con-tpl',
			data: {message: '你好！这是一个demo！'}
		};
		utils.templateView(options);

		var options1 = {
			elementId: 'demo-con-1',
			templateId: 'tpl/test-content-template.tpl',
			data: {title: '你加载了模板test-content-template.tpl'}
		};
		utils.templateLoader(options1);

});