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

var RedisStore = require('connect-redis')(session);
//var redisUrl = require('redis-url');
var MongoStore = require('connect-mongo')(session);


const http = require('http');
const socketIo = require('socket.io');
const passportSocketIo = require('passport.socketio');

var app = express();
var server = http.Server(app);
var io = socketIo(server);
//var sessionStore = new RedisStore({client: redisUrl.connect(process.env.REDIS_URL)});
//var sessionStore = new RedisStore({ client: redisUrl.connect(process.env.REDIS_URL) });
var sessionStore = new MongoStore({mongooseConnection: mongoose.connection});

//setup db
mongoose.connect('mongodb://localhost/loginapp');
var db = mongoose.connection;
db.on('error', console.log.bind(console, 'connection error'));

//local includes

var lobby_server = require('./public/script/lobbyServer');
var routes = require('./routes/index');
var users = require('./routes/users');
var gameRoutes = require('./routes/gameRoutes');
var UserModel = require('./models/user');
var socketValidation = require('./validation/socketValidation');


app.set('views', path.join(__dirname, 'views/layouts'));
app.engine('handlebars', exphbs({defaultLayout:'layout'}));
app.set('view engine', 'handlebars');


//setup body and cookie-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

//set public folder
app.use(express.static(path.join(__dirname, 'public')));

//setup express session have to be configured before passport session
app.use(session({
  store: sessionStore,
  secret: 'dippson',
  saveUninitialized: true,
  resave: true,
  //httpOnly: true, //dont let browers javascript access cookie-parser
  secure: true, //only use cookies over https
  ephemeral: true, // delete cookie when browers is closed
  cookie: {
    maxAge: 241920000
  }
}));


io.use(passportSocketIo.authorize({
  key: 'connect.sid',
  secret: 'dippson', //process.env.SECRET_KEY_BASE
  store: sessionStore,
  passport:passport,
  cookieParser: cookieParser,
  success: onAuthorizeSuccess,
  //fail: onAuthorizeFail
}));


function onAuthorizeSuccess(data, accept){
  //console.log('successful connection to socket.io');

    // The accept-callback still allows us to decide whether to
    // accept the connection or not.
    //accept(null, true);

    // OR

    // If you use socket.io@1.X the callback looks different
    accept();
  }
function onAuthorizeFail(data, message, error, accept){
  if(error)
    throw new Error(message);
  console.log('failed connection to socket.io:', message);

  // We use this callback to log all of our failed connections.
  accept(null, false);

  // OR

  // If you use socket.io@1.X the callback looks different
  // If you don't want to accept the connection
  if(error)
    accept(new Error(message));
}


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
app.use('/', gameRoutes);

app.use(express.static('public'));


server.listen(process.env.PORT || 2000);
console.log('Server is running.');



io.on('connection', function(socket){
	socket.on('lobby', function(data){
    if(socket.request.user && socket.request.user.logged_in){
      if(socketValidation.validate(data, 'lobby')){
        lobby_server.lobbyFunctions(socket, data, io);
        }
      }
	      });


    socket.on('game', function(data){
    if(socket.request.user && socket.request.user.logged_in){
      if(socketValidation.validate(data, 'game')){
		lobby_server.gameFunctions(socket, data, io);
    }
    }
	});

  /*
  socket.on('disconnect', function(){
    socket.removeAllListeners();
    io.removeAllListeners();
  });
/*

  */
});


/*
var eventSocket = io.of('/events');

eventSocket.on('connection', function(socket){
  socket.on('event1', function(){
    if(socket.request.user && socker.request.user.logged_in){
      console.log('inloggad användare skickat socket');
    }
    else{
      console.log('socket av icke inloggad användare');
    }
  });
});
*/
