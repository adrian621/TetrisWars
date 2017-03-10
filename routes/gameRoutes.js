var express = require('express');
var router = express.Router();
var shortid = require('shortid');

var Authfunc = require('../models/auth');
var lobby_server = require('../public/script/lobbyServer');

router.get('/createLobby', Authfunc.ensureauth ,function(req, res){
  res.render('createLobby');
});

router.get('/game', Authfunc.ensureauth, function(req, res){
  res.render('game', {lobbyId: (req.flash('lobbyId'))});
  //send some info about lobby
});
router.post('/createLobby', Authfunc.ensureauth, function(req, res){

  var lobbyId = '1';//shortid.generate();
  lobby_server.createLobby(lobbyId, req.user, 5);
  req.flash('lobbyId', lobbyId);
  res.redirect('game');
});

router.post('/joinLobby', Authfunc.ensureauth, function(req, res){
  var lobbyId = req.body.lobbyId;
  if(!lobby_server.validateId(lobbyId)){
    res.render('index', {error_msg: 'Unable to join lobby'});
  }
  else{
  console.log('User join lobby with id fff: ' + req.body.lobbyId);
  lobby_server.addUserToLobby_new_export(req.user, lobbyId);
  req.flash('lobbyId', lobbyId);
  res.redirect('game');
  }
});


module.exports = router;
