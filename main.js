var roles = {
    'harvester': require('role.harvester'),
    'builder': require('role.builder'),
    'upgrader': require('role.upgrader'),
    'miner': require('role.miner'),
    'worker': require('role.worker'),
    'truck': require('role.truck'),
    'repairer': require('role.repairer')
};
var Tower = require('struct.tower');

module.exports.loop = function () {
    var spawn = Game.spawns['mspwn'];

    var population = [
        { name: 'M1', body: [MOVE, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY], mem: { role: 'miner', sourceId: '577b936c0f9d51615fa48267', containerId: '58343cb72d3f67d629d009d8' }},
        { name: 'ST1', body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY], mem: { role: 'truck', fromId: '58343cb72d3f67d629d009d8', toId: '5835657dfe7ac51532395492' }},
        { name: 'U1', body: [MOVE, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY], mem: { role: 'upgrader', sourceId: '5835657dfe7ac51532395492'} },

        { name: 'M2', body: [MOVE, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY], mem: { role: 'miner', sourceId: '577b936c0f9d51615fa48269', containerId: '5834557abb47c3fd557544f9' }},
        { name: 'ST2', body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY], mem: { role: 'truck', fromId: '5834557abb47c3fd557544f9', toId: '58357a2208bd538d44185b21' }},
        { name: 'U2', body: [MOVE, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY], mem: { role: 'upgrader', sourceId: '5835657dfe7ac51532395492' } },

        { name: 'T1', body: [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY], mem: { role: 'truck', fromId: '58343cb72d3f67d629d009d8' }},
        { name: 'T2', body: [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY], mem: { role: 'truck', fromId: '58357a2208bd538d44185b21' }},
        { name: 'T3', body: [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY], mem: { role: 'truck', fromId: '58357a2208bd538d44185b21' }},
        { name: 'T4', body: [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY], mem: { role: 'truck' }},
        { name: 'T5', body: [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY], mem: { role: 'truck' }},
        { name: 'T5', body: [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY], mem: { role: 'truck' }},

        { name: 'ST3', body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY], mem: { role: 'truck', toId: '5835822591a93314429ac730' }},

        { name: 'W1', body: [MOVE, MOVE, MOVE, WORK, WORK, WORK, CARRY, CARRY, CARRY], mem: { 'role': 'worker', sourceId: '5835657dfe7ac51532395492' }},
        { name: 'W2', body: [MOVE, MOVE, MOVE, WORK, WORK, WORK, CARRY, CARRY, CARRY], mem: { 'role': 'worker', sourceId: '58357a2208bd538d44185b21' }},
        { name: 'R1', body: [MOVE, MOVE, MOVE, WORK, WORK, WORK, CARRY, CARRY, CARRY], mem: { 'role': 'repairer', sourceId: '5835657dfe7ac51532395492' }},
    ];

    for (i=0; i<population.length; i++) {
        var creep = population[i];
        if (!Game.creeps[creep.name] && !spawn.spawning) {
            var body = creep.body;
            if (!body) {
                body = [MOVE, WORK, CARRY];
            }
            spawn.createCreep(body, creep.name, creep.mem);
            break;
        }
    }

    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        var role = roles[creep.memory.role];
        if (role) {
            role.run(creep);
        }
    }

    for (var roomName in Game.rooms) {
        var room = Game.rooms[roomName];
        var towers = room.find(FIND_MY_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_TOWER);
            }
        });
        if (towers.length > 0) {
            for (j=0; j<towers.length; j++) {
                var tower = towers[j];
                Tower.run(tower);
            }
        }
    }
}
