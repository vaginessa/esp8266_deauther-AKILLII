var table = document.getElementsByTagName('table')[0];
var scanBtn = getE("startScan");
var scanTime = getE("scanTime");
var clientsFound = getE("clientsFound");
var scanStatus = getE("clientScanStatus");
var clientNames = getE('clientNames');
var nameListTable = getE('nameList');
var res;

function compare(a, b) {
  if (a.p > b.p) return -1;
  if (a.p < b.p) return 1;
  return 0;
}

function toggleBtn(onoff) {
  if (onoff) {
    scanStatus.style.visibility = 'visible';
  } else {
    scanStatus.style.visibility = 'hidden';
  }
}

function getResults() {
  getResponse("ClientScanResults.json", function(responseText) {
	try{
		res = JSON.parse(responseText);
	}catch(e){
		showMessage("出错：请清空客户端列表。");
		return;
	}
    
    res.clients = res.clients.sort(compare);

    clientsFound.innerHTML = res.clients.length;

    var tr = '';
    if (res.clients.length > 0) tr += '<tr><th>数据包</th><th>名称</th><th>MAC</th><th>AP</th><th>选择</th></tr>';
	
    for (var i = 0; i < res.clients.length; i++) {

      if (res.clients[i].s == 1) tr += '<tr class="selected">';
      else tr += '<tr>';
      tr += '<td>' + res.clients[i].p + '</td>';
      if(res.clients[i].l >= 0) tr += '<td>' + escapeHTML(res.clients[i].n) + ' <a onclick="editNameList(' + res.clients[i].l + ')"></a></td>';
	  else tr += '<td><a onclick="setName(' + res.clients[i].i + ')">设置</a></td>';
      if(res.clients[i].v.length > 1) tr += '<td>' + res.clients[i].v + res.clients[i].m.substring(8, 20) + '</td>';
	  else tr += '<td>' + res.clients[i].m + '</td>';
      tr += '<td>' + escapeHTML(res.clients[i].a) + '</td>';

      if (res.clients[i].s == 1) tr += '<td><button class="marginNull select" onclick="select(' + res.clients[i].i + ')">取消选择</button></td>';
      else tr += '<td><button class="marginNull select" onclick="select(' + res.clients[i].i + ')">选择</button></td>';

      tr += '</tr>';
    }
    table.innerHTML = tr;
	
	clientNames.innerHTML = res.nameList.length + "/50";

    var tr = '<tr><th>MAC</th><th>名称</th><th>删除</th><th>添加</th></tr>';

    for (var i = 0; i < res.nameList.length; i++) {

      tr += '<tr>';
      tr += '<td>' + res.nameList[i].m + '</td>';
      tr += '<td>' + escapeHTML(res.nameList[i].n) + ' <a onclick="editNameList(' + i + ')">编辑</a></td>';
      tr += '<td><button class="marginNull button-warn" onclick="deleteName(' + i + ')">删</button></td>';
	  tr += '<td><button class="marginNull button-primary" onclick="add(' + i + ')">添加</button></td>';
      tr += '</tr>';
    }

    nameListTable.innerHTML = tr;
	
  }, function() {
	  showMessage("请重新连接并刷新");
  }, 6000);

}

function scan() {
	toggleBtn(true);
	getResponse("ClientScan.json?time=" + scanTime.value, function(responseText) {
    if(responseText == "true") {
		setTimeout(function() {
			toggleBtn(true);
			getResults();
		}, scanTime.value * 1000);
	}
	else showMessage("ClientScan.json响应错误");
	});
}

function select(num) {
  getResponse("clientSelect.json?num=" + num, function(responseText) {
    if (responseText == "true") getResults();
    else showMessage("clientSelect.json响应错误");
  });
}

function clearNameList() {
  getResponse("clearNameList.json", function(responseText) {
    if (responseText == "true") getResults();
    else showMessage("clearNameList.json响应错误");
  });
}

function addClient(){
	getResponse("addClient.json?mac="+cMac.value+"&name="+cName.value, function(responseText) {
		if (responseText == "true") getResults();
		else showMessage("addClient.json响应错误");
	});
}

function setName(id) {
  var newName = prompt("Name for " + res.clients[id].m);

  if (newName != null) {
    getResponse("setName.json?id=" + id + "&name=" + newName, function(responseText) {
      if(responseText == "true") getResults();
      else showMessage("editNameList.json响应错误");
    });
  }
}

function editNameList(id) {
  var newName = prompt("Name for " + res.nameList[id].m);
  
  if (newName != null) {
    getResponse("editNameList.json?id=" + id + "&name=" + newName, function(responseText) {
      if(responseText == "true") getResults();
      else showMessage("editNameList.json响应错误");
    });
  }
}

function deleteName(id) {
  getResponse("deleteName.json?num=" + id, function(responseText) {
    if (responseText == "true") getResults();
    else showMessage("deleteName.json响应错误");
  });
}

function add(id){
  getResponse("addClientFromList.json?num=" + id, function(responseText) {
    if (responseText == "true") getResults();
    else showMessage("addClientFromList.json响应错误");
  });
}

getResponse("ClientScanTime.json", function(responseText) {
  scanTime.value = responseText;
});

getResults();
toggleBtn(false);