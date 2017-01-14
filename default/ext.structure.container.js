StructureContainer.prototype.availableStorage = function() {
  var total = _.sum(this.store)
  return this.storeCapacity - total;
};
