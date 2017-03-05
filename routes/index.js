var express = require('express');
var router = express.Router();
var Authfunc = require('../models/auth');

router.get('/',  Authfunc.ensureauth, function(req, res, next){
	res.render('index', {title: 'Tetris wars'});
});

module.exports = router;
