var socket = io();
var lobbyNumber;
var newLobbyButton = document.getElementById("NewLobbyButton");

newLobbyButton.onclick = function(){	
	socket.emit('lobby', {lobbyName:"username", type:"newLobby"});	
}

socket.on('newLobby', function(data){
	if(data.response){	
		lobbyNumber = data.lobbyNumber;
		var address = ("gameMultiplayer.html?" + "lobbyNumber=" + lobbyNumber);
		window.location = address;
	}
	else{
		alert("fail");
	}	
});
