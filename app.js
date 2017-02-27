const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongo = require('mongodb');
const mongoose = require('mongoose');

var app = express();
//setup for socket.io
var server = require('http').Server(app);
var io = require('socket.io')(server, {});

//setup db
mongoose.connect('mongodb://localhost/loginapp');
var db = mongoose.connection;

//local includes

var lobby_server = require('./public/script/lobbyServer');
var routes = require('./routes/index');
var users = require('./routes/users');


app.set('views', path.join(__dirname, 'views/layouts'));
app.engine('handlebars', exphbs({defaultLayout:'layout'}));
app.set('view engine', 'handlebars');


//setup body and cookie-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

//set public folder
app.use(express.static(path.join(__dirname, 'public')));

//setup express session
app.use(session({
  secret: 'dippson',
  saveUninitialized: true,
  resave: true
}));

//init passport
app.use(passport.initialize());
app.use(passport.session());


//setup expressValidator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

//connect-flash middleware
app.use(flash());
//setup flash
app.use(function(req, res, next){
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

app.use('/', routes);
app.use('/', users);

app.use(express.static('public'));


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
