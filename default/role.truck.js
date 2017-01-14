var roleTruck = {
  detectNextAction: function(creep) {
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
    let target = creep.pos.findClosestByPath(creep.room.ext.energyStorages, {
      filter: (structure) => {
        return structure.availableStorage() > 0 && structure.id != creep.memory.containerId;
      }
    });
    if (target == null || target.structureType == STRUCTURE_CONTAINER) {
      if (creep.room.ext.controllerContainer && creep.room.ext.controllerContainer.availableStorage() > 1000) {
        target = creep.room.ext.controllerContainer;
      }
    }
    return target;
  },

  detectWithdrawTarget: function(creep) {
    return Game.getObjectById(creep.memory.containerId);
  },

  createCreep: function(spawn, room, currentCount, currentLimit) {
    if (room.energyAvailable < 150) {
      return;
    }
    let body = [CARRY, CARRY, MOVE];
    let leftOver = room.energyAvailable - 150;
    if (leftOver >= 150) {
      body.push(CARRY, CARRY, MOVE);
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

      let result = spawn.createCreep(body, null, memory);
      if (_.isString(result)){
        room.memory.trucks[sourceId].push(result);
      }
    }
  }
};

module.exports = roleTruck;
