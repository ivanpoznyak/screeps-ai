var actionsIdle = {
  perform: function(context, creep) {
    let nextAction = context.detectNextAction(creep);
    if (nextAction == 'idle') {
      creep.memory.idleFor = (creep.memory.idleFor || 0) + 1;
    } else {
      creep.memory.idleFor = 0;
      if (context['resetIdle']) {
        context['resetIdle'].call(context, creep);
      }
    }
    creep.memory.action = nextAction;
  }
};

module.exports = actionsIdle;
