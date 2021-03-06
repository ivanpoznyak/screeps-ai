var actionsHarvest = {
  perform: function(context, creep, target) {
    target = target || context.detectHarvestTarget(creep);
    if (! target) {
      console.log(creep.name, 'cant find target');
      return;
    }
    if (creep.pos.inRangeTo(target, 1)) {
      creep.harvest(target);
      if (creep.carry.energy == creep.carryCapacity) {
        creep.memory.action = 'idle';
      }
    } else {
      creep.moveTo(target);
    }
  }
};

module.exports = actionsHarvest;
