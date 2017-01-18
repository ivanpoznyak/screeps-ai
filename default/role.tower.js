var roleTower = {
  perform: function(tower) {
    if (tower.room.ext.enemies.length > 0) {
      let target = tower.room.ext.enemies[0];
      tower.attack(target);
    } else {
      if (tower.energy < tower.energyCapacity * 0.5 ) { return };
      let target = tower.pos.findClosestByRange(tower.room.ext.structures, {
        filter: (structure) => {
          let result = false;
          if (structure.structureType == STRUCTURE_WALL) {
            if (!tower.room.memory.wallHealth) {
              tower.room.memory.wallHealth = 10000;
            }
            result = structure.hits < tower.room.memory.wallHealth;
          } else {
            if (!tower.room.memory.towerRepairMultiplier) {
              tower.room.memory.towerRepairMultiplier = 0.6;
            }
            result = (structure.hits < structure.hitsMax * tower.room.memory.towerRepairMultiplier);
          }
          return result;
        }
      });
      if (target) {
        tower.repair(target);
      }
    }
  },
};

module.exports = roleTower;
