var roleWorker = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if (!creep.memory.action) {
            creep.say('Moving to source');
            creep.memory.action = 'move';
        }
        this[creep.memory.action](creep);
    },

    move: function(creep) {
        var target, range, nextAction;
        if (creep.carry.energy > 0) {
            target = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
            if(target) {
              nextAction = 'build'
            } else {
                target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_ROAD || structure.structureType == STRUCTURE_CONTAINER || structure.structureType == STRUCTURE_RAMPART)
                          && (structure.hits < structure.hitsMax && structure.hits < 100000);
                    }
                });
                if(target) {
                  nextAction = 'repair';
                }
            }
            range = 3;
        } else {
            target = Game.getObjectById(creep.memory.sourceId);
            range = 1;
            nextAction = 'withdraw';
        }
        if (target) {
            creep.memory.targetId = target.id;
            if (creep.pos.inRangeTo(target, range)) {
                creep.memory.action = nextAction;
                this[nextAction].call(this, creep);
            } else {
                creep.moveTo(target);
            }
        }
    },

    withdraw: function(creep) {
        var target = Game.getObjectById(creep.memory.sourceId);
        creep.withdraw(target, RESOURCE_ENERGY, creep.carryCapacity);
        creep.memory.targetId = null;
        creep.memory.action = 'move'
    },

    build: function(creep) {
        var target = Game.getObjectById(creep.memory.targetId);
        var result = creep.build(target);
        if (creep.carry.energy == 0 || result == ERR_INVALID_TARGET) {
            creep.memory.targetId = null;
            creep.memory.action = 'move';
        }
    },

    repair: function(creep) {
        var target = Game.getObjectById(creep.memory.targetId);
        var result = creep.repair(target);
        if (creep.carry.energy == 0 || result == ERR_INVALID_TARGET || target.hits == target.hitsMax || target.hits > 100000) {
            creep.memory.targetId = null;
            creep.memory.action = 'move';
        }
    }
};

module.exports = roleWorker;
