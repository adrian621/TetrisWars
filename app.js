var express = require('express');
var app = express();
var server = require('http').Server(app);
var bodyParser = require('body-parser');
var lobby_server = require('./public/script/lobbyServer');
var io = require('socket.io')(server, {});

/* nytt */
/*
var routes = require('./routes/index');
var hbs = require('express-handlebars');
app.engine('hbs', hbs({extname: 'hbs', defaultLayout: 'layout', layoutsDir: __dirname + '/views/'}));
app.set('view engine', 'hbs');
app.use('/', routes);
*/ 
/*nytt*/


app.use(express.static('public'));

app.get('/', function(req, res){
	res.sendFile(__dirname + '/public/webpages/index.html');
});


app.get('*', function(req, res){
	//var splittedList = split(req.params[0], '/');
	var file = req.params[0];
	//var file = splittedList[splittedList.length-1];
	res.sendFile(__dirname + '/public/webpages/' + file);		
});

//app.use('/', express.static(__dirname + '/public'));


server.listen(process.env.PORT || 2000);
console.log('Server is running.');

io.sockets.on('connection', function(socket){	
	socket.on('lobby', function(data){
		lobby_server.lobbyFunctions(socket, data, io);
	});
	
	socket.on('game', function(data){
		lobby_server.gameFunctions(io, data, socket);
	});
});
