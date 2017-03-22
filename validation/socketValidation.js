var exports = module.exports = {}
var intervals = [];




  exports.validate = function(data, type){
    switch(type){
    case 'lobby': /*console.log('returning true');*/ return validateLobby(data);
    case 'game': /*console.log('returning true');*/ return validateGame(data); //add validation
    default: return false;
    }
  }
  //Errors in message
  validateLobby = function(data){
    switch(data.type){
      case "gameSetup": return true;
      case "userIsReady": return true;
  		case "userIsNotReady": return true;
      case "userLeavedLobby": return true;
      /*
      case "gameOver": gameOverServer(io, message); break;
      */
      default: return false;
    }
  }

  validateGame = function(data){
    switch(data.type){
      case "move": return validateMove(data);
      default: false;
    }
  }
  validateMove = function(data){
    //console.log(data.move);
    var move = data.move;
    var validMoves = [32, 37, 38, 39, 40];
    //console.log('validateBoard: ' + validateBoard(data.boards));
    if (validMoves.indexOf(move) >= 0){
      return true;
    }
    return false;
}
  /*validateCurrentBlocks = function(){
    //list with lenght 4

    //x
    //y
    //color
    //size:
  }
  */
