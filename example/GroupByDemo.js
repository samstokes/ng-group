var app = angular.module('GroupByDemo', ['ng.group']);

app.controller('FellowshipCtrl', function FellowshipCtrl($scope) {
  $scope.people = [
    {name: "Frodo Baggins", home: "The Shire"},
    {name: "Samwise Gamgee", home: "The Shire"},
    {name: "Gandalf the Grey", home: "unknown"},
    {name: "Legolas", home: "Mirkwood"},
    {name: "Gimli", home: "The Lonely Mountain"},
    {name: "Aragorn", home: "Gondor"},
    {name: "Boromir", home: "Gondor"},
    {name: "Meriadoc Brandybuck", home: "The Shire"},
    {name: "Peregrin Took", home: "The Shire"}
  ];
  $scope.newPerson = {};

  $scope.addPerson = function addPerson() {
    this.people.push(this.newPerson);
    this.newPerson = {};
  };

  $scope.removePerson = function removePerson(person) {
    var index = this.people.indexOf(person);
    if (index < 0) return;
    this.people.splice(index, 1);
  };
});
