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
newLobbyList = function(){

	var tableBody= document.getElementById('tableBody');
	console.log(lobbyNames);
	/*
	for(var i = 0; i < lobbyNames.length i++){
		var tr = document.createElement('tr');

		//Create elements
		var lobbyName = document.createElement('td');
		var users = document.createElement('td');
		var maxUsers = document.createElement('td');
		var psw = document.createElement('td');
		var tdButton = document.createElement('td');
		var button = document.createElement('button');
		var buttonText = document.createTextNode("Join");


		//Define the content of the elements
  	lobbyName.innerHTML = lobbyInfo.[0][i];
  	users.innerHTML = lobbyInfo.[1][i];
  	maxUsers.innerHTML = lobbyInfo.[2][i];
  	psw.innerHTML = "no";
		button.createTextNode = "Join";
		button.setAttribute('type', 'button');
		button.className = "btn btn-primary";
		button.onclick = setValue(lobbyInfo.[4][i]);

		//Append the children
		tr.appendChild(lobbyName);
		tr.appendChild(users);
		tr.appendChild(maxUsers);
		tr.appendChild(psw);
		button.appendChild(buttonText);
		tdButton.appendChild(button);
		tr.appendChild(tdButton);
		tableBody.appendChild(tr);
	}
	*/
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
