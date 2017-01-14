var roleWorker = {
  detectNextAction: function(creep) {
    if (creep.carry.energy > 0) {
      let target = this.detectRepairTarget(creep);
      if (target) {
        return 'repair';
      }
      target = this.detectBuildTarget(creep);
      if (target) {
        return 'build';
      }
      if (creep.memory.idleFor > 12) {
        creep.memory.wallHealth += 1000;
        return 'transfer';
      }
      return 'idle';
    } else {
      return (creep.memory.useContainers) ? 'withdraw' : 'harvest';
    }
  },

  resetIdle: function(creep) {
    creep.memory.repairMultiplier = this.defaultRepairMultiplier();
  },

  detectTransferTarget: function(creep) {
    let target = creep.pos.findClosestByPath(creep.room.ext.energyConsumers, {
      filter: (structure) => {
        return structure.energy < structure.energyCapacity;
      }
    });
    if (!target) {
      target = creep.pos.findClosestByPath(creep.room.ext.energyStorages, {
        filter: (structure) => {
          return structure.availableStorage() > 0 && structure.id != creep.memory.containerId;
        }
      });
    }
    return target;
  },

  detectWithdrawTarget: function(creep) {
    let target = creep.pos.findClosestByPath(creep.room.ext.containers, {
      filter: (structure) => {
        return structure.store[RESOURCE_ENERGY] > 0
      }
    });
    return target;
  },

  detectBuildTarget: function(creep) {
    return creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
  },

  detectRepairTarget: function(creep) {
    return creep.pos.findClosestByPath(FIND_STRUCTURES, {
      filter: (structure) => {
        let result = false;
        if (structure.structureType == STRUCTURE_WALL) {
          if (!creep.memory.wallHealth) {
            creep.memory.wallHealth = 10000;
          }
          result = structure.hits < creep.memory.wallHealth;
        } else {
          result = (structure.hits < structure.hitsMax * creep.memory.repairMultiplier);
        }
        return result;
      }
    });
  },

  detectHarvestTarget: function(creep) {
    return creep.pos.findClosestByPath(creep.room.sources);
  },

  defaultRepairMultiplier: function() {
    return 0.5;
  },

  createCreep: function(spawn, room, currentCount, currentLimit) {
    if (room.energyAvailable < 200) {
      return
    }
    let body = [];
    let leftOver = room.energyAvailable;
    if (room.energyCapacityAvailable >= 400) {
      if (room.energyAvailable < 400) {
        return;
      }
      body.push(CARRY, CARRY, MOVE);
      leftOver -= 150;
    } else {
      body.push(CARRY, MOVE);
      leftOver -= 100;
    }
    while (leftOver >= 250) {
      body.push(WORK);
      leftOver -= 100;
      if (leftOver >= 150) {
        body.push(WORK, MOVE);
        leftOver -= 150;
      }
    }
    let memory = { role: 'worker', action: 'idle', repairMultiplier: this.defaultRepairMultiplier(), wallHealth: 10000};
    if (room.ext.containers.length > 0 || room.storage != null) {
      memory['useContainers'] = true;
    }
    let result = spawn.createCreep(body, null, memory);
  }
};

module.exports = roleWorker;
