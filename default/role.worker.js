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
        return 'transfer';
      }
      return 'idle';
    } else {
      return (creep.memory.useContainers) ? 'withdraw' : 'harvest';
    }
  },

  resetIdle: function(creep) {
    // Do nothing for now
  },

  detectTransferTarget: function(creep) {
    let target = creep.pos.findClosestByRange(creep.room.ext.energyConsumers, {
      filter: (structure) => {
        return structure.energy < structure.energyCapacity;
      }
    });

    if (!target) {
      target = _.find(creep.room.ext.towers, (tower) => {
        return tower.availableStorage() > 0;
      });
      if (!target) {
        target = creep.pos.findClosestByRange(creep.room.ext.energyStorages, {
          filter: (structure) => {
            return structure.availableStorage() > 0 && structure.id != creep.memory.containerId;
          }
        });
      }
    }
    return target;
  },

  detectWithdrawTarget: function(creep) {
    let containers = creep.room.ext.nonSourceContainers.length > 0 ? creep.room.ext.nonSourceContainers : creep.room.ext.containers;
    if (creep.room.storage) {
      containers = containers.concat([creep.room.storage]);
    }
    let target = creep.pos.findClosestByRange(containers, {
      filter: (structure) => {
        return structure.store[RESOURCE_ENERGY] > 0 && (creep.room.ext.controllerContainer == null || structure.id != creep.room.ext.controllerContainer.id);
      }
    });
    if (!target) {
      target = creep.pos.findClosestByRange(creep.room.ext.sourceContainers, (container) => {
        return container.availableStorage() < 1000;
      });
    }
    return target;
  },

  detectBuildTarget: function(creep) {
    return creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
  },

  detectRepairTarget: function(creep) {
    return creep.pos.findClosestByRange(FIND_STRUCTURES, {
      filter: (structure) => {
        let result = false;
        if (structure.structureType == STRUCTURE_WALL) {
          result = structure.hits < creep.room.ext.creepWallHealth();
        } else {
          result = (structure.hits < structure.hitsMax * creep.room.ext.creepRepairMultiplier());
        }
        return result;
      }
    });
  },

  detectHarvestTarget: function(creep) {
    return creep.pos.findClosestByRange(creep.room.ext.sources);
  },

  createCreep: function(spawn, room, currentCount, currentLimit) {
    if (room.energyAvailable < 200) {
      return
    }
    let body = [];
    let leftOver = room.energyAvailable;
    if (room.energyCapacityAvailable >= 650) {
      if (room.energyAvailable < 650) {
        return;
      }
      body.push(CARRY, CARRY, MOVE);
      leftOver -= 150;
    } else {
      body.push(CARRY, MOVE, WORK);
      leftOver -= 200;
    }
    while (leftOver >= 250) {
      body.push(WORK, WORK, MOVE);
      leftOver -= 250;
    }
    let memory = { role: 'worker', action: 'idle' };
    if (room.ext.containers.length > 0 || room.storage != null) {
      memory['useContainers'] = true;
    }
    let result = spawn.createCreep(body, null, memory);
  }
};

module.exports = roleWorker;
