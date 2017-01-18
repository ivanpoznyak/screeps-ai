var actionsMove = {
  perform: function(context, creep) {
    let flag = Game.flags[creep.memory.flag];
    let pathItems = creep.carry.energy == 0 ? flag.memory.path : flag.memory.reversePath;
    let pathToFollow = _.map(pathItems, (item) => { return new RoomPosition(item.x, item.y, item.roomName) });
    let startPos = pathToFollow[0];
    let endPos = pathToFollow[pathToFollow.length - 1];
    if (creep.pos.isEqualTo(endPos)) {
      creep.memory.action = 'idle';
      return;
    }
    let result = creep.moveByPath(pathToFollow);
    if (result == ERR_NOT_FOUND) {
      result = creep.moveTo(startPos);
    }
  }
};

module.exports = actionsMove;
