var studiedId;
var progressStudied = {};
var studyCodes;
var curCode;
var vCodeTask;
var videoStart = null;
bps.courseWareList = function(a) {
	$.ajax({
		type: "get",
		url: bps.url.courseware.courseWareListUrl + "?courseId=" + a + "&time=" + new Date(),
		success: function(c) {
			var b = base.nrMultiLineText2Array(c);
			bps.courseWareListView(b, a);
			bps.getNoteList(1)
		}
	})
};
bps.loadCoursewareMulu = function() {
	if (dataObjs != null && dataObjs != "undefined" && dataObjs != "") {
		bps.loadCoursewareMuluView(dataObjs)
	} else {
		var a = base.getUrlParameters()
			.c;
		jQuery.ajax({
			type: "get",
			url: bps.url.courseware.courseWareListUrl + "?courseId=" + a + "&time=" + new Date(),
			success: function(b) {
				dataObjs = b;
				bps.loadCoursewareMuluView(b)
			}
		})
	}
};
bps.getStudiedPeriod = function(e) {
	var d = base.getCookie("loginUser");
	var c = new Date()
		.getTime();
	var b = c + ";" + d.userAccount + ";" + bps.url.terminalCode + ";" + d.sid + ";" + e;
	var a = bps.getSecretResult(b);
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
			if (f.code == 200) {
				progressStudied = f.data
			}
		}
	})
};
bps.comeCoursewareDetail = function(d, h, f, e) {
	var b = base.getCookie("loginUser");
	if (!!!b) {
		e == 1 ? bps.courseWareDetailNew(h, f) : bps.courseWareDetail(h, f);
		return
	}
	if (b.domainCode.indexOf("100006") == 0) {
		bps.delStartTime()
	}
	var a = b.userAccount;
	var i = new Date()
		.getTime();
	var c = i + ";" + a + ";" + b.sid + ";" + d + ";" + h + ";" + bps.url.terminalCode;
	var g = bps.getSecretResult(c);
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
			var j = base.getCookie("course");
			var k = base.getCookie("courseware");
			if (j && k) {
				base.addCookie("captch_2_" + k.id + "_" + a, null, {
					path: "/bps/",
					expires: -1
				});
				base.addCookie("captch_r_" + k.id + "_" + a, null, {
					path: "/bps/",
					expires: -1
				})
			}
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
								bps.courseWareDetail(h, f, d);
								return
							},
							btn2: function(n, m) {
								layer.close(n);
								bps.courseWareDetail(h, f);
								return
							}
						})
					}
				} else {
					base.addCookie("loginUser", null, {
						path: "/",
						expires: -1
					});
					var l = "<p>您的账号在其他地方登录，请您重新登录并及时修改密码。</p>";
					l += "<div class='tanchu_btn'>";
					l += "<a id='popwinConfirms' href='javascript:void(0)' class='tanchu_btn01'>确定</a>";
					l += "</div>";
					bps.createPopwinForStudy("操作提示", null, null, l);
					$("#popwinConfirms")
						.click(function() {
							if (!!opener) {
								opener.location.reload();
								window.opener = null;
								window.open("", "_self");
								window.close()
							} else {
								location.reload()
							}
							$.cookie("courseware", null, {
								path: "/bps",
								expires: -1
							})
						});
					bps.popwinShowForStudy()
				}
			}
		},
		error: function() {
			base.popwinOpenText({
				msg: "请求失败，请重试！",
				hasConfirm: true
			})
		}
	})
};
bps.initStudy = function(e) {
	var d = base.getCookie("loginUser");
	if (!d) {
		return
	}
	base.addCookie("captch_r_" + e + "_" + d.userAccount, null, {
		path: "/bps/",
		expires: -1
	});
	var f = base.getUrlParameters()
		.c;
	var b = bps.getSystemTime();
	var a = b + ";" + d.userAccount + ";" + d.sid + ";" + f + "_" + e + ";" + bps.url.terminalCode;
	var c = bps.getSecretResult(a);
	jQuery.ajax({
		type: "post",
		url: bps.url.captch.initStudyExam,
		data: {
			userAccount: d.userAccount,
			terminalCode: bps.url.terminalCode,
			type: 2,
			secondaryKey: encodeURI(c),
			time: b
		},
		async: false,
		success: function(k) {
			if (k.code == 200 && !!k.data) {
				if (!!k.data.secretKey) {
					var j = CryptoJS.enc.Utf8.parse(bps.url.captch.key);
					var i = CryptoJS.enc.Utf8.parse(bps.url.captch.iv);
					var h = CryptoJS.AES.decrypt(k.data.secretKey, j, {
						iv: i,
						mode: CryptoJS.mode.CBC,
						padding: CryptoJS.pad.Pkcs7
					});
					h = h.toString(CryptoJS.enc.Utf8);
					h = h.replace(/\u0000/g, "");
					var g = h.split(";");
					base.addCookie("captch_r_" + e + "_" + d.userAccount, {
						sk: k.data.secretKey,
						second: g[3]
					}, {
						path: "/bps/",
						expires: getExpires()
					});
					if (g[3] == -1 || g[4] == 0) {
						return
					}
					bps.geStudyVodes(k.data.secretKey, e)
				}
			} else {
				if (k.code == 411) {
					bps.popwinOpenTextForOutLine(true);
					base.addCookie("captch_r_" + e + "_" + d.userAccount, null, {
						path: "/bps/",
						expires: -1
					})
				} else {
					base.addCookie("captch_r_" + e + "_" + d.userAccount, null, {
						path: "/bps/",
						expires: -1
					})
				}
			}
		}
	})
};

