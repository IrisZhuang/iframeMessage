# 基于postMessage 的跨域通信封装
兼容ie6/7/8/9 的iframe通行

```javascript
	//parent.html
	let connect = window.createConnect('parent','_fff_',['http://www.google.com'])
		.register('iframe',document.getElementById('iframe'));
	
	connect.send('iframe',{
		id:'alert',
		message:'112313123'
	});

	connect.on('hhh',(msg)=>{
		alert('hhh'+msg);
		connect.send('iframe','hhhhh');
	})
```

```javascript
	//iframe.html
	let connect = window.createConnect('iframe','_fff_',['http://www.google.com'])
		.register('parent',window.parent);

	connect.on('alert',(msg)=>{
		alert(msg);
		connect.send('parent',{
			id:'hhh',
			message:'112313123'
		});
	})
```