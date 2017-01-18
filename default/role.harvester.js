var roleHarvester = {
  detectNextAction: function(creep, target) {
    if (creep.room.name == creep.memory.room) {
      if (creep.carry.energy > 0) {
        return 'transfer';
      } else {
        console.log(creep.memory.role, creep.name, Game.time);
        return 'move';
      }
    } else {
      if (creep.carry.energy > 0) {
        return 'move';
      } else {
        return 'harvest';
      }
    }
  },

  detectHarvestTarget: function(creep) {
    if (!creep.memory.sourceId) {
      let flag = Game.flags[creep.memory.flag];
      if (!flag.memory.sourceId) {
        let area = creep.room.lookAtArea(flag.pos.y-2, flag.pos.x-2, flag.pos.y+2, flag.pos.x+2, true);
        flag.memory.sourceId = _.find(area, (item) => { return item.type == 'source' }).source.id;
      }
      creep.memory.sourceId = flag.memory.sourceId;
    }
    return Game.getObjectById(creep.memory.sourceId);
  },

  detectTransferTarget: function(creep) {
    return creep.room.storage;
  },

  createCreep: function(spawn, flag) {
    if (spawn.room.energyAvailable < 550) {
      console.log(spawn, spawn.room.energyAvailable, 'exiting');
      return;
    }
    let body = [WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE];
    if (spawn.room.energyAvailable >= 1050) {
      body.push(WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE);
    }
    console.log('body built', body)
    if (!flag.memory.path) {
      flag.memory.path = PathFinder.search(spawn.room.storage.pos, { pos: flag.pos, range: 1 }).path;
      flag.memory.reversePath = _.clone(flag.memory.path).reverse();
    }
    let memory = { role: 'harvester', action: 'move', flag: flag.name, room: spawn.room.name };
    if (flag.memory.sourceId) {
      memory['sourceId'] = flag.memory.sourceId;
    }
    let result = spawn.createCreep(body, null, memory);
    if (_.isString(result)) {
      flag.memory.harvesters.push(result);
    } else {
      console.log('spawn failed', result)
    }
  }
};

module.exports = roleHarvester;
