var socket= io();

socket.emit('lobby', {type:"getLobbyList"});
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



