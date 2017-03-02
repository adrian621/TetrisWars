var express = require('express');
var router = express.Router();
var shortid = require('shortid');

var Authfunc = require('../models/auth');
var lobby_server = require('../public/script/lobbyServer');

router.get('/createLobby', Authfunc.ensureauth ,function(req, res){
  res.render('createLobby');
});

router.get('/game', Authfunc.ensureauth, function(req, res){
  res.render('game', {lobbyNumber: req.flash('lobbyNumber')});
  //send some info about lobby
});
router.post('/createLobby', Authfunc.ensureauth, function(req, res){
  console.log('postat createLobby');
  //lobby_server.createLobby
  var lobbyId= shortid.generate();
  console.log(lobbyId);
  req.flash('lobbyNumber', lobbyId);
  res.redirect('game');

});

module.exports = router;
