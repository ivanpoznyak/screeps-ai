var roleTruck = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if (!creep.memory.action) {
            creep.memory.action = 'move';
        }
        this[creep.memory.action](creep);
    },

    move: function(creep) {
        var range = 1;
        var target, nextAction;
        if (creep.carry.energy > 0) {
            if (!creep.memory.toId) {
                target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
                            structure.energy < structure.energyCapacity;
                    }
                });
                if (!target) {
                    target = creep.room.storage;
                }
            } else {
                target = Game.getObjectById(creep.memory.toId);
            }
            if (target) {
                creep.memory.targetId = target.id;
                nextAction = 'transfer';
            }
        } else {
            if (creep.memory.fromId) {
                target = Game.getObjectById(creep.memory.fromId);
            } else {
                target = creep.room.storage;
            }
            nextAction = 'withdraw';
        }
        if (target) {
            if (creep.pos.inRangeTo(target, range)) {
                creep.memory.action = nextAction;
                this[nextAction].call(this, creep);
            } else {
                creep.moveTo(target);
            }
        }
    },

    transfer: function(creep) {
        var target = Game.getObjectById(creep.memory.toId || creep.memory.targetId);
        creep.transfer(target, RESOURCE_ENERGY);
        creep.say('Transferred energy');
        creep.memory.action = 'move';
    },

    withdraw: function(creep) {
        var target;
        if (creep.memory.fromId) {
            target = Game.getObjectById(creep.memory.fromId);
        } else {
            target = creep.room.storage;
        }
        creep.withdraw(target, RESOURCE_ENERGY, creep.carryCapacity);
        creep.memory.action = 'move'
    }
};

module.exports = roleTruck;
