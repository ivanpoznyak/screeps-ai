var actionsWithdraw = {
  perform: function(context, creep, target, resource) {
    target = target || context.detectWithdrawTarget(creep);
    if (target == null) {
      creep.memory.action = 'idle';
      return;
    }
    resource = resource || RESOURCE_ENERGY;
    if (creep.pos.inRangeTo(target, 1)) {
      let result = creep.withdraw(target, resource);
      creep.memory.action = 'idle';
    } else {
      creep.moveTo(target);
    }
  }
};

module.exports = actionsWithdraw;
