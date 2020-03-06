/**
 * @description 基于artTmplate模板，创建过滤器
 * @author lilin
 * @todo 方便于页面过滤数据
 * @module template模块
 * @version：1.0.0
 */
define(['template'], function(template) {
	var filter = template.defaults.imports;
	/**
	 * @description 时间戳转换
	 * @param {string} date  数据
	 * @param {string} format 时间格式 yyyy-MM-dd hh:mm:ss
	 * @return format 字符串
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
	 * @description 字符串截取
	 * @param {string} date  数据
	 * @param {number} start  开始位置
	 * @param {number} length  长度
	 * @return data 字符串
	 */
	filter.substrByLength = function(data, start, length) {
		length = length || 20;
		start = start || 0;
		if (data.length > length) {
			return data.substring(start, length) + "....";
		} else {
			return data;
		}
	}
	/** 
	 * @description 时间戳显示为多少分钟前，多少天前的处理
	 * @param {string} date  数据
	 * @return 字符串
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
	/** 
	 * @description 判断字符串超过多少就开始截取
	 * @param {string} len 截取长度
	 * @param {string} hasDot  是否显示...
	 * @return 字符串
	 */
	filter.getSubString = function(data, len, hasDot) {
		hasDot = hasDot || 1;
		var newLength = 0;
		var newStr = "";
		var chineseRegex = /[^\x00-\xff]/g;
		var singleChar = "";
		var strLength = data.replace(chineseRegex, "**").length;
		for (var i = 0; i < strLength; i++) {
		  singleChar = data.charAt(i).toString();
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


});