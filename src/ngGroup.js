/*global
   angular
 */

(function filters() {
  'use strict';


  function getProperty(value, propName) {
    var property = value[propName];
    var propValue;
    if (typeof(property) === 'function') {
      propValue = property.call(value);
    } else {
      propValue = property;
    }
    return propValue;
  }


  angular.module('ng.group', [])


  /*
   * Group the input objects by a named field: e.g.
   * <div ng-repeat="group in people | groupBy:'homeTown':'peopleByTown'">
   *   <h2>{{group.homeTown}}</h2>
   *   <p ng-repeat="person in group.items">{{person.name}}</p>
   *
   * N.B. to use this with ng-repeat, you need to supply a second argument
   * ('peopleByTown' in the above example) which identifies the grouping being
   * calculated.  It should be unique within your app.  It is used to cache the
   * group objects returned by the filter, so that subsequent invocations can
   * return the same objects, so that ng-repeat's digest cycle will correctly
   * recognise the output has not changed.
   */
  .filter('groupBy', function () {
    var poolCache = {};
    poolCache.poolFor = function poolFor(memoKey, groupField) {
      var groupPool;
      if (memoKey === undefined) {
        // don't memoise, assume caller doesn't care about digest tracking
        return new GroupPool(groupField);
      } else if (this.hasOwnProperty(memoKey)) {
        groupPool = this[memoKey];
        if (groupPool.groupField !== groupField) {
          throw new Error('expected grouping "' + memoKey + '" to group by ' + groupPool.groupField + ' but asked to group by ' + groupField + ' instead!');
        }
        return groupPool;
      } else {
        this[memoKey] = groupPool = new GroupPool(groupField);
        return groupPool;
      }
    };

    function Group(initialItem, poolGen) {
      this.items = [initialItem];
      this._poolGen = poolGen;
    }

    function GroupPool(groupField) {
      this.groupField = groupField;
      this.poolGen = 0;
    }
    GroupPool.prototype.addItem = function addItem(item) {
      var groupValue = getProperty(item, this.groupField);
      var group;
      if (this.hasOwnProperty(groupValue)) group = this[groupValue];
      if (group === undefined) {
        group = this.makeGroup(item);
        group[this.groupField] = groupValue;
        this[groupValue] = group;
        return group;
      } else {
        var isNewGroup = this.addToGroup(group, item);
        if (isNewGroup) return group;
      }
    };
    GroupPool.prototype.makeGroup = function makeGroup(initialItem) {
      return new Group(initialItem, this.poolGen);
    };
    GroupPool.prototype.addToGroup = function addToGroup(group, item) {
      if (group._poolGen < this.poolGen) {
        // reuse group object from cached previous run
        Group.call(group, item, this.poolGen);
        return true;
      } else {
        group.items.push(item);
        return false;
      }
    };
    GroupPool.prototype.newGen = function newGen() {
      this.deleteOldGroups();
      ++this.poolGen;
    };
    GroupPool.prototype.deleteOldGroups = function deleteOldGroups() {
      for (var groupKey in this) {
        if (this.hasOwnProperty(groupKey)) {
          var group = this[groupKey];
          if (group._poolGen < this.poolGen) {
            delete this[groupKey];
          }
        }
      }
    };

    return function groupByFilter(items, groupField, memoKey) {
      var groupPool = poolCache.poolFor(memoKey, groupField);

      var filtered = [];
      angular.forEach(items, function (item) {
        var newGroup = groupPool.addItem(item);
        if (newGroup) filtered.push(newGroup);
      });

      groupPool.newGen();

      return filtered;
    };
  });
})();
