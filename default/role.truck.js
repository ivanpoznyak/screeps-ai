var roleTruck = {
  detectNextAction: function(creep) {
    if (!creep.memory.range) {
      creep.memory.range = 10;
    }
    if (creep.carry.energy > 0) {
      return 'transfer';
    } else {
      let nearbyResource = this.detectPickupTarget(creep);
      if (nearbyResource) {
        return 'pickup';
      } else {
        return 'withdraw';
      }
    }
  },

  detectPickupTarget: function(creep) {
    let result = _.find(creep.room.ext.resources, (resource) => {
      let inRange = creep.pos.inRangeTo(resource, 10);
      return inRange && resource.amount >= 50;
    });
    return result;
  },

  detectTransferTarget: function(creep) {
    let container = Game.getObjectById(creep.memory.containerId);

    let target = creep.pos.findClosestByPath(creep.room.ext.energyConsumers, {
      filter: (structure) => {
        let inRange = container.pos.inRangeTo(structure, creep.memory.range);
        return inRange && structure.availableStorage() > 0;
      }
    });
    if (target == null) {
      if (container.pos.inRangeTo(creep.room.ext.controllerContainer, creep.memory.range) &&
        creep.room.ext.controllerContainer &&
        creep.room.ext.controllerContainer.availableStorage() > 1000) {
        target = creep.room.ext.controllerContainer;
      }
    }
    if (target == null) {
      target = creep.pos.findClosestByRange(creep.room.ext.nonSourceContainers, {
        filter: (structure) => { return container.pos.inRangeTo(structure, creep.memory.range) && structure.availableStorage() > 0 }
      });
    }
    if (target == null || creep.room.ext.enemies.length > 0) {
      target = _.find(creep.room.ext.towers, (tower) => {
        return tower.availableStorage() > 0;
      });
    }
    if (target == null && creep.room.storage) {
      target = creep.room.storage;
    }
    return target;
  },

  detectWithdrawTarget: function(creep) {
    let target = Game.getObjectById(creep.memory.containerId);
    if (target.store[RESOURCE_ENERGY] < 500 && creep.room.storage && creep.room.storage.store[RESOURCE_ENERGY] >= creep.carryCapacity) {
      target = creep.room.storage;
    }
    return target;
  },

  createCreep: function(spawn, room, currentCount, currentLimit) {
    if (room.energyAvailable < 150) {
      return;
    }
    let body = [];
    let leftOver = room.energyAvailable;
    let bodyMultiplier = room.ext.containers.length > 3 ? 3 : 2;
    while (bodyMultiplier > 0) {
      bodyMultiplier -= 1;
      if (leftOver >= 150) {
        body.push(CARRY, CARRY, MOVE);
        leftOver -= 150;
      }
    }

    let memory = { role: 'truck', action: 'idle' };

    let containerId, sourceId, currentTrucksAssigned = 99;
    _.each(room.ext.sources, (source) => {
      let newContainerId = room.memory.sourceContainers[source.id];
      if (newContainerId) {
        let sourceTrucks = room.memory.trucks[source.id];
        if (currentTrucksAssigned > sourceTrucks.length) {
          sourceId = source.id;
          currentTrucksAssigned = sourceTrucks.length;
          containerId = newContainerId;
        }
      }
    });

    if (containerId && (currentTrucksAssigned < currentLimit / room.ext.sources.length)) {
      memory['containerId'] = containerId;
      memory['range'] = spawn.pos.getRangeTo(Game.getObjectById(containerId)) + 1;

      let result = spawn.createCreep(body, null, memory);
      if (_.isString(result)){
        room.memory.trucks[sourceId].push(result);
      }
    }
  }
};

module.exports = roleTruck;
