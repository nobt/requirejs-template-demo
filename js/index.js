/**
 * author: lilin
 * time: 2019/9/2
 * description: 首页js
 */
define(['jquery', 'utils'], function($, utils) {

	var layer = utils.layer;
	var Http = utils.Http;

	var options1 = {
		elementId: '#demo-con-1',
		templateId: 'tpl/test-content-template.html',
		data: {
			title: '你加载了模板test-content-template.tpl',
			msg: {a:1,b:2}
		}
	};
	utils.templateLoaderRender(options1);
});