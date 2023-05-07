// 定义一个变量，用于存储已经学习的课件id
var studiedId;
// 定义一个变量，用于存储已经学习的课件时长
var progressStudied = {};
// 定义一个变量，用于存储学习码
var studyCodes;
// 定义一个变量，用于存储当前的学习码
var curCode;
// 定义一个变量，用于存储视频验证码的任务
var vCodeTask;
// 定义一个变量，用于存储视频开始的时间
var videoStart = null;
// 定义一个函数，用于获取课件列表
bps.courseWareList = function(a) {
	// 发送一个ajax请求，向后台发送课程id参数a，用于获取课件列表的数据
	$.ajax({
		type: "get",
		url: bps.url.courseware.courseWareListUrl + "?courseId=" + a + "&time=" + new Date(),
		success: function(c) {
			// 如果请求成功，就把返回的数据转换成一个数组b，并调用bps.courseWareListView函数，传入b和a变量
			var b = base.nrMultiLineText2Array(c);
			bps.courseWareListView(b, a);
			// 调用bps.getNoteList函数，传入1作为参数，用于获取笔记列表
			bps.getNoteList(1)
		}
	})
};// 定义一个函数，用于加载课件目录的视图
bps.loadCoursewareMulu = function() {
	// 判断dataObjs变量是否存在，如果存在，就直接调用bps.loadCoursewareMuluView函数，传入dataObjs变量
	if (dataObjs != null && dataObjs != "undefined" && dataObjs != "") {
		bps.loadCoursewareMuluView(dataObjs)
	} else {
		// 如果dataObjs变量不存在，就从url中获取课程id参数a
		var a = base.getUrlParameters()
			.c;
		// 发送一个ajax请求，向后台发送课程id参数a，用于获取课件目录的数据
		jQuery.ajax({
			type: "get",
			url: bps.url.courseware.courseWareListUrl + "?courseId=" + a + "&time=" + new Date(),
			success: function(b) {
				// 如果请求成功，就把返回的数据赋值给dataObjs变量，并调用bps.loadCoursewareMuluView函数，传入b变量
				dataObjs = b;
				bps.loadCoursewareMuluView(b)
			}
		})
	}
};// 定义一个函数，用于获取用户已经学习的课件时长
bps.getStudiedPeriod = function(e) {
	// 获取登录用户的cookie信息
	var d = base.getCookie("loginUser");
	// 获取当前时间
	var c = new Date()
		.getTime();
	// 获取用户账号、终端代码、课程id等信息，拼接成一个字符串b
	var b = c + ";" + d.userAccount + ";" + bps.url.terminalCode + ";" + d.sid + ";" + e;
	// 调用bps.getSecretResult函数，对字符串b进行加密处理，得到一个密钥a
	var a = bps.getSecretResult(b);
	// 发送一个ajax请求，向后台发送用户账号、终端代码、密钥等信息，用于获取用户已经学习的课件时长
	jQuery.ajax({
		type: "POST",
		url: bps.url.courseware.getUserStudiedPeriod,
		data: {
			userAccount: d.userAccount,
			terminalCode: bps.url.terminalCode,
			skey: a
		},
		async: false,
		success: function(f) {
			// 如果后台返回的状态码是200，就把返回的数据赋值给progressStudied变量
			if (f.code == 200) {
				progressStudied = f.data
			}
		}
	})
};
// 定义一个函数，用于处理课件详情页面的逻辑
bps.comeCoursewareDetail = function(d, h, f, e) {
	// 获取登录用户的cookie信息
	var b = base.getCookie("loginUser");
	// 如果没有获取到用户信息，就直接调用课件详情页面的函数，不做其他处理
	if (!!!b) {
		// 根据参数e的值，判断是调用新版还是旧版的课件详情页面函数
		e == 1 ? bps.courseWareDetailNew(h, f) : bps.courseWareDetail(h, f);
		return
	}
	// 如果用户信息中的域名代码以100006开头，就删除开始时间的cookie信息
	if (b.domainCode.indexOf("100006") == 0) {
		bps.delStartTime()
	}
	// 获取用户账号、当前时间、课程id、课件id等信息，拼接成一个字符串c
	var a = b.userAccount;
	var i = new Date()
		.getTime();
	var c = i + ";" + a + ";" + b.sid + ";" + d + ";" + h + ";" + bps.url.terminalCode;
	// 调用bps.getSecretResult函数，对字符串c进行加密处理，得到一个密钥g
	var g = bps.getSecretResult(c);
	// 发送一个ajax请求，向后台发送用户账号、终端代码、密钥等信息，用于记录用户的学习行为
	$.ajax({
		type: "post",
		url: bps.url.study.doComeStudy,
		data: {
			userAccount: a,
			terminalCode: bps.url.terminalCode,
			skey: g,
			time: Date.parse(new Date())
		},
		async: false,
		success: function(l) {
			// 获取课程和课件的cookie信息
			var j = base.getCookie("course");
			var k = base.getCookie("courseware");
			if (j && k) {
				// 如果存在课程和课件的cookie信息，就删除相关的验证码信息
				base.addCookie("captch_2_" + k.id + "_" + a, null, {
					path: "/bps/",
					expires: -1
				});
				base.addCookie("captch_r_" + k.id + "_" + a, null, {
					path: "/bps/",
					expires: -1
				})
			}
			// 如果后台返回的状态码是200，就直接调用课件详情页面的函数，不做其他处理
			if (l.code == 200) {
				e == 1 ? bps.courseWareDetailNew(h, f) : bps.courseWareDetail(h, f);
				return
			} else {
				if (l.code == 301) {
					if (e == 1) {
						bps.courseWareDetailNew(h, f);
						return
					} else {
						l.msg = l.msg.replace(/学习新课件，原课件将不能获得积分/g, ("学习新课件，原课件将不能获得" + pointName));
						layer.open({
							type: 1,
							title: "提示信息",
							closeBtn: 0,
							anim: 2,
							shadeClose: true,
							area: ["400px", "260px"],
							content: '<p style="margin: 10px 10px;text-align: center;line-height: 29px; font-size: 14px;">' + l.msg + "</p>",
							btn: ["继续学习", "学习新课件"],
							yes: function(n, m) {
								layer.close(n);
								d = l.data.courseId;
								h = l.data.coursewareId;
								f = l.data.courseWareType;
								// 如果用户选择继续学习，就调用课件详情页面的函数，传入后台返回的课程id、课件id和课件类型
								bps.courseWareDetail(h, f, d);
								return
							},
							btn2: function(n, m) {
								layer.close(n);
								// 如果用户选择学习新课件，就调用课件详情页面的函数，传入原来的课件id和课件类型
								bps.courseWareDetail(h, f);
								return
							}
						})
					}
				} else {
					// 如果后台返回的状态码不是200或301，就弹出提示信息，告知用户无法进入学习页面
					layer.msg(l.msg, {
						icon: 5,
						time: 2000
					});
					return
				}
			}
		},
		error: function(j) {
			// 如果ajax请求失败，就弹出提示信息，告知用户网络异常
			layer.msg("网络异常，请稍后重试", {
				icon: 5,
				time: 2000
			});
			return
		}
	})
};
// 定义一个函数，名为initStudy，接受一个参数e，表示课件的id
bps.initStudy = function(e) {
	// 从cookie中获取登录用户的信息，赋值给变量d
	var d = base.getCookie("loginUser");
	// 如果没有登录用户的信息，就返回
	if (!d) {
		return
	}
	// 删除cookie中关于当前课件和用户账号的验证码信息
	base.addCookie("captch_r_" + e + "_" + d.userAccount, null, {
		path: "/bps/",
		expires: -1
	});
	// 从url中获取课程的id，赋值给变量f
	var f = base.getUrlParameters()
		.c;
	// 调用bps.getSystemTime函数，获取系统时间，赋值给变量b
	var b = bps.getSystemTime();
	// 拼接一个字符串，包含b、用户账号、用户会话、课程id和课件id、终端代码，用分号隔开，赋值给变量a
	var a = b + ";" + d.userAccount + ";" + d.sid + ";" + f + "_" + e + ";" + bps.url.terminalCode;
	// 调用bps.getSecretResult函数，传入a作为参数，得到一个密钥，赋值给变量c
	var c = bps.getSecretResult(a);
	// 调用jQuery的ajax方法，发送一个post请求到服务器
	jQuery.ajax({
	    // 指定请求类型为post
		type: "post",
	    // 指定请求的url为bps.url.captch.initStudyExam
		url: bps.url.captch.initStudyExam,
	    // 指定请求的数据为一个对象，包含用户账号、终端代码、类型、密钥和时间等属性
		data: {
			userAccount: d.userAccount,
			terminalCode: bps.url.terminalCode,
			type: 2,
			secondaryKey: encodeURI(c),
			time: b
		},
	    // 指定请求是否异步，这里设置为false（同步）
		async: false,
	    // 指定请求成功的回调函数，参数k是返回的数据
		success: function(k) {
		    // 如果返回的数据的code属性是200，并且有data属性
			if (k.code == 200 && !!k.data) {
			    // 如果data属性有secretKey属性
				if (!!k.data.secretKey) {
				    // 定义一个变量j，赋值为bps.url.captch.key的utf8编码
					var j = CryptoJS.enc.Utf8.parse(bps.url.captch.key);
					// 定义一个变量i，赋值为bps.url.captch.iv的utf8编码
					var i = CryptoJS.enc.Utf8.parse(bps.url.captch.iv);
					// 定义一个变量h，赋值为用j和i解密data.secretKey的结果，并转换为utf8字符串，并去掉空字符
					var h = CryptoJS.AES.decrypt(k.data.secretKey, j, {
						iv: i,
						mode: CryptoJS.mode.CBC,
						padding: CryptoJS.pad.Pkcs7
					});
					h = h.toString(CryptoJS.enc.Utf8);
					h = h.replace(/\u0000/g, "");
					// 把h分割成一个数组，赋值给变量g
					var g = h.split(";");
					// 把data.secretKey和g[3]（第四个元素）作为验证码信息存入cookie中，关联当前课件和用户账号，并设置过期时间为getExpires函数的返回值
					base.addCookie("captch_r_" + e + "_" + d.userAccount, {
						sk: k.data.secretKey,
						second: g[3]
					}, {
						path: "/bps/",
						expires: getExpires()
					});
					// 如果g[3]（第四个元素）等于-1或者g[4]（第五个元素）等于0，就返回
					if (g[3] == -1 || g[4] == 0) {
						return
					}
					// 调用bps.geStudyVodes函数，传入data.secretKey和e作为参数
					bps.geStudyVodes(k.data.secretKey, e)
				}
			} else {
			    // 如果返回的数据的code属性是411
				if (k.code == 411) {
				    // 调用bps.popwinOpenTextForOutLine函数，传入true作为参数
					bps.popwinOpenTextForOutLine(true);
					// 删除cookie中关于当前课件和用户账号的验证码信息
					base.addCookie("captch_r_" + e + "_" + d.userAccount, null, {
						path: "/bps/",
						expires: -1
					})
				} else {
				    // 否则，也删除cookie中关于当前课件和用户账号的验证码信息
					base.addCookie("captch_r_" + e + "_" + d.userAccount, null, {
						path: "/bps/",
						expires: -1
					})
				}
			}
		}
	})
// 结束函数的定义
};

