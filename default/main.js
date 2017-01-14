require('ext.structure.spawn');
require('ext.structure.container');
require('ext.structure.extension');

let roomExtension = require('ext.room');

module.exports.loop = function () {
  let removedCreeps = [];
  for(var name in Memory.creeps) {
    if(!Game.creeps[name]) {
      removedCreeps.push(name);
      delete Memory.creeps[name];
      console.log('Clearing non-existing creep memory:', name);
    }
  }

  _.forEach(Game.rooms, function(room, roomName) {
    roomExtension.initialize(room);
    room.ext.cleanMemory(removedCreeps);
    room.ext.spawnMissingCreeps();

    room.ext.runCreeps();
  });
}
