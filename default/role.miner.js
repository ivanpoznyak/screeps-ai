var roleMiner = {
  run: function(creep) {
    if (!creep.memory.action) {
      creep.memory.action = 'move';
    }
    this[creep.memory.action].call(this, creep);
  },

  move: function(creep) {
    var target, range, nextAction;
    if (creep.carry.energy > 0) {
      range = 1;
      target = this.detectTransferTarget(creep);
      nextAction = 'transfer';
    } else {
      range = 1;
      nextAction = 'harvest';
      target = this.detectHarvestTarget(creep);
    }
    if (creep.pos.inRangeTo(target, range)) {
      creep.memory.action = nextAction;
      this[nextAction].call(this, creep, target);
    } else {
      creep.moveTo(target);
    }
  },

  harvest: function(creep, target) {
    target = target || this.detectHarvestTarget(creep);
    creep.harvest(target);
    if (creep.carry.energy == creep.carryCapacity) {
      creep.memory.action = 'move'
    }
  },

  transfer: function(creep, target) {
    target = target || this.detectTransferTarget(creep);
    if (creep.transfer(target, RESOURCE_ENERGY) == OK) {
      creep.memory.action = 'move';
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

  detectHarvestTarget: function(creep) {
    var target;
    if (creep.memory.sourceId) {
      target = Game.getObjectById(creep.memory.sourceId)
    } else {
      var sources = creep.room.find(FIND_SOURCES);
      target = this.filterSources(creep, sources);
    }
    return target;
  },

  filterSources: function(creep, sources) {
    var sourceIndex = creep.memory.sourceIndex || 1;
    return sources[sourceIndex];
  },

  createCreep: function(spawn, room, currentCount) {
    if (room.energyAvailable < 200) {
      return;
    }
    let body = [WORK, CARRY, MOVE];
    if (room.energyCapacity >= 650) {
      if (room.energyAvailable >= 650) {
        body = [WORK, WORK, WORK, WORK, WORK, MOVE, CARRY, CARRY];
      } else {
        if (currentCount > 0) {
          return;
        }
      }
    }
    let memory = { role: 'miner' };
    let freeSources = room.find(FIND_SOURCES, {
      filter: function(source) {
        return !!source.memory.miner
      }
    });
    if (freeSources.length > 0) {
      memory['sourceId'] = freeSources[0].id;
    }
    let result = spawn.createCreep(body, null, memory);
    if (_.isString(result)) {
      freeSources[0].memory.miner = result;
    }
  }
};

module.exports = roleMiner;
