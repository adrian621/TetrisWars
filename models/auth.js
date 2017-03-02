
module.exports = {
ensureNotauth: function(req, res, next){
  if(!req.isAuthenticated()){
    return next();
  }
  else{
    res.redirect('/');
  }
},
ensureauth: function(req, res, next){
if(req.isAuthenticated()){
  return next();
}
else{
  res.redirect('/login');
  }
}
}
