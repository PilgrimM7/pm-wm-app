var util = {
	options: {
		ACTIVE_COLOR: "#007aff",
		NORMAL_COLOR: "#000",
		subpages: ["views/tab-webview-subpage-chat.html", "views/tab-webview-subpage-contact.html"]
	},
	/**
	 *  简单封装了绘制原生view控件的方法
	 *  绘制内容支持font（文本，字体图标）,图片img , 矩形区域rect
	 */
	drawNative: function(id, styles, tags) {
		var view = new plus.nativeObj.View(id, styles, tags);
		return view;
	},
	/**
	 * 初始化首个tab窗口 和 创建子webview窗口 
	 */
	initSubpage: function(aniShow) {
		var subpage_style = {
				top: 0,
				bottom: 51
			},
			subpages = util.options.subpages,
			self = plus.webview.currentWebview(),
			temp = {};
			
		//兼容安卓上添加titleNView 和 设置沉浸式模式会遮盖子webview内容
		if(mui.os.android) {
			if(plus.navigator.isImmersedStatusbar()) {
				subpage_style.top += plus.navigator.getStatusbarHeight();
			}
			subpage_style.top += 48;
			
		}

		// 初始化第一个tab项为首次显示
		temp[self.id] = "true";
		mui.extend(aniShow, temp);
		// 初始化绘制首个tab按钮
		util.toggleNview(0);

		for(var i = 0, len = subpages.length; i < len; i++) {

			if(!plus.webview.getWebviewById(subpages[i])) {
				var sub = plus.webview.create(subpages[i], subpages[i], subpage_style);
				//初始化隐藏
				sub.hide();
				// append到当前父webview
				self.append(sub);
			}
		}
	},
	/**	
	 * 点击切换tab窗口 
	 */
	changeSubpage: function(targetPage, activePage, aniShow) {
		//若为iOS平台或非首次显示，则直接显示
		if(mui.os.ios || aniShow[targetPage]) {
			plus.webview.show(targetPage);
		} else {
			//否则，使用fade-in动画，且保存变量
			var temp = {};
			temp[targetPage] = "true";
			mui.extend(aniShow, temp);
			plus.webview.show(targetPage, "fade-in", 300);
		}
		//隐藏当前 除了第一个父窗口
		if(activePage !== plus.webview.getLaunchWebview()) {
			plus.webview.hide(activePage);
		}
	},
	/**
	 * 点击重绘底部tab （view控件）
	 */
	toggleNview: function(currIndex) {
		currIndex = currIndex * 2;
		// 重绘当前tag 包括icon和text，所以执行两个重绘操作
		util.updateSubNView(currIndex, util.options.ACTIVE_COLOR);
		util.updateSubNView(currIndex + 1, util.options.ACTIVE_COLOR);
		// 重绘兄弟tag 反之排除当前点击的icon和text
		for(var i = 0; i < 8; i++) {
			if(i !== currIndex && i !== currIndex + 1) {
				util.updateSubNView(i, util.options.NORMAL_COLOR);
			}
		}
	},
	/*
	 * 改变颜色
	 */
	changeColor: function(obj, color) {
		obj.color = color;
		return obj;
	},
	/*
	 * 利用 plus.nativeObj.View 提供的 drawText 方法更新 view 控件
	 */
	updateSubNView: function(currIndex, color) {
		var self = plus.webview.currentWebview(),
			nviewEvent = plus.nativeObj.View.getViewById("tabBar"), // 获取nview控件对象
			nviewObj = self.getStyle().subNViews[0], // 获取nview对象的属性
			currTag = nviewObj.tags[currIndex]; // 获取当前需重绘的tag

		nviewEvent.drawText(currTag.text, currTag.position, util.changeColor(currTag.textStyles, color), currTag.id);
	}
};

