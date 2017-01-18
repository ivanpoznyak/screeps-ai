StructureTower.prototype.availableStorage = function() {
  return this.energyCapacity - this.energy;
};
