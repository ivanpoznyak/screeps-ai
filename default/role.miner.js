var roleMiner = {
  detectNextAction: function(creep, target) {
    if (creep.carry.energy > 0) {
      return 'transfer';
    } else {
      return 'harvest';
    }
  },

  detectHarvestTarget: function(creep) {
    return Game.getObjectById(creep.memory.sourceId)
  },

  detectTransferTarget: function(creep) {
    if (creep.memory.containerId) {
      return Game.getObjectById(creep.memory.containerId);
    }
    return creep.pos.findClosestByRange(creep.room.ext.energyConsumers, {
      filter: (structure) => {
        return structure.energy < structure.energyCapacity;
      }
    });
  },

  createCreep: function(spawn, room, currentCount, currentLimit) {
    if (room.energyAvailable < 200) {
      return;
    }
    let body = [WORK, CARRY, MOVE];
    if (room.energyCapacityAvailable >= 650) {
      if (room.energyAvailable >= 650) {
        body = [WORK, WORK, WORK, WORK, WORK, MOVE, CARRY, CARRY];
      } else {
        if (currentCount > 0) {
          return;
        }
      }
    } else {
      let leftOver = room.energyAvailable - 200;
      while (leftOver >= 100) {
        body.push(WORK);
        leftOver -= 100;
      }
    }
    let memory = { role: 'miner', action: 'idle' };
    let source = _.find(room.ext.sources, (source) => {
      return !room.memory.miners[source.id];
    });
    if (source) {
      memory['sourceId'] = source.id;
      memory['containerId'] = room.memory.sourceContainers[source.id];

      let result = spawn.createCreep(body, null, memory);
      if (_.isString(result)) {
        room.memory.miners[source.id] = result;
      }
    }
  }
};

module.exports = roleMiner;
