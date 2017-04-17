var express = require('express');
var router = express.Router();
var shortid = require('shortid');

var Authfunc = require('../models/auth');
var lobby_server = require('../public/script/lobbyServer');


router.get('/lobby', Authfunc.ensureauth ,function(req, res){
  var lobbyInfo = lobby_server.getLobbyList2();
  res.render('lobby', {lobbyNames: lobbyInfo.name, lobbyIds: lobbyInfo.ids, lobbyUsers: lobbyInfo.users, lobbyMaxUsers: lobbyInfo.maxUsers, lobbyPassword: lobbyInfo.passwords, lobbyActives: lobbyInfo.actives});
});

router.get('/createLobby', Authfunc.ensureauth ,function(req, res){
  res.render('createLobby');
});

router.get('/howToPlay', function(req, res){
  res.render('howToPlay');
});

router.get('/game', Authfunc.ensureauth, function(req, res){
  if(req.session.canJoin){
    req.session.canJoin = false;
    res.render('game', {lobbyId: (req.flash('lobbyId'))});
  }
  else res.redirect('/lobby');
});

router.post('/createLobby', Authfunc.ensureauth, function(req, res){
  if(lobby_server.ensureUserNotInLobby(req.user)){
    //validate req.body.maxusers, req.body.lobbyname, req.user.pa
    var lobbyname = req.body.lobbyname;
    var maxusers = req.body.maxusers;
    req.checkBody('maxusers', 'Maxplayers is invalid').notEmpty().isInt();
    req.checkBody('lobbyname', 'Lobbyname must be between 2 and 30 characters').len(2, 30);

    var errors = req.validationErrors();
    if(errors){
      res.render('createLobby', {errors:errors});
    }
    else{
      var lobbyId = shortid.generate();
      lobby_server.createLobby(lobbyId, req.user, req.body.maxusers, req.body.lobbyname, req.body.password);
      req.flash('lobbyId', lobbyId);
      req.session.canJoin = true;
      res.redirect('game');
    }
  }
  else{
    res.render('index', {error_msg: 'Unable to create lobby, User already in lobby'});
  }
});

router.post('/joinLobby', Authfunc.ensureauth, function(req, res){
  if(lobby_server.ensureUserNotInLobby(req.user)){
    var lobbyId = req.body.lobbyId;
    var pswInput = req.body.writePsw;
    var lobby = lobby_server.getLobbyFromLobbyID(lobbyId);

    if(lobby.maxUsers == lobby.lobbyUsers.length+lobby.waitingLine.length){
      var lobbyInfo = lobby_server.getLobbyList2();
      res.render('lobby', {error_msg: 'Lobby is full', lobbyNames: lobbyInfo.name, lobbyIds: lobbyInfo.ids, lobbyUsers: lobbyInfo.users, lobbyMaxUsers: lobbyInfo.maxUsers, lobbyPassword: lobbyInfo.passwords});
    }
    else if(lobby_server.validateId(lobbyId) & lobby.psw === pswInput){
      lobby_server.addUserToLobby_new_export(req.user, lobbyId);
      req.flash('lobbyId', lobbyId);
      req.session.canJoin = true;
      res.redirect('/game');
    }
    else{
      var lobbyInfo = lobby_server.getLobbyList2();
      res.render('lobby', {error_msg: 'Incorrect Password', lobbyNames: lobbyInfo.name, lobbyIds: lobbyInfo.ids, lobbyUsers: lobbyInfo.users, lobbyMaxUsers: lobbyInfo.maxUsers, lobbyPassword: lobbyInfo.passwords});
    }
  }
  else{
    res.render('index', {error_msg: 'You are already in a game'})
  }
});


module.exports = router;
