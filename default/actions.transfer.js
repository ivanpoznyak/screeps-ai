var actionsTransfer = {
  perform: function(context, creep, target, resource) {
    target = target || context.detectTransferTarget(creep);
    if (target == null) {
      creep.memory.action = 'idle';
      return;
    }
    resource = resource || RESOURCE_ENERGY;
    if (creep.pos.inRangeTo(target, 1)) {
      let result = creep.transfer(target, resource);
      creep.memory.action = 'idle';
    } else {
      creep.moveTo(target);
    }
  }
};

module.exports = actionsTransfer;