mui.plusReady(function() {
	var self = plus.webview.currentWebview(),
		leftPos = Math.ceil((window.innerWidth - 60) / 2); // 设置凸起大图标为水平居中

	/**	
	 * drawNativeIcon 绘制带边框的半圆，
	 * 实现原理：
	 *   id为bg的tag 创建带边框的圆
	 *   id为bg2的tag 创建白色矩形遮住圆下半部分，只显示凸起带边框部分
	 * 	 id为iconBg的红色背景图
	 *   id为icon的字体图标
	 *   注意创建先后顺序，创建越晚的层级越高
	 */
	var drawNativeIcon = util.drawNative('icon', {
		bottom: '5px',
		left: leftPos + 'px',
		width: '60px',
		height: '60px'
	}, [{
		tag: 'rect',
		id: 'bg',
		position: {
			top: '1px',
			left: '0px',
			width: '100%',
			height: '100%'
		},
		rectStyles: {
			color: '#fff',
			radius: '50%',
			borderColor: '#ccc',
			borderWidth: '1px'
		}
	}, {
		tag: 'rect',
		id: 'bg2',
		position: {
			bottom: '-0.5px',
			left: '0px',
			width: '100%',
			height: '45px'
		},
		rectStyles: {
			color: '#fff'
		}
	}, {
		tag: 'rect',
		id: 'iconBg',
		position: {
			top: '5px',
			left: '5px',
			width: '50px',
			height: '50px'
		},
		rectStyles: {
			color: '#d74b28',
			radius: '50%'
		}
	}, {
		tag: 'font',
		id: 'icon',
		text: '\ue600', //此为字体图标Unicode码'\e600'转换为'\ue600'
		position: {
			top: '0px',
			left: '5px',
			width: '50px',
			height: '100%'
		},
		textStyles: {
			fontSrc: '_www/fonts/iconfont.ttf',
			align: 'center',
			color: '#fff',
			size: '30px'
		}
	}]);
	// append 到父webview中
	self.append(drawNativeIcon);
	
	//自定义监听图标点击事件
	var active_color = '#fff';
	drawNativeIcon.addEventListener('click', function(e) {
		mui.alert('你点击了图标，你在此可以打开摄像头或者新窗口等自定义点击事件。', '悬浮球点击事件');
		// 重绘字体颜色
		if(active_color == '#fff') {
			drawNativeIcon.drawText('\ue600', {}, {
				fontSrc: '_www/fonts/iconfont.ttf',
				align: 'center',
				color: '#000',
				size: '30px'
			}, 'icon');
			active_color = '#000';
		} else {
			drawNativeIcon.drawText('\ue600', {}, {
				fontSrc: '_www/fonts/iconfont.ttf',
				align: 'center',
				color: '#fff',
				size: '30px'
			}, 'icon');
			active_color = '#fff';
		}

	});
	// 中间凸起图标绘制及监听点击完毕
	
	// 创建子webview窗口 并初始化
	var aniShow = {};
	util.initSubpage(aniShow);
	
	var nview = plus.nativeObj.View.getViewById('tabBar'),
		activePage = plus.webview.currentWebview(),
		targetPage,
		subpages = util.options.subpages,
		pageW = window.innerWidth,
		currIndex = 0;
	
		
	/**
	 * 根据判断view控件点击位置判断切换的tab
	 */
	nview.addEventListener('click', function(e) {
		var clientX = e.clientX;
		if(clientX > 0 && clientX <= parseInt(pageW * 0.25)) {
			currIndex = 0;
		} else if(clientX > parseInt(pageW * 0.25) && clientX <= parseInt(pageW * 0.45)) {
			currIndex = 1;
		} else if(clientX > parseInt(pageW * 0.45) && clientX <= parseInt(pageW * 0.8)) {
			currIndex = 2;
		} else {
			currIndex = 3;
		}
		
		// 匹配对应tab窗口	
		if(currIndex > 0) {
			targetPage = plus.webview.getWebviewById(subpages[currIndex - 1]);
		} else {
			targetPage = plus.webview.currentWebview();
		}

		if(targetPage == activePage) {
			return;
		}

		if(currIndex !== 3) { 
			//底部选项卡切换
			util.toggleNview(currIndex);
			// 子页面切换
			util.changeSubpage(targetPage, activePage, aniShow);
			//更新当前活跃的页面
			activePage = targetPage;
			// 轮播图原生控件显示控制
			if (currIndex == 0) {
				slider.show();
				document.querySelector("h1.mui-title").innerHTML = '首页';
			} else if (currIndex == 1){
				slider.hide();
				document.querySelector("h1.mui-title").innerHTML = '消息';
			} else if (currIndex == 2){
				slider.hide();
				document.querySelector("h1.mui-title").innerHTML = '通讯录';
			}
		} else {
			//第四个tab 打开新窗口
			plus.webview.open('views/new-webview.html', 'new', {}, 'slide-in-right', 200);
		}
	});
});