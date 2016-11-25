var roleMiner = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if (!creep.memory.action) {
            creep.say('Moving to source');
            creep.memory.action = 'move';
        }
        this[creep.memory.action].call(this, creep);
    },

    move: function(creep) {
        var m = creep.memory;
        var range = 1;
        var target = Game.getObjectById(m.sourceId);
        creep.moveTo(target);
        if (creep.pos.inRangeTo(target, range)) {
            creep.say('Reached source');
            m.action = 'mine';
            mine();
        }
    },

    mine: function(creep) {
        var m = creep.memory;
        var targetSource = Game.getObjectById(m.sourceId);
        if (creep.carry.energy < creep.carryCapacity) {
            if (creep.harvest(targetSource) == ERR_NOT_IN_RANGE) {
                error(creep, 'source ' + m.sourceId + ' is unreachable');
            }
        }
        if (creep.carry.energy == creep.carryCapacity) {
            var targetContainer = Game.getObjectById(m.containerId);
            creep.transfer(targetContainer, RESOURCE_ENERGY);
            creep.say('Transferred energy');
        }
    },

    error: function(creep, message) {
        creep.memory.action = 'error';
        creep.memory.errorMsg = message;
        creep.say("I'm in error state" + creep.memory.errorMsg);
    }
};

module.exports = roleMiner;
