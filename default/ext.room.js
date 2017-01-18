var roles = {
  'miner': require('role.miner'),
  'upgrader': require('role.upgrader'),
  'worker': require('role.worker'),
  'truck': require('role.truck'),
  'patrol': require('role.patrol'),
  'tower': require('role.tower'),
  'harvester': require('role.harvester'),
};

var actions = require('actions.all');

var extRoom = {
  initialize: function(room) {
    room.ext = this;
    this.room = room;
    this.sources = room.find(FIND_SOURCES);
    this.structures = room.find(FIND_STRUCTURES);
    this.creeps = room.find(FIND_MY_CREEPS);
    this.resources = room.find(FIND_DROPPED_RESOURCES);

    this.enemies = room.find(FIND_HOSTILE_CREEPS);


    let grouppedStructures = _.groupBy(this.structures, 'structureType');

    this.spawns = grouppedStructures[STRUCTURE_SPAWN] || [];
    this.extensions = grouppedStructures[STRUCTURE_EXTENSION] || [];
    this.energyConsumers = this.spawns.concat(this.extensions);

    this.containers = grouppedStructures[STRUCTURE_CONTAINER] || [];
    this.towers = grouppedStructures[STRUCTURE_TOWER] || [];

    this.controllerContainer = _.find(this.containers, (container) => {
      return container.pos.inRangeTo(room.controller, 3);
    });

    this.initializeMemory();
    this.initializeSourceContainers();

    this.nonSourceContainers = _.filter(this.containers, (container) => {
      return !_.some(this.sources, (source) => {
        return container.id == this.room.memory.sourceContainers[source.id];
      });
    });
    this.energyStorages = this.energyConsumers.concat(this.nonSourceContainers);
  },

  initializeMemory: function() {
    if (!this.room.memory.miners) {
      this.room.memory.miners = {};
    }
    if (!this.room.memory.trucks) {
      let value = {};
      _.each(this.sources, (source) => {
        value[source.id] = [];
      });
      this.room.memory.trucks = value;
    }
    if (!this.room.memory.sourceContainers) {
      this.room.memory.sourceContainers = {}
    }
    this.room.memory.useContainers = this.containers.length > 0;
  },

  creepWallHealth: function() {
    if (!this.room.memory.creepWallHealth) {
      this.room.memory.creepWallHealth = 10000;
    }
    return this.room.memory.creepWallHealth;
  },

  creepRepairMultiplier: function() {
    if (this.towers.length > 0) {
      if (!this.room.memory.creepRepairMultiplier) {
        this.room.memory.creepRepairMultiplier = 0.3;
      }
    } else {
      if (!this.room.memory.creepRepairMultiplier) {
        this.room.memory.creepRepairMultiplier = 0.5;
      }
    }
    return this.room.memory.creepRepairMultiplier;
  },

  cleanMemory: function(removedCreeps) {
    _.forEach(this.sources, (source) => {
      _.forEach(removedCreeps, (creepName) => {
        if (this.room.memory.miners[source.id] == creepName) {
          this.room.memory.miners[source.id] = null;
        }
        let index = this.room.memory.trucks[source.id].indexOf(creepName);
        if (index >= 0) {
          this.room.memory.trucks[source.id].splice(index, 1);
        }
      });
    });
  },

  spawnMissingCreeps: function() {
    let currentCounts = _.countBy(this.creeps, 'memory.role');

    let configuredLimits = this.calculateCurrentLimits();
    _.forEach(configuredLimits, (limit, roleName) => {
      let currentCount = currentCounts[roleName] || 0;
      if (currentCount < limit) {
        let spawn = _.find(this.spawns, (spwn) => { return !spwn.spawning });
        if (spawn) {
          roles[roleName].createCreep(spawn, this.room, currentCount, limit);
        }
      }
    });
  },

  runCreeps: function() {
    _.each(this.creeps, function(creep) {
      actions[creep.memory.action].perform(roles[creep.memory.role], creep);
    });
  },

  runDefenses: function() {
    _.each(this.towers, function(tower) {
      roles['tower'].perform(tower);
    });
  },

  calculateCurrentLimits: function() {
    let result = {};
    result['miner'] = this.sources.length;
    result['upgrader'] = this.room.controller.level < 2 ? 1 : (this.room.controller.level >= 4 ? 2 : 2);
    result['worker'] = this.room.controller.level < 4 ? 3 : 3;
    result['truck'] = this.containers.length < 1 ? 0 : 2;
    return result;
  },

  initializeSourceContainers: function() {
    this.sourceContainers = [];
    _.each(this.sources, (source) => {
      let containers = source.pos.findInRange(this.containers, 3);
      if (containers.length > 0) {
        this.room.memory.sourceContainers[source.id] = containers[0].id;
        this.sourceContainers.push(containers[0]);
      }
    });
  }
};

module.exports = extRoom;
