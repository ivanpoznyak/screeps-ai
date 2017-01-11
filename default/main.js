var roles = {
    'miner': require('role.miner'),
    'upgrader': require('role.upgrader'),
    'worker': require('role.worker')
};

var roomLimits = require('room.limits');

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
    let sources = room.find(FIND_SOURCES);
    _.forEach(sources, function(source) {
      _forEach(removedCreeps, function(creepName) {
        if (source.memory.miner == creepName) {
          source.memory.miner = null;
        }
      });
    });

    let creeps = room.find(FIND_MY_CREEPS);
    let currentCounts = {};
    for (let i=0; i<creeps.length; i++) {
      let creepRole = creeps[i].memory.role;
      currentCounts[creepRole] = currentCounts[creepRole] == null ? 1 : currentCounts[creepRole] + 1;
    }
    if (Game.ticks % 25 == 0) {
      console.log(JSON.stringify(currentCounts));
    }
    let configuredLimits = roomLimits.calculate(room);
    _.forEach(configuredLimits, function(limit, roleName) {
      let currentCount = currentCounts[roleName] || 0;
      if (currentCount < limit) {
        let spawns = room.find(FIND_STRUCTURES, {
          filter: (structure) => {
            return structure.structureType == STRUCTURE_SPAWN && !structure.spawning;
          }
        });
        if (spawns.length > 0) {
          roles[creep.memory.role].createCreep(spawns[0], room);
        }
      }
    });

    for (let i=0; i<creeps.length; i++) {
      let creep = creeps[i];
      roles[creep.memory.role].run(creep);
    }
  });
}
