PlayersList = new Mongo.Collection('players');

if(Meteor.isClient)
{
  Meteor.subscribe('thePlayers');

  Template.leaderboard.helpers
  (
    {
      'player': function()
      {
        //var currentUserId = Meteor.userId();

        return PlayersList.find({}, {sort: {score: -1, name: 1} });
      },
      'selectedClass': function()
      {
        var playerId = this._id;
        var selectedPlayer = Session.get('selectedPlayer');
        if(playerId==selectedPlayer)
          return "selected"
        else
          return "notSelected"
      },
      'showSelectedPlayer': function()
      {
        var selectedPlayer = Session.get('selectedPlayer');
        return PlayersList.findOne(selectedPlayer);
      }
    }
  );

  Template.leaderboard.events
  (
    {
      'click .player': function()
      {
        var playerId = this._id;
        Session.set('selectedPlayer', playerId);
      },
      'click .increment': function()
      {
        var selectedPlayer = Session.get('selectedPlayer');
        
        Meteor.call('modifyPlayerScore', selectedPlayer, 5);

        var player = PlayersList.findOne(selectedPlayer);
        var playerName = player.name;
        console.log(playerName+' successfully incremented for 5 points');
        Meteor.call('sendLogMessage',playerName+' successfully incremented for 5 points');
      },
      'click .decrement': function()
      {
        var selectedPlayer = Session.get('selectedPlayer');
                
        Meteor.call('modifyPlayerScore', selectedPlayer, -5);
        var player = PlayersList.findOne(selectedPlayer);
        var playerName = player.name;
        console.log(playerName+' successfully decremented for 5 points');
        Meteor.call('sendLogMessage', playerName+' successfully decremented for 5 points');
      },
      'click .remove':function()
      {
        var selectedPlayer = Session.get('selectedPlayer');
        Meteor.call('removePlayerData', selectedPlayer);        
        var player = PlayersList.findOne(selectedPlayer);
        var playerName = player.name;
        console.log(playerName+' successfully deleted');
        Meteor.call('sendLogMessage', playerName+' successfully deleted');
      }
    }
  );

  Template.addPlayerForm.events
  (
    {
      'submit form': function()
      {
        event.preventDefault();
        var playerNameVar = event.target.playerName.value;
        
        console.log(playerNameVar+' was successfully added');
        Meteor.call('insertPlayerData', playerNameVar);
        Meteor.call('sendLogMessage', playerNameVar+' was successfully added');        
      }
    }
  );
}

if(Meteor.isServer)
{
  console.log("hello server");
  console.log(PlayersList.find().fetch());

  Meteor.publish
  (
    'thePlayers', function()
    {
      var currentUserId = this.userId;
      return PlayersList.find({createdBy: currentUserId});
    }
  );

  Meteor.methods
  (
    {
      'sendLogMessage': function(log)
      {
        console.log(log);

      },
      'insertPlayerData': function(playerNameVar)
      {
        
        var currentUserId = Meteor.userId();
        PlayersList.insert({ 
                            name      : playerNameVar, 
                            score     : 0,
                            createdBy : currentUserId
                          });
      },
      'removePlayerData':function(selectedPlayer)
      {
        PlayersList.remove(selectedPlayer);
      },
      'modifyPlayerScore': function(selectedPlayer, value)
      {
        PlayersList.update(selectedPlayer, {$inc: {score: value}});
      }
    }
  );
}



console.log("hello both");