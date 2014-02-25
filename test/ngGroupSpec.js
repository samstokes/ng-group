'use strict';

describe('ng.group', function () {
  beforeEach(module('ng.group'));


  // borrowed from Angular source
  function isArray(value) {
    return Object.prototype.toString.call(value) === '[object Array]';
  }


  describe('groupBy', function () {
    var groupByFilter;

    beforeEach(inject(function (_groupByFilter_) {
      groupByFilter = _groupByFilter_;
    }));

    function personNamed(name) {
      return jasmine.objectContaining({name: name});
    }


    it('should return empty for an empty input', function () {
      expect(groupByFilter([], 'homeTown').length).toBe(0);
    });

    describe('grouping people by home town', function () {
      var people = [
        {name: 'Bob', homeTown: 'New York City'},
        {name: 'Sam', homeTown: 'London'},
        {name: 'Alice', homeTown: 'New York City'},
        {name: 'Alex', homeTown: 'London'},
        {name: 'Dave', homeTown: 'San Francisco'}
      ];

      function town(name) {
        return jasmine.objectContaining({homeTown: name});
      }


      var filtered;
      beforeEach(function () {
        filtered = groupByFilter(people, 'homeTown');
      });

      function townPeople(town) {
        var townAndPeople = filtered.filter(function (_townAndPeople) {
          return _townAndPeople.homeTown === town;
        })[0];
        if (townAndPeople === undefined) return undefined;
        return townAndPeople.items;
      }

      function names(people) {
        return people.map(function (person) { return person.name; });
      }


      it('should return an array of group objects', function () {
        expect(isArray(filtered)).toBeTruthy('filtered is not an array!');
        filtered.forEach(function (group) {
          expect(group.homeTown).toBeDefined();
          expect(isArray(group.items)).toBeTruthy('group ' + group.homeTown + ' items is not an array!');
        });
      });

      it('should return a group for each home town', function () {
        expect(filtered).toContain(town('New York City'));
        expect(filtered).toContain(town('London'));
        expect(filtered).toContain(town('San Francisco'));
      });

      it('should group the people by home town', function () {
        expect(townPeople('New York City')).toContain(personNamed('Alice'));
        expect(townPeople('New York City')).toContain(personNamed('Bob'));
        expect(townPeople('London')).toContain(personNamed('Sam'));
        expect(townPeople('London')).toContain(personNamed('Alex'));
        expect(townPeople('San Francisco')).toContain(personNamed('Dave'));
      });

      it('should include no empty groups', function () {
        expect(filtered).not.toContain(jasmine.objectContaining({items: []}));
      });

      it('should preserve order of items within groups', function () {
        expect(names(townPeople('New York City'))).toEqual(['Bob', 'Alice']);
        expect(names(townPeople('London'))).toEqual(['Sam', 'Alex']);
      });

      it('should return groups in order of first seen (so pre-sorting works)', function () {
        var towns = filtered.map(function (group) {
          return group.homeTown;
        });

        expect(towns).toEqual(['New York City', 'London', 'San Francisco']);
      });

      describe('if I typo the group field', function () {
        var misfiltered;
        beforeEach(function () {
          misfiltered = groupByFilter(people, 'hoemTown');
        });

        it('should return a single group', function () {
          expect(isArray(misfiltered)).toBeTruthy();
          expect(misfiltered.length).toBe(1);
        });

        it('should put all the items in that group', function () {
          expect(names(misfiltered[0].items)).toEqual(
            ['Bob', 'Sam', 'Alice', 'Alex', 'Dave'])
        });

        it('should return undefined as the group field', function () {
          expect(misfiltered[0].hasOwnProperty('hoemTown'));
          expect(misfiltered[0].hoemTown).toBe(undefined);
        });
      });
    });

    it('should work with object methods too', function () {
      function Person(data) {
        for (var k in data) this[k] = data[k];
      }
      Person.prototype.uptown = function () {
        return this.homeTown.toUpperCase();
      };
      var people = [
        {name: 'Bob', homeTown: 'New York City'},
        {name: 'Sam', homeTown: 'London'},
        {name: 'Alice', homeTown: 'New York City'},
        {name: 'Alex', homeTown: 'London'},
        {name: 'Dave', homeTown: 'San Francisco'}
      ].map(function (data) { return new Person(data); });

      function town(name) {
        return jasmine.objectContaining({uptown: name});
      }

      var filtered = groupByFilter(people, 'uptown');

      expect(filtered).toContain(town('LONDON'));
      var LONDONers = filtered.filter(function (townsAndPeople) {
        return townsAndPeople.uptown === 'LONDON';
      })[0];
      expect(LONDONers.items).toContain(personNamed('Sam'));
      expect(LONDONers.items).toContain(personNamed('Alex'));
    });


    describe('caching', function () {
      var men = [
        {name: 'Bob', homeTown: 'New York City'},
        {name: 'Sam', homeTown: 'London'},
        {name: 'Alex', homeTown: 'London'}
      ], filteredMen,
      women = [
        {name: 'Alice', homeTown: 'New York City'},
        {name: 'Dorothy', homeTown: 'London'}
      ], filteredWomen;

      function townPeople(filtered, town) {
        var townAndPeople = filtered.filter(function (_townAndPeople) {
          return _townAndPeople.homeTown === town;
        })[0];
        if (townAndPeople === undefined) return undefined;
        return townAndPeople.items;
      }

      beforeEach(function () {
        filteredMen = groupByFilter(men, 'homeTown', 'men');
        filteredWomen = groupByFilter(women, 'homeTown', 'women');
      });

      it('should return the same group objects from subsequent invocations', function () {
        var londonMen = filteredMen.filter(function (townAndPeople) {
          return townAndPeople.homeTown === 'London';
        })[0];
        expect(londonMen).toBeDefined();

        var refilteredMen = groupByFilter(men, 'homeTown', 'men');
        var relondonMen = refilteredMen.filter(function (townAndPeople) {
          return townAndPeople.homeTown === 'London';
        })[0];
        expect(relondonMen).toBe(londonMen);
      });

      it('should not mix up groups from unrelated invocations', function () {
        var nycMen = townPeople(filteredMen, 'New York City');
        expect(nycMen).toContain(personNamed('Bob'));
        expect(nycMen).not.toContain(personNamed('Alice'));

        var londonWomen = townPeople(filteredWomen, 'London');
        expect(londonWomen).toContain(personNamed('Dorothy'));
        expect(londonWomen).not.toContain(personNamed('Sam'));
      });

      it('should fail noisily if you reuse the memoKey for a different grouping', function () {
        expect(function () {
          groupByFilter(men, 'demographic', 'men');
        }).toThrow();
      });
    });
  });
});
