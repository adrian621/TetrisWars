var socket= io();


//socket.emit('lobby', {type:"getLobbyList"});
/*
socket.on('lobbyList', function(data){
	console.log('fick lista');
	if(data.lobbyList.length != 0){
		console.log('finns en lobby');
		fillLobbyList(data.lobbyList);
	}
	else{
		console.log('no lobbys avialble');
	}
});
*/

window.onload=function(){
	newLobbyList();
}

//Detta ska ändras en del.
//Det som istället ska skickas till server Är template vaiable {{lobbyId}}

splitAll = function(){


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
		var tr = document.createElement('tr');

		//Create elements
		var lobbyId = document.createElement('td');
		var lobbyName = document.createElement('td');
		var users = document.createElement('td');
		var maxUsers = document.createElement('td');
		var psw = document.createElement('td');
		var tdButton = document.createElement('td');
		var joinbutton = document.createElement('button');
		var buttonText = document.createTextNode("Join");


		//Define the content of the elements
  	lobbyName.innerHTML = lobbyNamesList[i];
  	users.innerHTML = usersList[i];
  	maxUsers.innerHTML = maxUsersList[i];
  	psw.innerHTML = passwordList[i];
		joinbutton.createTextNode = "Join";
		joinbutton.setAttribute('type', 'button');
		joinbutton.className = "btn btn-primary";
		//var joinbutton.innerHTML = "<button type='button' class='btn btn-primary' onclick='setValue("+lobbyIdsList[i]+")'>Join</button>";
		console.log(lobbyIdsList[i]);


		//Append the children
		tr.appendChild(lobbyName);
		tr.appendChild(users);
		tr.appendChild(maxUsers);
		tr.appendChild(psw);
		joinbutton.appendChild(buttonText);
		tdButton.appendChild(joinbutton);
		tr.appendChild(tdButton);
		tableBody.appendChild(tr);
		console.log(tdButton.childNodes);


		joinbutton.onclick = (function(id) {return function() {
			console.log("id is "+id);
		  var form = document.getElementById("joinForm");
		  form.join.value = id;
		  document.forms["joinForm"].submit();
};})(lobbyIdsList[i]);
}}


function setValue(id){
	console.log("id is "+id);
  var form = document.getElementById("joinForm");
  form.join.value = id;
  document.forms["joinForm"].submit();
}


/*
fillLobbyList = function(allLobbys){
	list = document.getElementById('allLobbysList');
	for(i = 0; i < allLobbys.length; i++){
		if(allLobbys[i].maxUsers != allLobbys[i].lobbyUsers.length){
			item = document.createElement('li');
			//item.appendChild(document.createTextNode(allLobbys[i].id));

			//set href
			var a = document.createElement('a');
			a.textContent = ("Name: "+allLobbys[i].id +", Users: "+allLobbys[i].lobbyUsers.length+", Max users: "+allLobbys[i].maxUsers);
			var address = ("gameMultiplayer.html?" + "lobbyNumber=" + allLobbys[i].id);
			a.setAttribute('href', address);
			item.appendChild(a);

			list.appendChild(item);
		}
	}
}
*/