function getExpires() {
	var b = Math.round(new Date()
		.getTime());
	var a = new Date();
	a.setHours(23);
	a.setMinutes(59);
	a.setSeconds(59);
	var c = Math.round(a.getTime());
	shengunix = c - b;
	return shengunix / (86400000)
}
bps.geStudyVodes = function(a, f) {
	var e = base.getCookie("loginUser");
	var g = window.parent.base.getUrlParameters()
		.c;
	var c = new Date()
		.getTime();
	var b = c + ";" + a + ";" + bps.url.captch.key + ";" + g + "_" + f + ";" + e.userAccount + ";" + bps.url.terminalCode;
	var d = bps.getSecretResult(b);
	jQuery.ajax({
		type: "post",
		async: false,
		url: bps.url.captch.getVodes,
		data: {
			type: 2,
			userAccount: e.userAccount,
			terminalCode: bps.url.terminalCode,
			secretKey: encodeURI(d),
			time: c
		},
		success: function(i) {
			if (i.code == 200 && !!i.data) {
				var h = bps.getDeSecretResult(i.data);
				studyCodes = h.split(",");
				bps.startCodeTask(true)
			}
		}
	})
};
bps.startCodeTask = function(h) {
	if (!h) {
		bps.startVideoOrAudio(true)
	}
	var c = new Array();
	var d = base.getCookie("loginUser");
	if (!!!d) {
		return
	}
	var a = bps.getStudyTimecur();
	if (!!a && !h) {
		bps.codeKeepTime("ware_time_num")
	}
	if (!!vCodeTask) {
		clearTimeout(vCodeTask);
		vCodeTask = null
	}
	var e = $("#courseWareId")
		.val();
	if (!!base.getCookie("captch_2_" + e + "_" + d.userAccount)) {
		c = base.getCookie("captch_2_" + e + "_" + d.userAccount)
	}
	var g = studyCodes;
	if (c.length > 0) {
		g = studyCodes.slice(c.length)
	}
	if (!!g && g.length > 0) {
		curCode = g[0]
	} else {
		curCode = null
	}
	var f = base.getCookie("captch_r_" + e + "_" + d.userAccount);
	if (!f || !f.sk) {
		return
	}
	var b = f.second;
	if (!!curCode && c.indexOf(curCode) < 0) {
		vCodeTask = setTimeout(function() {
			layer.open({
				type: 2,
				title: false,
				shadeClose: false,
				skin: "layer-captch",
				closeBtn: 0,
				shade: 0.8,
				area: ["320px", "420px"],
				content: "/baseui/vendor/mui/numbers.html",
				success: function(k, m) {
					var j = layer.getChildFrame("body", m);
					j.find("#type")
						.val(2);
					j.find("#pointTip")
						.show();
					j.find("#number")
						.html(curCode);
					j.find("#timecur")
						.val(e);
					j.find("#colseCallback")
						.val("parent.bps.startCodeTask");
					var l = bps.getStudyTimecur();
					if (!!l) {
						let stopStartTime = base.getCookie("s_start" + l);
						if (!!!stopStartTime) {
							stopStartTime = Math.round(new Date()
								.getTime());
							base.addCookie("s_start" + l, stopStartTime, {
								path: "/"
							})
						}
						bps.stopTiming()
					}
					bps.startVideoOrAudio(false)
				}
			})
		}, b * 1000)
	}
};
bps.startVideoOrAudio = function(a) {
	if (a == false) {
		if (curWareType == 3) {
			var c = $("#player2");
			if (!!c && !c[0].paused) {
				videoStart = true;
				c[0].pause();
				$(".psVideo-play-btn")
					.removeClass("psVideo-play")
					.addClass("psVideo-stop");
				$(".psVideo-play-one")
					.show();
				$(".psVideo-dan-all")
					.css("animation-play-state", "paused")
			}
		} else {
			if (curWareType == 5) {
				var b = document.getElementById("audio");
				if (!!b && !b.paused) {
					videoStart = true;
					b.pause();
					$("#playlogo")
						.attr("src", "/baseui/images/play.png")
				}
			}
		}
	} else {
		if (videoStart == true) {
			if (curWareType == 3) {
				var c = $("#player2");
				if (!!c && c[0].paused) {
					videoStart = null;
					c[0].play();
					$(".psVideo-play-btn")
						.removeClass("psVideo-stop")
						.addClass("psVideo-play");
					$(".psVideo-play-one")
						.hide();
					$(".psVideo-dan-all")
						.css("animation-play-state", "running")
				}
			} else {
				if (curWareType == 5) {
					var b = document.getElementById("audio");
					if (!!b && b.paused) {
						videoStart = null;
						b.play();
						$("#playlogo")
							.attr("src", "/baseui/images/stop.png")
					}
				}
			}
		}
	}
};
bps.saveUserVideoViewingRecord = function(o, f) {
	var d = base.getCookie("loginUser");
	var j = base.getCookie("course");
	var e = base.getCookie("courseware");
	if (!d || d.userType != 1 || !j || !e) {
		return
	}
	var i = j;
	var n = e.id;
	if (o) {
		n = o
	}
	var c = base.getCookie("courseProgress");
	if (!c || !c[n]) {
		return
	}
	var b = d.userAccount;
	if (!f) {
		var m = base.getCookie("captch_r_" + n + "_" + b);
		f = (!!m && !!m.sk) ? bps.getSecretResult(m.sk) : ""
	}
	var g = c[n].split("_");
	var q = g[0];
	var a = g[2];
	var p = new Date()
		.getTime();
	var h = p + ";" + d.sid + ";" + b + ";" + bps.url.terminalCode + ";" + i + ";" + n + ";" + q;
	var l = bps.getSecretResult(h);
	jQuery.ajax({
		type: "post",
		url: bps.url.courseware.resetLearnProgress,
		data: {
			userAccount: b,
			terminalCode: bps.url.terminalCode,
			secretKey: f,
			learnKey: l,
			isFinished: a,
			source: 1
		},
		dataType: "json",
		async: false,
		success: function(k) {},
		error: function(r, k, s) {}
	})
};
bps.commitStudy = function() {
	var n = 0;
	var e = base.getCookie("loginUser");
	if (!e || e.userType != 1) {
		bps.popwinOpenTextForOutLine(true);
		return
	}
	var i = base.getCookie("course");
	var f = base.getCookie("courseware");
	if (!i || !f) {
		return
	}
	var o = f.id;
	var a = base.getCookie("courseProgress");
	if (!a || !a[o]) {
		return
	}
	var b = e.userAccount;
	var m = base.getCookie("captch_r_" + o + "_" + b);
	var d = (!!m && !!m.sk) ? bps.getSecretResult(m.sk) : "";
	bps.saveUserVideoViewingRecord(null, d);
	var l = base.getCookie("captch_2_" + o + "_" + b);
	l = JSON.stringify(l);
	var p = bps.getSystemTime();
	var g = a[o].split("_");
	var h = p + "|" + b + "|" + bps.url.terminalCode + "|" + e.domainCode + "|" + e.sid + "|" + i + "|" + o + "|" + g[2] + "|" + (!!l ? l : "");
	var j = bps.getSecretResult(h);
	var c = bps.getSecretResult(o + ";" + g[2]);
	jQuery.ajax({
		type: "post",
		async: false,
		url: bps.url.courseware.commitStudy,
		data: {
			userAccount: b,
			terminalCode: bps.url.terminalCode,
			secretKey: d,
			secondaryKey: j,
			rkey: c,
			timestamp: Date.parse(new Date())
		},
		success: function(k) {
			if (k.code != 200) {
				if (k.code == 301) {} else {
					if (k.code == 302) {
						n = 2
					} else {
						base.addCookie("captch_2_" + o + "_" + e.userAccount, null, {
							path: "/bps/",
							expires: -1
						});
						base.addCookie("captch_r_" + o + "_" + e.userAccount, null, {
							path: "/bps/",
							expires: -1
						});
						base.addCookie("loginUser", null, {
							path: "/",
							expires: -1
						});
						bps.popwinOpenTextForOutLine(true)
					}
				}
			} else {
				if (k.isFinished == 0) {
					n = 0
				} else {
					n = 1
				}
				if (!((f.type == 3 || f.type == 5) && g[2] == 1)) {
					base.addCookie("captch_2_" + o + "_" + e.userAccount, null, {
						path: "/bps/",
						expires: -1
					});
					base.addCookie("captch_r_" + o + "_" + e.userAccount, null, {
						path: "/bps/",
						expires: -1
					})
				}
			}
		},
		error: function(k) {
			base.addCookie("captch_2_" + o + "_" + e.userAccount, null, {
				path: "/bps/",
				expires: -1
			});
			base.addCookie("captch_r_" + o + "_" + e.userAccount, null, {
				path: "/bps/",
				expires: -1
			})
		}
	});
	return n
};
bps.getNewStudyRecord = function(d, b, h, f) {
	var g = 0;
	var e = new Date()
		.getTime();
	var c = d + ";" + b + ";" + h + ";" + f + ";" + e + ";" + bps.url.terminalCode;
	var a = bps.getSecretResult(c);
	$.ajax({
		type: "post",
		url: bps.url.courseware.getUserStudyRecord,
		data: {
			userAccount: d,
			terminalCode: bps.url.terminalCode,
			skey: a
		},
		dataType: "json",
		async: false,
		success: function(i) {
			if (i.code == 200) {
				g = i.data
			}
		}
	});
	return g
};
bps.getCourseWareDetail = function(b) {
	var a = {};
	$.ajax({
		type: "get",
		async: false,
		url: bps.url.courseware.courseWareContentUrl + "?coursewareId=" + b + "&time=" + new Date(),
		success: function(d) {
			var c = base.nrMultiLineText2Array(d);
			if (!!c) {
				a = jQuery.parseJSON(c)
			}
		}
	});
	return a
};
bps.loadCourseWareProgress = function(h) {
	var d = base.getCookie("loginUser");
	var f = base.getCookie("course");
	if (!d || d.userType != 1 || !f) {
		return
	}
	var i = $("#courseId")
		.val();
	if (f != i) {
		return
	}
	var b = d.userAccount;
	var a = base.getCookie("courseProgress");
	if (!a || !a[h]) {
		return
	}
	var e = a[h].split("_");
	if (e[2] == 1) {
		$("#buttonName" + h)
			.html("复习");
		$("#buttonName" + h)
			.attr("class", "classLogin classLogin-width yellow");
		$("#studyRate" + h)
			.text("100%");
		$("#studyRate" + h)
			.parent()
			.css({
				width: "100%",
				"text-align": "center"
			});
		$("#studyRateB" + h)
			.css({
				width: "100%"
			});
		$("#load" + h)
			.attr("class", "assure assureposition");
		$("#load" + h)
			.html('<img src="/baseui/images/success.png">')
	} else {
		var c = bps.getNewStudyRecord(b, d.sid, f, h);
		if (c > e[0]) {
			var j = bps.getCourseWareDetail(h)
				.courseDuration;
			if (!j) {
				return
			}
			var g = Math.floor(c * 100 / j);
			e[1] = (isNaN(g) ? 0 : g)
		} else {
			if (e[1] > 100) {
				e[1] = 100
			}
		}
		e[1] += "%";
		$("#studyRate" + h)
			.parent()
			.css({
				width: (e[1] == "0%" ? "inherit" : e[1]),
				"text-align": "center"
			});
		$("#studyRate" + h)
			.text(e[1]);
		$("#studyRateB" + h)
			.css({
				width: e[1]
			});
		if (e[1] != "0%" && !$("#buttonName" + h)
			.hasClass("green")) {
			$("#buttonName" + h)
				.html("继续学习");
			$("#buttonName" + h)
				.attr("class", "classLogin classLogin-width green")
		}
		if (c >= e[0]) {
			return
		}
		bps.saveUserVideoViewingRecord(h)
	}
};