// 定义一个函数，名为 getExpires
function getExpires() {
	// 获取当前时间的毫秒数，赋值给变量 b
	var b = Math.round(new Date()
		.getTime());
	// 创建一个新的日期对象，赋值给变量 a
	var a = new Date();
	// 设置 a 的小时为 23
	a.setHours(23);
	// 设置 a 的分钟为 59
	a.setMinutes(59);
	// 设置 a 的秒数为 59
	a.setSeconds(59);
	// 获取 a 的毫秒数，赋值给变量 c
	var c = Math.round(a.getTime());
	// 计算 c 和 b 的差值，赋值给变量 shengunix
	shengunix = c - b;
	// 返回 shengunix 除以 86400000（一天的毫秒数）的结果
	return shengunix / (86400000)
}
// 定义一个函数，名为 bps.geStudyVodes，接受两个参数 a 和 f
bps.geStudyVodes = function(a, f) {
	// 从 cookie 中获取登录用户的信息，赋值给变量 e
	var e = base.getCookie("loginUser");
	// 从父窗口的 url 中获取参数 c 的值，赋值给变量 g
	var g = window.parent.base.getUrlParameters()
		.c;
	// 获取当前时间的毫秒数，赋值给变量 c
	var c = new Date()
		.getTime();
	// 拼接 c, a, bps.url.captch.key, g, f, e.userAccount 和 bps.url.terminalCode，用分号分隔，赋值给变量 b
	var b = c + ";" + a + ";" + bps.url.captch.key + ";" + g + "_" + f + ";" + e.userAccount + ";" + bps.url.terminalCode;
	// 调用 bps.getSecretResult 函数，传入 b 作为参数，得到加密后的结果，赋值给变量 d
	var d = bps.getSecretResult(b);
	// 发送一个 ajax 请求，设置以下参数：
	jQuery.ajax({
		type: "post", // 请求类型为 post
		async: false, // 请求为同步
		url: bps.url.captch.getVodes, // 请求的 url 为 bps.url.captch.getVodes
		data: { // 请求的数据为以下对象
			type: 2, // 类型为 2
			userAccount: e.userAccount, // 用户账号为 e.userAccount
			terminalCode: bps.url.terminalCode, // 终端代码为 bps.url.terminalCode
			secretKey: encodeURI(d), // 密钥为 d 的编码结果
			time: c // 时间为 c
		},
		success: function(i) { // 请求成功后执行的函数，参数为 i
			if (i.code == 200 && !!i.data) { // 如果 i 的 code 属性等于 200 并且 i 的 data 属性存在
				var h = bps.getDeSecretResult(i.data); // 调用 bps.getDeSecretResult 函数，传入 i.data 作为参数，得到解密后的结果，赋值给变量 h
				studyCodes = h.split(","); // 把 h 按照逗号分割成数组，赋值给 studyCodes 变量
				bps.startCodeTask(true) // 调用 bps.startCodeTask 函数，传入 true 作为参数
			}
		}
	})
};
// 定义一个函数，名为 bps.startCodeTask，接受一个参数 h
bps.startCodeTask = function(h) {
	// 如果 h 为假，调用 bps.startVideoOrAudio 函数，传入 true 作为参数
	if (!h) {
		bps.startVideoOrAudio(true)
	}
	// 创建一个空数组，赋值给变量 c
	var c = new Array();
	// 从 cookie 中获取登录用户的信息，赋值给变量 d
	var d = base.getCookie("loginUser");
	// 如果 d 不存在，直接返回
	if (!!!d) {
		return
	}
	// 调用 bps.getStudyTimecur 函数，得到当前学习时间，赋值给变量 a
	var a = bps.getStudyTimecur();
	// 如果 a 存在并且 h 为假，调用 bps.codeKeepTime 函数，传入 "ware_time_num" 作为参数
	if (!!a && !h) {
		bps.codeKeepTime("ware_time_num")
	}
	// 如果 vCodeTask 变量存在，清除它的定时器，并把它设为 null
	if (!!vCodeTask) {
		clearTimeout(vCodeTask);
		vCodeTask = null
	}
	// 获取 id 为 courseWareId 的元素的值，赋值给变量 e
	var e = $("#courseWareId")
		.val();
	// 如果 cookie 中有 "captch_2_" + e + "_" + d.userAccount 的值，把它赋值给 c
	if (!!base.getCookie("captch_2_" + e + "_" + d.userAccount)) {
		c = base.getCookie("captch_2_" + e + "_" + d.userAccount)
	}
	// 把 studyCodes 变量赋值给变量 g
	var g = studyCodes;
	// 如果 c 的长度大于 0，把 studyCodes 从 c 的长度开始截取，赋值给 g
	if (c.length > 0) {
		g = studyCodes.slice(c.length)
	}
	// 如果 g 存在并且 g 的长度大于 0，把 g 的第一个元素赋值给 curCode 变量，否则把 curCode 设为 null
	if (!!g && g.length > 0) {
		curCode = g[0]
	} else {
		curCode = null
	}
	// 从 cookie 中获取 "captch_r_" + e + "_" + d.userAccount 的值，赋值给变量 f
	var f = base.getCookie("captch_r_" + e + "_" + d.userAccount);
	// 如果 f 不存在或者 f 没有 sk 属性，直接返回
	if (!f || !f.sk) {
		return
	}
	// 把 f 的 second 属性赋值给变量 b
	var b = f.second;
	// 如果 curCode 存在并且 c 中不包含 curCode，设置一个定时器，时间为 b * 1000 毫秒，执行以下函数：
	if (!!curCode && c.indexOf(curCode) < 0) {
		vCodeTask = setTimeout(function() {
			layer.open({ // 调用 layer.open 函数，传入以下对象作为参数：
				type: 2, // 类型为 2
				title: false, // 标题为 false
				shadeClose: false, // 遮罩层不可关闭
				skin: "layer-captch", // 皮肤类名为 layer-captch
				closeBtn: 0, // 关闭按钮为 0
				shade: 0.8, // 遮罩层透明度为 0.8
				area: ["320px", "420px"], // 区域大小为 320px * 420px
				content: "/baseui/vendor/mui/numbers.html", // 内容为 "/baseui/vendor/mui/numbers.html"
				success: function(k, m) { // 打开成功后执行的函数，参数为 k 和 m
					var j = layer.getChildFrame("body", m); // 获取弹出层的 body 元素，赋值给变量 j
					j.find("#type") // 找到 id 为 type 的元素
						.val(2); // 设置它的值为 2
					j.find("#pointTip") // 找到 id 为 pointTip 的元素
						.show(); // 显示它
					j.find("#number") // 找到 id 为 number 的元素
						.html(curCode); // 设置它的 html 为 curCode
					j.find("#timecur") // 找到 id 为 timecur 的元素
						.val(e); // 设置它的值为 e
					j.find("#colseCallback") // 找到 id 为 colseCallback 的元素
						.val("parent.bps.startCodeTask"); // 设置它的值为 "parent.bps.startCodeTask"
					var l = bps.getStudyTimecur(); // 调用 bps.getStudyTimecur 函数，得到当前学习时间，赋值给变量 l
					if (!!l) { // 如果 l 存在
						let stopStartTime = base.getCookie("s_start" + l); // 从 cookie 中获取 "s_start" + l 的值，赋值给变量 stopStartTime
						if (!!!stopStartTime) { // 如果 stopStartTime 不存在
							stopStartTime = Math.round(new Date() // 获取当前时间的毫秒数，四舍五入，赋值给 stopStartTime
								.getTime());
							base.addCookie("s_start" + l, stopStartTime, { // 调用 base.addCookie 函数，传入 "s_start" + l, stopStartTime 和以下对象作为参数：
								path: "/" // 路径为 "/"
							})
						}
						bps.stopTiming() // 调用 bps.stopTiming 函数
					}
					bps.startVideoOrAudio(false) // 调用 bps.startVideoOrAudio 函数，传入 false 作为参数
				}
			})
		}, b * 1000)
	}
};
// 定义一个函数，名为 bps.startVideoOrAudio，接受一个参数 a
bps.startVideoOrAudio = function(a) {
	// 如果 a 等于 false，执行以下操作：
	if (a == false) {
		// 如果 curWareType 变量等于 3，执行以下操作：
		if (curWareType == 3) {
			var c = $("#player2"); // 获取 id 为 player2 的元素，赋值给变量 c
			if (!!c && !c[0].paused) { // 如果 c 存在并且 c 的第一个元素没有暂停，执行以下操作：
				videoStart = true; // 把 videoStart 变量设为 true
				c[0].pause(); // 调用 c 的第一个元素的 pause 方法
				$(".psVideo-play-btn") // 获取类名为 psVideo-play-btn 的元素
					.removeClass("psVideo-play") // 移除 psVideo-play 类名
					.addClass("psVideo-stop"); // 添加 psVideo-stop 类名
				$(".psVideo-play-one") // 获取类名为 psVideo-play-one 的元素
					.show(); // 显示它
				$(".psVideo-dan-all") // 获取类名为 psVideo-dan-all 的元素
					.css("animation-play-state", "paused") // 设置它的 css 属性 animation-play-state 为 paused
			}
		} else {
			// 否则，如果 curWareType 变量等于 5，执行以下操作：
			if (curWareType == 5) {
				var b = document.getElementById("audio"); // 获取 id 为 audio 的元素，赋值给变量 b
				if (!!b && !b.paused) { // 如果 b 存在并且 b 没有暂停，执行以下操作：
					videoStart = true; // 把 videoStart 变量设为 true
					b.pause(); // 调用 b 的 pause 方法
					$("#playlogo") // 获取 id 为 playlogo 的元素
						.attr("src", "/baseui/images/play.png") // 设置它的 src 属性为 "/baseui/images/play.png"
				}
			}
		}
	} else {
		// 否则，执行以下操作：
		if (videoStart == true) { // 如果 videoStart 变量等于 true，执行以下操作：
			if (curWareType == 3) { // 如果 curWareType 变量等于 3，执行以下操作：
				var c = $("#player2"); // 获取 id 为 player2 的元素，赋值给变量 c
				if (!!c && c[0].paused) { // 如果 c 存在并且 c 的第一个元素已经暂停，执行以下操作：
					videoStart = null; // 把 videoStart 变量设为 null
					c[0].play(); // 调用 c 的第一个元素的 play 方法
					$(".psVideo-play-btn") // 获取类名为 psVideo-play-btn 的元素
						.removeClass("psVideo-stop") // 移除 psVideo-stop 类名
						.addClass("psVideo-play"); // 添加 psVideo-play 类名
					$(".psVideo-play-one") // 获取类名为 psVideo-play-one 的元素
						.hide(); // 隐藏它
					$(".psVideo-dan-all") // 获取类名为 psVideo-dan-all 的元素
						.css("animation-play-state", "running") // 设置它的 css 属性 animation-play-state 为 running
				}
			} else {
				// 否则，如果 curWareType 变量等于 5，执行以下操作：
				if (curWareType == 5) {
					var b = document.getElementById("audio"); // 获取 id 为 audio 的元素，赋值给变量 b
					if (!!b && b.paused) { // 如果 b 存在并且 b 已经暂停，执行以下操作：
						videoStart = null; // 把 videoStart 变量设为 null
						b.play(); // 调用 b 的 play 方法
						$("#playlogo") // 获取 id 为 playlogo 的元素
							.attr("src", "/baseui/images/stop.png") // 设置它的 src 属性为 "/baseui/images/stop.png"
					}
				}
			}
		}
	}
};
// 定义一个函数，名为saveUserVideoViewingRecord，接受两个参数o和f
bps.saveUserVideoViewingRecord = function(o, f) {
	// 从cookie中获取登录用户的信息，赋值给变量d
	var d = base.getCookie("loginUser");
	// 从cookie中获取课程的信息，赋值给变量j
	var j = base.getCookie("course");
	// 从cookie中获取课件的信息，赋值给变量e
	var e = base.getCookie("courseware");
	// 如果没有登录用户，或者用户类型不是1，或者没有课程或课件的信息，就返回
	if (!d || d.userType != 1 || !j || !e) {
		return
	}
	// 把课程的信息赋值给变量i
	var i = j;
	// 把课件的id赋值给变量n，如果有参数o，就用o代替
	var n = e.id;
	if (o) {
		n = o
	}
	// 从cookie中获取课程进度的信息，赋值给变量c
	var c = base.getCookie("courseProgress");
	// 如果没有课程进度的信息，或者没有当前课件的进度，就返回
	if (!c || !c[n]) {
		return
	}
	// 把登录用户的账号赋值给变量b
	var b = d.userAccount;
	// 如果没有参数f，就从cookie中获取一个验证码，赋值给变量m，然后用m的sk属性作为密钥，赋值给f；如果有参数f，就直接用f作为密钥
	if (!f) {
		var m = base.getCookie("captch_r_" + n + "_" + b);
		f = (!!m && !!m.sk) ? bps.getSecretResult(m.sk) : ""
	}
	// 把当前课件的进度分割成一个数组，赋值给变量g
	var g = c[n].split("_");
	// 把数组g的第一个元素（学习时间）赋值给变量q
	var q = g[0];
	// 把数组g的第三个元素（完成状态）赋值给变量a
	var a = g[2];
	// 获取当前时间的毫秒数，赋值给变量p
	var p = new Date()
		.getTime();
	// 拼接一个字符串，包含p、用户会话、用户账号、终端代码、课程id、课件id和学习时间，用分号隔开，赋值给变量h
	var h = p + ";" + d.sid + ";" + b + ";" + bps.url.terminalCode + ";" + i + ";" + n + ";" + q;
	// 调用bps.getSecretResult函数，传入h作为参数，得到一个学习密钥，赋值给变量l
	var l = bps.getSecretResult(h);
	// 调用jQuery的ajax方法，发送一个post请求到服务器
	jQuery.ajax({
	    // 指定请求类型为post
		type: "post",
	    // 指定请求的url为bps.url.courseware.resetLearnProgress
		url: bps.url.courseware.resetLearnProgress,
	    // 指定请求的数据为一个对象，包含用户账号、终端代码、验证码密钥、学习密钥、完成状态和来源等属性
		data: {
			userAccount: b,
			terminalCode: bps.url.terminalCode,
			secretKey: f,
			learnKey: l,
			isFinished: a,
			source: 1
		},
	    // 指定返回数据的类型为json
		dataType: "json",
	    // 指定请求是否异步，这里设置为false（同步）
		async: false,
// 指定请求成功的回调函数，参数k是返回的数据，这里没有做任何处理
		success: function(k) {},
// 指定请求失败的回调函数，参数r是返回的对象，k是错误类型，s是错误信息，这里也没有做任何处理
		error: function(r, k, s) {}
// 结束ajax方法的调用
	})
// 结束函数的定义
};
// 定义一个函数，名为 bps.commitStudy
bps.commitStudy = function() {
	var n = 0; // 定义一个变量 n，赋值为 0
	var e = base.getCookie("loginUser"); // 从 cookie 中获取 loginUser 的值，赋值给变量 e
	if (!e || e.userType != 1) { // 如果 e 不存在或者 e 的 userType 属性不等于 1，执行以下操作：
		bps.popwinOpenTextForOutLine(true); // 调用 bps.popwinOpenTextForOutLine 函数，传入 true 作为参数
		return // 返回
	}
	var i = base.getCookie("course"); // 从 cookie 中获取 course 的值，赋值给变量 i
	var f = base.getCookie("courseware"); // 从 cookie 中获取 courseware 的值，赋值给变量 f
	if (!i || !f) { // 如果 i 或 f 不存在，直接返回
		return
	}
	var o = f.id; // 把 f 的 id 属性赋值给变量 o
	var a = base.getCookie("courseProgress"); // 从 cookie 中获取 courseProgress 的值，赋值给变量 a
	if (!a || !a[o]) { // 如果 a 或 a[o] 不存在，直接返回
		return
	}
	var b = e.userAccount; // 把 e 的 userAccount 属性赋值给变量 b
	var m = base.getCookie("captch_r_" + o + "_" + b); // 从 cookie 中获取 "captch_r_" + o + "_" + b 的值，赋值给变量 m
	var d = (!!m && !!m.sk) ? bps.getSecretResult(m.sk) : ""; // 如果 m 和 m.sk 都存在，调用 bps.getSecretResult 函数，传入 m.sk 作为参数，得到结果，赋值给变量 d；否则把空字符串赋值给 d
	bps.saveUserVideoViewingRecord(null, d); // 调用 bps.saveUserVideoViewingRecord 函数，传入 null 和 d 作为参数
	var l = base.getCookie("captch_2_" + o + "_" + b); // 从 cookie 中获取 "captch_2_" + o + "_" + b 的值，赋值给变量 l
	l = JSON.stringify(l); // 把 l 转换成 JSON 字符串，赋值给 l
	var p = bps.getSystemTime(); // 调用 bps.getSystemTime 函数，得到系统时间，赋值给变量 p
	var g = a[o].split("_"); // 把 a[o] 按照下划线分割成数组，赋值给变量 g
	var h = p + "|" + b + "|" + bps.url.terminalCode + "|" + e.domainCode + "|" + e.sid + "|" + i + "|" + o + "|" + g[2] + "|" + (!!l ? l : ""); // 拼接 p, b, bps.url.terminalCode, e.domainCode, e.sid, i, o, g[2] 和 l（如果存在）或空字符串，用竖线分隔，赋值给变量 h
	var j = bps.getSecretResult(h); // 调用 bps.getSecretResult 函数，传入 h 作为参数，得到结果，赋值给变量 j
	var c = bps.getSecretResult(o + ";" + g[2]); // 调用 bps.getSecretResult 函数，传入 o 和 g[2] 拼接的字符串作为参数，得到结果，赋值给变量 c
	jQuery.ajax({ // 发送一个 ajax 请求，设置以下参数：
		type: "post", // 请求类型为 post
		async: false, // 请求为同步
		url: bps.url.courseware.commitStudy, // 请求的 url 为 bps.url.courseware.commitStudy
		data: { // 请求的数据为以下对象：
			userAccount: b, // 用户账号为 b
			terminalCode: bps.url.terminalCode, // 终端代码为 bps.url.terminalCode
			secretKey: d, // 密钥为 d
			secondaryKey: j, // 次级密钥为 j
			rkey: c, // rkey 为 c
			timestamp: Date.parse(new Date()) // 时间戳为当前日期的毫秒数
		},
		success: function(k) { // 请求成功后执行的函数，参数为 k
			if (k.code != 200) { // 如果 k 的 code 属性不等于 200，执行以下操作：
				if (k.code == 301) { // 如果 k 的 code 属性等于 301，什么也不做

				} else {
					if (k.code == 302) { // 否则，如果 k 的 code 属性等于 302，执行以下操作：
						n = 2 // 把 n 设为 2
					} else {
						base.addCookie("captch_2_" + o + "_" + e.userAccount, null, { // 调用 base.addCookie 函数，传入 "captch_2_" + o + "_" + e.userAccount, null 和以下对象作为参数：
							path: "/bps/", // 路径为 "/bps/"
							expires: -1 // 过期时间为 -1
						});
						base.addCookie("captch_r_" + o + "_" + e.userAccount, null, { // 调用 base.addCookie 函数，传入 "captch_r_" + o + "_" + e.userAccount, null 和以下对象作为参数：
							path: "/bps/", // 路径为 "/bps/"
							expires: -1 // 过期时间为 -1
						});
						base.addCookie("loginUser", null, { // 调用 base.addCookie 函数，传入 "loginUser", null 和以下对象作为参数：
							path: "/", // 路径为 "/"
							expires: -1 // 过期时间为 -1
						});
						bps.popwinOpenTextForOutLine(true) // 调用 bps.popwinOpenTextForOutLine 函数，传入 true 作为参数
					}
				}
			} else { // 否则，执行以下操作：
				if (k.isFinished == 0) { // 如果 k 的 isFinished 属性等于 0，执行以下操作：
					n = 0 // 把 n 设为 0
				} else { // 否则，执行以下操作：
					n = 1 // 把 n 设为 1
				}
				if (!((f.type == 3 || f.type == 5) && g[2] == 1)) { // 如果不满足以下条件：f 的 type 属性等于 3 或 5，并且 g 的第三个元素等于 1，执行以下操作：
					base.addCookie("captch_2_" + o + "_" + e.userAccount, null, { // 调用 base.addCookie 函数，传入 "captch_2_" + o + "_" + e.userAccount, null 和以下对象作为参数：
						path: "/bps/", // 路径为 "/bps/"
						expires: -1 // 过期时间为 -1
					});
					base.addCookie("captch_r_" + o + "_" + e.userAccount, null, { // 调用 base.addCookie 函数，传入 "captch_r_" + o + "_" + e.userAccount, null 和以下对象作为参数：
						path: "/bps/", // 路径为 "/bps/"
						expires: -1 // 过期时间为 -1
					})
				}
			}
		},
		error: function(k) { // 请求失败后执行的函数，参数为 k
			base.addCookie("captch_2_" + o + "_" + e.userAccount, null, { // 调用 base.addCookie 函数，传入 "captch_2_" + o + "_" + e.userAccount, null 和以下对象作为参数：
				path: "/bps/", // 路径为 "/bps/"
				expires: -1 // 过期时间为 -1
			});
			base.addCookie("captch_r_" + o + "_" + e.userAccount, null, { // 调用 base.addCookie 函数，传入 "captch_r_" + o + "_" + e.userAccount, null 和以下对象作为参数：
				path: "/bps/", // 路径为 "/bps/"
				expires: -1 // 过期时间为 -1
			})
		}
	});
	return n // 返回 n
};
// 定义一个函数，名为 bps.getNewStudyRecord，接受四个参数 d, b, h, f
bps.getNewStudyRecord = function(d, b, h, f) {
	var g = 0; // 定义一个变量 g，赋值为 0
	var e = new Date() // 创建一个新的日期对象，赋值给变量 e
		.getTime(); // 获取 e 的毫秒数，赋值给 e
	var c = d + ";" + b + ";" + h + ";" + f + ";" + e + ";" + bps.url.terminalCode; // 拼接 d, b, h, f, e 和 bps.url.terminalCode，用分号分隔，赋值给变量 c
	var a = bps.getSecretResult(c); // 调用 bps.getSecretResult 函数，传入 c 作为参数，得到结果，赋值给变量 a
	$.ajax({ // 发送一个 ajax 请求，设置以下参数：
		type: "post", // 请求类型为 post
		url: bps.url.courseware.getUserStudyRecord, // 请求的 url 为 bps.url.courseware.getUserStudyRecord
		data: { // 请求的数据为以下对象：
			userAccount: d, // 用户账号为 d
			terminalCode: bps.url.terminalCode, // 终端代码为 bps.url.terminalCode
			skey: a // skey 为 a
		},
		dataType: "json", // 数据类型为 json
		async: false, // 请求为同步
		success: function(i) { // 请求成功后执行的函数，参数为 i
			if (i.code == 200) { // 如果 i 的 code 属性等于 200，执行以下操作：
				g = i.data // 把 i 的 data 属性赋值给 g
			}
		}
	});
	return g // 返回 g
};
// 定义一个函数，名为 bps.getCourseWareDetail，接受一个参数 b
bps.getCourseWareDetail = function(b) {
	var a = {}; // 定义一个空对象，赋值给变量 a
	$.ajax({ // 发送一个 ajax 请求，设置以下参数：
		type: "get", // 请求类型为 get
		async: false, // 请求为同步
		url: bps.url.courseware.courseWareContentUrl + "?coursewareId=" + b + "&time=" + new Date(), // 请求的 url 为 bps.url.courseware.courseWareContentUrl 加上查询字符串 coursewareId 和 time，分别为 b 和当前日期的值
		success: function(d) { // 请求成功后执行的函数，参数为 d
			var c = base.nrMultiLineText2Array(d); // 调用 base.nrMultiLineText2Array 函数，传入 d 作为参数，得到结果，赋值给变量 c
			if (!!c) { // 如果 c 存在，执行以下操作：
				a = jQuery.parseJSON(c) // 把 c 解析成 JSON 对象，赋值给 a
			}
		}
	});
	return a // 返回 a
};
bps.loadCourseWareProgress = function(h) {
    // 获取名为 "loginUser" 的 cookie 值并将其存储在变量 d 中
    var d = base.getCookie("loginUser");
    // 获取名为 "course" 的 cookie 值并将其存储在变量 f 中
    var f = base.getCookie("course");
    // 如果 d 不存在，或者 d 的 userType 属性不等于 1，或者 f 不存在，则返回
    if (!d || d.userType != 1 || !f) {
        return
    }
    // 获取 id 为 "courseId" 的元素的值并将其存储在变量 i 中
    var i = $("#courseId")
        .val();
    // 如果 f 不等于 i，则返回
    if (f != i) {
        return
    }
    // 将 d 的 userAccount 属性存储在变量 b 中
    var b = d.userAccount;
    // 获取名为 "courseProgress" 的 cookie 值并将其存储在变量 a 中
    var a = base.getCookie("courseProgress");
    // 如果 a 不存在，或者 a 的 h 属性不存在，则返回
    if (!a || !a[h]) {
        return
    }
    // 将 a 的 h 属性以 "_" 分割并存储在变量 e 中
    var e = a[h].split("_");
    // 如果 e 的第三个元素等于 1，则执行以下操作：
    if (e[2] == 1) {
        // 将 id 为 "buttonName" + h 的元素的 innerHTML 设置为 "复习"
        $("#buttonName" + h)
            .html("复习");
        // 将 id 为 "buttonName" + h 的元素的 class 属性设置为 "classLogin classLogin-width yellow"
        $("#buttonName" + h)
            .attr("class", "classLogin classLogin-width yellow");
        // 将 id 为 "studyRate" + h 的元素的文本设置为 "100%"
        $("#studyRate" + h)
            .text("100%");
        // 将 id 为 "studyRate" + h 的元素的父元素的 width 和 text-align 属性分别设置为 "100%" 和 "center"
        $("#studyRate" + h)
            .parent()
            .css({
                width: "100%",
                "text-align": "center"
            });
        // 将 id 为 "studyRateB" + h 的元素的 width 属性设置为 "100%"
        $("#studyRateB" + h)
            .css({
                width: "100%"
            });
        // 将 id 为 "load" + h 的元素的 class 属性设置为 "assure assureposition"
        $("#load" + h)
            .attr("class", "assure assureposition");
        // 将 id 为 "load" + h 的元素的 innerHTML 设置为 '<img src="/baseui/images/success.png">'
        $("#load" + h)
            .html('<img src="/baseui/images/success.png">')
// 如果 e 的第三个元素不等于 1，则执行以下操作：
} else {
	// 调用 bps.getNewStudyRecord 函数并将其返回值存储在变量 c 中
	var c = bps.getNewStudyRecord(b, d.sid, f, h);
	// 如果 c 大于 e 的第一个元素，则执行以下操作：
	if (c > e[0]) {
		// 调用 bps.getCourseWareDetail 函数并获取其返回值的 courseDuration 属性，将其存储在变量 j 中
		var j = bps.getCourseWareDetail(h)
			.courseDuration;
		// 如果 j 不存在，则返回
		if (!j) {
			return
		}
		// 计算 c 与 j 的百分比并将其存储在变量 g 中
		var g = Math.floor(c * 100 / j);
		// 将 e 的第二个元素设置为 g，如果 g 是 NaN，则设置为 0
		e[1] = (isNaN(g) ? 0 : g)
	} else {
		// 如果 e 的第二个元素大于 100，则将其设置为 100
		if (e[1] > 100) {
			e[1] = 100
		}
	}
	// 在 e 的第二个元素后面添加 "%"
	e[1] += "%";
	// 将 id 为 "studyRate" + h 的元素的父元素的 width 和 text-align 属性分别设置为 e 的第二个元素和 "center"
	$("#studyRate" + h)
		.parent()
		.css({
			width: (e[1] == "0%" ? "inherit" : e[1]),
			"text-align": "center"
		});
	// 将 id 为 "studyRate" + h 的元素的文本设置为 e 的第二个元素
	$("#studyRate" + h)
		.text(e[1]);
	// 将 id 为 "studyRateB" + h 的元素的 width 属性设置为 e 的第二个元素
	$("#studyRateB" + h)
		.css({
			width: e[1]
		});
	// 如果 e 的第二个元素不等于 "0%" 并且 id 为 "buttonName" + h 的元素没有 class 属性值为 "green"，则执行以下操作：
	if (e[1] != "0%" && !$("#buttonName" + h)
		.hasClass("green")) {
		// 将 id 为 "buttonName" + h 的元素的 innerHTML 设置为 "继续学习"
		$("#buttonName" + h)
			.html("继续学习");
		// 将 id 为 "buttonName" + h 的元素的 class 属性设置为 "classLogin classLogin-width green"
		$("#buttonName" + h)
			.attr("class", "classLogin classLogin-width green")
	}
	// 如果 c 大于等于 e 的第一个元素，则返回
	if (c >= e[0]) {
		return
	}
	// 调用 bps.saveUserVideoViewingRecord 函数并传入参数 h
	bps.saveUserVideoViewingRecord(h)
}
}; 