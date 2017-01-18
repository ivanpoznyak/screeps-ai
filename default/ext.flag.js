var roles = {
  'harvester': require('role.harvester'),
};

var actions = require('actions.all');

var extFlag = {
  initialize: function(flag) {
    flag.ext = this;
    this.flag = flag;

    let flagParams = flag.name.split('-');

    let initializer = this['initialize'+flagParams[0]];
    if (initializer) {
      initializer.call(this, flag, flagParams);
    }
  },

  initializeHarvest: function(flag, flagParams) {
    if (!this.flag.memory.harvesters) {
      this.flag.memory.harvesters = [];
    }
    if (flagParams.length > 1) {
      this.flag.memory.limit = parseInt(flagParams[1]);
    }
  },

  cleanMemory: function(removedCreeps) {
    _.forEach(removedCreeps, (creepName) => {
      let index = this.flag.memory.harvesters.indexOf(creepName);
      if (index >= 0) {
        this.flag.memory.harvesters.splice(index, 1);
      }
    });
  },

  remove: function() {
    console.log('Clearing flag memory:', this.flag.name);
    delete Memory.flags[this.flag.name];
    this.flag.remove();
  },

  spawnMissingCreeps: function() {
    if (this.flag.memory.harvesters.length >= (this.flag.memory.limit || 1)) {
      return;
    }
    console.log('trying to spawn missing harvesters')
    let storages = _.reduce(Game.rooms, (storageList, room) => {
      if (room.storage) {
        storageList.push(room.storage);
      }
      return storageList
    }, []);
    if (storages.length > 0) {
      console.log('trying to spawn missing harvesters - storage found', storages[0].room.ext.spawns)
      let spawns = storages[0].room.find(FIND_MY_SPAWNS, {
        filter: (spwn) => { return !spwn.spawning }
      });
      if (spawns.length > 0) {
        console.log('trying to spawn missing harvesters - spawn found')
        roles['harvester'].createCreep(spawns[0], this.flag);
      }
    }
  }
};

module.exports = extFlag;
