var actionsPickup = {
  perform: function(context, creep, target) {
    target = target || context.detectPickupTarget(creep);
    if (target == null) {
      creep.memory.action = 'idle';
      return;
    }
    if (creep.pos.inRangeTo(target, 1)) {
      creep.pickup(target);
      creep.memory.action = 'idle';
    } else {
      creep.moveTo(target);
    }
  }
};

module.exports = actionsPickup;
