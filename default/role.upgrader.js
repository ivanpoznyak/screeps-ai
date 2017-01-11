var roleUpgrader = {
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
      target = creep.room.controller;
      nextAction = 'upgrade';
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

  upgrade: function(creep, target) {
    creep.upgradeController(creep.room.controller)
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

  withdraw: function(creep, target) {
    target = target || this.detectWithdrawTarget(creep);
    creep.withdraw(target, RESOURCE_ENERGY, creep.carryCapacity);
    creep.memory.action = 'move'
  },

  detectWithdrawTarget: function(creep) {
    return Game.getObjectById(creep.memory.containerId)
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
      var sourceIndex = creep.memory.sourceIndex || 0;
      return sources[sourceIndex];
  },

  createCreep: function(spawn, room, currentCount) {
    let body = [WORK, CARRY, MOVE];
    let leftOver = room.energyAvailable - 200;
    while (leftOver > 0) {
      body = body + [WORK, CARRY, MOVE];
      leftOver -= 200;
    }
    let source = room.controller.pos.findClosestByPath(FIND_SOURCES);
    let memory = { role: 'upgrader', sourceId: source.id };
    let containers = room.controller.pos.findInRange(FIND_STRUCTURES, 6, {
      filter: (structure) => {
        return structure.structureType == STRUCTURE_CONTAINER;
      }
    });
    if (containers.length > 0) {
      memory['useContainers'] = true;
      memory['containerId'] = containers[0].id;
    }
    let result = spawn.createCreep(body, null, memory);
  }
};

module.exports = roleUpgrader;
