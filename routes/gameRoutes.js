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
  var lobbyId = shortid.generate();
  console.log(req.user);
  lobby_server.createLobby(lobbyId, req.user, 5);
  req.flash('lobbyId', lobbyId);
  res.redirect('game');
});

module.exports = router;
