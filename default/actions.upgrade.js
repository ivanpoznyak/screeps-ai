var actionsUpgrade = {
  perform: function(context, creep, target) {
    target = creep.room.controller;
    if (creep.pos.inRangeTo(target, 3)) {
      creep.upgradeController(target);
      if (creep.carry.energy == 0) {
        creep.memory.action = 'idle';
      }
    } else {
      creep.moveTo(target);
    }
  }
};

module.exports = actionsUpgrade;
