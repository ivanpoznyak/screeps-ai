var actionsRepair = {
  perform: function(context, creep, target) {
    target = target || context.detectRepairTarget(creep);
    if (target == null) {
      creep.memory.action = 'idle';
      return;
    }
    if (creep.pos.inRangeTo(target, 3)) {
      let result = creep.repair(target);
      if (creep.carry.energy == 0 || result == ERR_INVALID_TARGET) {
        creep.memory.action = 'idle';
      }
    } else {
      creep.moveTo(target);
    }
  }
};

module.exports = actionsRepair;
