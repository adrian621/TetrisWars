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
	var activesList = lobbyActives.split(",");

	if(lobbyNamesList[0] == ""){
		return;
	}

	for(var i = 0; i < lobbyNamesList.length; i++){
		addNewLobby(lobbyNamesList[i], lobbyIdsList[i], usersList[i], maxUsersList[i], passwordList[i], activesList[i]);
	}
}

join.on('NewLobbyInfo', function(data){
	addNewLobby(data.name, data.id, data.users, data.maxusers, data.hasPassword, data.isActive);
});

join.on('UpdateLobbyInfo', function(data){
	if(data.users != 0){
	updateLobby(data.id, data.users, data.isActive);
	}
	else {
		removeLobby(data.id);
	}
});

removeLobby = function(idParam){
var tr = document.getElementById(idParam);
index = tr.rowIndex;
document.getElementById("tableId").deleteRow(index);

}

updateLobby = function(idParam, usersParam, activeParam){
	var tr = document.getElementById(idParam);
	tr.childNodes[1].innerHTML = usersParam;
	tr.childNodes[4].innerHTML = activeParam;
}

addNewLobby = function(nameParam, idParam, usersParam, maxParam, hasPasswordParam, activeParam){
	var tr = document.createElement('tr');
	var lobbyId = document.createElement('td');
	var lobbyName = document.createElement('td');
	var users = document.createElement('td');
	var maxUsers = document.createElement('td');
	var psw = document.createElement('td');
	var tdButton = document.createElement('td');
	var active = document.createElement('td');

	lobbyName.innerHTML = nameParam;
	users.innerHTML = usersParam;
	maxUsers.innerHTML = maxParam;
	psw.innerHTML = hasPasswordParam;
	active.innerHTML = activeParam;
	tr.id = idParam;

	tr.appendChild(lobbyName);
	tr.appendChild(users);
	tr.appendChild(maxUsers);
	tr.appendChild(psw);
	tr.appendChild(active);

	if (hasPasswordParam === "No") {
		var joinbutton = document.createElement('button');
		var buttonText = document.createTextNode("Join");
		joinbutton.createTextNode = "Join";
		joinbutton.setAttribute('type', 'button');
		joinbutton.appendChild(buttonText);
		tdButton.appendChild(joinbutton);

		joinbutton.onclick = (function(id) {return function() {
			var form = document.getElementById("joinFormPsw");
			form.joinPsw.value = id;
			document.forms["joinFormPsw"].submit();
		};})(idParam);

	}else{ //Has password
		var joinButtonPsw = document.createElement('button');
		var buttonTextPsw = document.createTextNode("Join");
		joinButtonPsw.createTextNode = "Join";
		joinButtonPsw.setAttribute('type', 'button');
		joinButtonPsw.appendChild(buttonTextPsw);
		joinButtonPsw.className = "joinButtonPsw";
		joinButtonPsw.id="button"+idParam;
		tdButton.appendChild(joinButtonPsw);

		joinButtonPsw.onclick = (function(id) {return function() {
			var tr = document.getElementById(id);
			var lobbyname = tr.childNodes[0].innerHTML;
			var form = document.getElementById("joinFormPsw");
			form.joinPsw.value = id;
			document.getElementById("popup").style.display = "block";
			document.getElementById("popupLabel").innerHTML = "Password for "+lobbyname;
		};})(idParam);
	}

	tr.appendChild(tdButton);
	tableBody.appendChild(tr);
}

window.onclick = function(event) {
	var close = document.getElementById("close");
	if(popup.style.display === "block"){
		if (event.target == close) {
			popup.style.display = "none";
		}
	}
}

function setValue(id){
  var form = document.getElementById("joinForm");
  form.join.value = id;
  document.forms["joinForm"].submit();
}
