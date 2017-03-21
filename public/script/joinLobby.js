var join = io('/join');

window.onload=function(){
	newLobbyList();
}

newLobbyList = function(){
	var tableBody= document.getElementById('tableBody');
	var lobbyNamesList = lobbyNames.split(",");
	var lobbyIdsList = lobbyIds.split(",");
	var maxUsersList = lobbyMaxUsers.split(",");
	var passwordList = lobbyPassword.split(",");
	var usersList = lobbyUsers.split(",");

	if(lobbyNamesList[0] == ""){
		return;
	}

	for(var i = 0; i < lobbyNamesList.length; i++){
		addNewLobby(lobbyNamesList[i], lobbyIdsList[i], usersList[i], maxUsersList[i], passwordList[i]);
	}
}

join.on('NewLobbyInfo', function(data){
	console.log('the id is sss: ' + data.id);
	addNewLobby(data.name, data.id, data.users, data.maxusers, data.hasPassword);
});

join.on('UpdateLobbyInfo', function(data){
	if(data.users != 0){
	updateLobby(data.id, data.users);
	}
	else {
		removeLobby(data.id);
	}
});

removeLobby = function(idParam){
//console.log('id to remove is: ' + idParam);
var tr = document.getElementById(idParam);
index = tr.rowIndex;
//console.log(index);
document.getElementById("tableId").deleteRow(index);

}

updateLobby = function(idParam, usersParam){
 //console.log('Id to update is: ' + idParam);
	var tr = document.getElementById(idParam);
	tr.childNodes[1].innerHTML = usersParam;
	//console.log('satte users från: ' + tr.childNodes[1] + 'till' + usersParam);
}

addNewLobby = function(nameParam, idParam, usersParam, maxParam, hasPasswordParam){

	var tr = document.createElement('tr');

	var lobbyId = document.createElement('td');
	var lobbyName = document.createElement('td');
	var users = document.createElement('td');
	var maxUsers = document.createElement('td');
	var psw = document.createElement('td');
	var tdButton = document.createElement('td');
	var joinbutton = document.createElement('button');
	var buttonText = document.createTextNode("Join");

	lobbyName.innerHTML = nameParam;
	users.innerHTML = usersParam;
	maxUsers.innerHTML = maxParam;
	psw.innerHTML = hasPasswordParam;
	joinbutton.createTextNode = "Join";
	joinbutton.setAttribute('type', 'button');
	joinbutton.className = "btn btn-primary";
	tr.id = idParam;

	tr.appendChild(lobbyName);
	tr.appendChild(users);
	tr.appendChild(maxUsers);
	tr.appendChild(psw);
	joinbutton.appendChild(buttonText);
	tdButton.appendChild(joinbutton);
	tr.appendChild(tdButton);
	tableBody.appendChild(tr);

	joinbutton.onclick = (function(id) {return function() {
		var form = document.getElementById("joinForm");
		form.join.value = id;
		document.forms["joinForm"].submit();
};})(idParam);

}
function setValue(id){
	console.log("id is "+id);
  var form = document.getElementById("joinForm");
  form.join.value = id;
  document.forms["joinForm"].submit();
}
