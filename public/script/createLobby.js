/*
var socket = io();
var lobbyNumber;
var newLobbyButton = document.getElementById("NewLobbyButton");


/*var joinLobbyButtons = document.getElementsByClassName("NewLobbyButton");

for (var i=0; i < joinLobbyButtons.length; i++) {
	photo[i].onclick = function(){
		socket.emit('lobby', {lobbyName:"username", type:"newLobby"});
	}
} */
/*
newLobbyButton.onclick = function(){
	socket.emit('lobby', {lobbyName:"username", type:"newLobby"});
}

socket.on('newLobby', function(data){
	if(data.response){
		lobbyNumber = data.lobbyNumber;
		var address = ("game?" + "lobbyNumber=" + lobbyNumber);
		window.location = address;
	}
	else{
		alert("fail");
	}
});
*/
