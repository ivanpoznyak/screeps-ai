var roles = {
    'miner': require('role.miner'),
    'upgrader': require('role.upgrader'),
    'worker': require('role.worker'),
    'truck': require('role.truck')
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

    let grouppedStructures = _.groupBy(this.structures, 'structureType');

    this.spawns = grouppedStructures[STRUCTURE_SPAWN] || [];
    this.extensions = grouppedStructures[STRUCTURE_EXTENSION] || [];
    this.energyConsumers = this.spawns.concat(this.extensions);

    this.containers = grouppedStructures[STRUCTURE_CONTAINER] || [];

    this.controllerContainer = _.find(this.containers, (container) => {
      return container.pos.inRangeTo(room.controller, 6);
    });

    this.initializeMemory();
    this.initializeSourceContainers();

    this.nonSourceContainers = _.filter(this.containers, (container) => {
      let nonUpgradeContainer = (this.controllerContainer == null) || (container.id != this.controllerContainer.id);
      return nonUpgradeContainer && !_.some(this.sources, (source) => {
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

  calculateCurrentLimits: function() {
    return  {
      'miner': 2,
      'upgrader': 2,
      'worker': 3,
      'truck': 4
    };
  },

  initializeSourceContainers: function() {
    _.each(this.sources, (source) => {
      let containers = source.pos.findInRange(this.containers, 3);
      if (containers.length > 0) {
        this.room.memory.sourceContainers[source.id] = containers[0].id;
      }
    });
  }
};

module.exports = extRoom;
