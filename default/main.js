const profiler = require('screeps-profiler');
//profiler.enable();

require('extensions');

require('ext.structure.spawn');
require('ext.structure.container');
require('ext.structure.extension');
require('ext.structure.tower');

let roomExtension = require('ext.room');
let flagExtension = require('ext.flag');

module.exports.loop = function () {
  profiler.wrap(function() {
    let removedCreeps = [];
    for(var name in Memory.creeps) {
      if(!Game.creeps[name]) {
        removedCreeps.push(name);
        delete Memory.creeps[name];
        console.log('Clearing non-existing creep memory:', name);
      }
    }

    _.forEach(Game.rooms, (room, roomName) => {
      roomExtension.initialize(room);
      if (room.controller.my) {
        room.ext.cleanMemory(removedCreeps);
        room.ext.spawnMissingCreeps();
      }
      room.ext.runCreeps();
      room.ext.runDefenses();
    });

    _.forEach(Game.flags, (flag, flagName) => {
      flagExtension.initialize(flag);
      flag.ext.cleanMemory(removedCreeps);

      flag.ext.spawnMissingCreeps();
    });
  });
  if (Game.time % 10 == 0) {
  //  console.log('Cpu used:', Game.cpu.getUsed())
  }
}
