window.onload = function(){
  newTopList();
}

newTopList = function(){
	var tableBody2 = document.getElementById('tableBody2');
	var usernames = userNames.split(",");
	var score = scorE.split(",");


	//var usernames = ["tjo", "hoo", "dippe"];
  //var score = [6, 2, 5];

	for(var i = 0; i < usernames.length; i++){
		addNewTopUser(i+1, usernames[i], score[i]);
    console.log('newUserAdded');
	}
}

addNewTopUser = function(placeParam, usernameParam, pointsParam){
	var tr = document.createElement('tr');
	var place = document.createElement('td');
	var username = document.createElement('td');
	var points = document.createElement('td');

	place.innerHTML = placeParam;
	username.innerHTML = usernameParam;
	points.innerHTML = pointsParam;

	tr.appendChild(place);
	tr.appendChild(username);
	tr.appendChild(points);
	tableBody2.appendChild(tr);
}
