var roleWorker = {
  run: function(creep) {
    if (!creep.memory.action) {
      creep.memory.action = 'move';
    }
    this[creep.memory.action].call(this, creep);
  },

  move: function(creep) {
    var target, range, nextAction;
    if (creep.carry.energy > 0) {
      range = 3;
      nextAction = 'build';
      target = this.detectBuildTarget(creep);
      if (!target) {
        target = this.detectRepairTarget(creep);
        nextAction = 'repair';
        if (!target) {
          return;
        }
      }
    } else {
      range = 1;
      if (creep.memory.useContainers) {
        target = this.detectWithdrawTarget(creep);
        nextAction = 'withdraw';
      } else {
        target = this.detectHarvestTarget(creep);
        nextAction = 'harvest';
      }
    }
    if (creep.pos.inRangeTo(target, range)) {
      creep.memory.action = nextAction;
      this[nextAction].call(this, creep, target);
    } else {
      creep.moveTo(target);
    }
  },

  build: function(creep, target) {
    target = target || this.detectBuildTarget(creep);
    creep.build(target);
    if (creep.carry.energy == 0) {
      creep.memory.action = 'move';
    }
  },

  repair: function(creep, target) {
    target = target || this.detectRepairTarget(creep);
    creep.repair(target);
    if (creep.carry.energy == 0) {
      creep.memory.action = 'move';
    }
  },

  harvest: function(creep, target) {
    target = target || this.detectHarvestTarget(creep);
    creep.harvest(target);
    if (creep.carry.energy == creep.carryCapacity) {
      creep.memory.action = 'move'
    }
  },

  detectTransferTarget: function(creep) {
    let target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
      filter: (structure) => {
        return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) && (structure.energy < structure.energyCapacity);
      }
    });
    return target;
  },

  detectWithdrawTarget: function(creep) {
    let targets = creep.room.find(FIND_STRUCTURES, {
      filter: (structure) => {
        return structure.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] > 0
      }
    })
    if (room.storage != null && room.storage.store[RESOURCE_ENERGY] > 0) {
      targets = targets + [ room.storage ];
    }
    return creep.pos.findClosestByPath(targets);
  },

  detectBuildTarget: function(creep) {
    return creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
  },

  detectRepairTarget: function(creep) {
    return creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
      filter: (structure) => {
          return (structure.hits < structure.hitsMax && structure.hits < 500);
      }
    });
  },

  detectHarvestTarget: function(creep) {
    var target;
    if (creep.memory.sourceId) {
      target = Game.getObjectById(creep.memory.sourceId)
    } else {
      let sources = creep.room.find(FIND_SOURCES);
      target = this.filterSources(creep, sources);
    }
    return target;
  },

  filterSources: function(creep, sources) {
      var sourceIndex = creep.memory.sourceIndex || 1;
      return sources[sourceIndex];
  },

  createCreep: function(spawn, room, currentCount) {
    let body = [WORK, CARRY, MOVE];
    let leftOver = room.energyAvailable - 200;
    while (leftOver > 0) {
      body = body + [WORK, CARRY, MOVE];
      leftOver -= 200;
    }
    let memory = { role: 'worker' };
    let containers = room.find(FIND_STRUCTURES, {
      filter: (structure) => {
        return structure.structureType == STRUCTURE_CONTAINER;
      }
    });
    if (containers.length > 0 || room.storage != null) {
      memory['useContainers'] = true;
    }
    let result = spawn.createCreep(body, null, memory);
  }
};

module.exports = roleWorker;
