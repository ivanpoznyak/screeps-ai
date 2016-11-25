var structTower = {
    run: function(tower) {
        if (tower.energy == 0) {
            return;
        }
        var enemies = tower.room.find(FIND_HOSTILE_CREEPS);
        if (enemies.length > 0) {
            tower.attack(enemies[0]);
        } else {
            var breakpoints = [6000, 15000, 25000, 40000, 60000, 80000, 100000];
            for (var index in breakpoints) {
                var breakpoint = breakpoints[index];
                var targets = tower.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_RAMPART) && (structure.hits < structure.hitsMax && structure.hits < breakpoint);
                    }
                });

                if (targets.length > 0) {
                    tower.repair(targets[0]);
                    break;
                }
            }

        }
    },
};

module.exports = structTower;
