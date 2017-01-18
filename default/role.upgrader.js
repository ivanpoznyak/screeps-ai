var roleUpgrader = {
  detectNextAction: function(creep) {
    if (creep.carry.energy > 0) {
      return 'upgrade';
    } else {
      return (creep.memory.useContainers ? 'withdraw' : 'harvest');
    }
  },

  detectWithdrawTarget: function(creep) {
    return Game.getObjectById(creep.memory.containerId)
  },

  detectHarvestTarget: function(creep) {
    return Game.getObjectById(creep.memory.sourceId);
  },

  createCreep: function(spawn, room, currentCount, currentLimit) {
    if (room.energyAvailable < 200) {
      return;
    }
    body = [WORK, CARRY, MOVE];
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
      while (leftOver >= 250) {
        body.push(WORK, WORK, MOVE);
        leftOver -= 250;
      }
    }
    let memory = { role: 'upgrader', action: 'idle' };
    let all = room.ext.sources.concat(room.ext.containers);
    let target = room.controller.pos.findClosestByRange(all);
    if (target && target.structureType == STRUCTURE_CONTAINER) {
      memory['useContainers'] = true;
      memory['containerId'] = target.id;
    } else {
      memory['sourceId'] = target.id;
    }
    let result = spawn.createCreep(body, null, memory);
  }
};

module.exports = roleUpgrader;
