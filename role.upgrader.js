var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if (!creep.memory.action) {
            creep.memory.action = 'move';
        }
        this[creep.memory.action].call(this, creep);
    },

    move: function(creep) {
        var target, range, nextAction;
        if (creep.carry.energy > 0) {
            target = creep.room.controller;
            range = 3;
            nextAction = 'upgrade';
        } else {
            target = Game.getObjectById(creep.memory.sourceId);
            range = 1;
            nextAction = 'withdraw';
        }
        if (creep.pos.inRangeTo(target, range)) {
            creep.memory.action = nextAction;
            this[nextAction].call(this, creep);
        } else {
            creep.moveTo(target);
        }
    },

    upgrade: function(creep) {
        creep.upgradeController(creep.room.controller)
        if (creep.carry.energy == 0) {
            creep.memory.action = 'move';
        }
    },

    withdraw: function(creep) {
        var target = Game.getObjectById(creep.memory.sourceId);
        creep.withdraw(target, RESOURCE_ENERGY, creep.carryCapacity);
        creep.memory.action = 'move'
    }
};

module.exports = roleUpgrader;
