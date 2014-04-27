ng-group
========

An [Angular.js](https://angularjs.org)
[filter](https://docs.angularjs.org/guide/filter)
for grouping items in an array by one of their fields.

![Build status](https://www.codeship.io/projects/79314900-ab58-0131-5a52-6eb7d655a820/status)


Usage
-----

The package `ng-group` provides a filter named `groupBy` for use with
[`ng-repeat`](https://docs.angularjs.org/api/ng/directive/ngRepeat).

### Example

Say you have an array of objects representing people:

```javascript
$scope.people = [
  {name: "Frodo Baggins", home: "The Shire"},
  {name: "Samwise Gamgee", home: "The Shire"},
  {name: "Aragorn", home: "Gondor"},
  {name: "Legolas", home: "Mirkwood"},
  /* ... */
];
```

and you want to display them arranged according to the place they call home:

> #### The Shire
> * Frodo Baggins
> * Samwise Gamgee
>
> #### Gondor
> * Aragorn
>
> #### Mirkwood
> * Legolas

Applying the `groupBy:'home'` filter to `people` produces an array of places
and the people who live there.  You can loop through the places with
`ng-repeat`, then loop through the people for a given place with another,
nested `ng-repeat`, like this:

```html
<div ng-repeat="placePeople in people | groupBy:'home':'peopleByHome'">
  <h3>{{placePeople.home}}</h3>
  <ul>
    <li ng-repeat="person in placePeople.items">{{person.name}}</li>
  </ul>
</div>
```

Angular's two-way data-binding will work as normal.  If you remove an item from
the array, it will be removed from the view; if it was the only item in its
group, the group will be removed as well.

See a
[working, editable version](http://codepen.io/samstokes/pen/jIusq?editors=101)
of the above example on CodePen.

### Installing

 1. Add `ngGroup.js` to your app.

    Copy
    [src/ngGroup.js](https://github.com/samstokes/ng-group/raw/master/src/ngGroup.js)
    into your app.

 2. Load `ngGroup.js` via a `script` tag.  *N.B.* it must be loaded *after*
    Angular.js, but *before* your app code.

    ```html
    <script src="path/to/angular.js"></script>
    <script src="path/to/ngGroup.js"></script> <!-- add this -->
    <script src="YourApp.js"></script>
    ```

 3. Add the `ng.group` module to your app's dependencies:

    ```javascript
    var app = angular.module('YourApp', [
        'ng.group'                             // add this
    ]);

    app.controller('YourCtrl', function () {
      // ...
    });
    ```

 4. Now you can use the `groupBy` filter in your views:

    ```html
    <div ng-repeat="placePeople in people | groupBy:'home':'peopleByHome'">
      <!-- ... -->
    </div>
    ```

### Details

 * **Group field:** The first argument to the filter is the name of the
   property to group by.  It can be the name of an object property (e.g.
   `person.home`) or an object method (e.g. `person.home()`).

    *N.B.* this argument will be evaluated as an Angular expression, so you
    will probably want to quote it:
     * `groupBy:'home'` &ndash; groups items by their `home` property.
     * `groupBy:home` &ndash; looks for a variable called `home` in the current
       scope, gets its value, and groups items by a property with that name.

 * **Return value:** The filter returns an array of group objects, one per
   group.  Each object has:
     * a property `items`, whose value is an array of the items in that group;
     * a property with the same name as the group field (e.g. `home` in the
       above example), whose value is the name of that group.

 * **ng-repeat:** To use this with ng-repeat, you need to supply a second
   argument (`'peopleByHome'` in the above example) which identifies the
   grouping being calculated.  It should be unique within your app.  If you see
   errors in the Javascript console about "10 digest iterations reached", check
   you haven't forgotten the second argument.

    It is used to cache the group objects returned by the filter, so that
    subsequent invocations can return the same objects, so that ng-repeat's
    digest cycle will correctly recognise the output has not changed.

 * **Ordering:** The filter returns groups in the order they first appeared in
   the original array, and likewise items within each group in the same
   relative order as they appeared in the original array.

    If you want to control the ordering, sort the original array (e.g. using
    the standard `orderBy` filter) before passing it to `groupBy`:

    ```html
    <div ng-repeat="placePeople in people | orderBy:'home' | groupBy:'home':'peopleByHome'">
    ```

 * **Performance:** The filter itself should be reasonably efficient (O(*n*) in
   the number of items).  However if used in an `ng-repeat` expression, the
   filter will be reevaluated on each digest cycle (e.g. when anything in the
   scope changes).  Therefore if your original array may contain a lot of
   items, you may want to call this in your controller instead in order to
   precompute the grouping.  (If so, you'll need explicit
   [`$watch`](https://docs.angularjs.org/api/ng/type/$rootScope.Scope#$watch)
   statements if you want to update the grouping when the items change.)

    While the filter does some caching, it is only to avoid digest loops;
    subsequent runs will recompute the groupings from scratch (albeit avoiding
    the cost of object creation).


Reporting issues
----------------

If you have any problems using this, please
[submit an issue on Github](https://github.com/samstokes/ng-group/issues/new)
and I will try to help.

### Developing

Pull requests and constructive criticism gratefully accepted.

To hack on this, you'll need
[npm](https://www.npmjs.org/),
[bower](http://bower.io/) and
[grunt](http://gruntjs.com/).  Then:

 1. `npm install`
 2. `bower install`
 3. `grunt` &ndash; this will:
    * [JSHint](http://www.jshint.com/) the code
    * run the [Jasmine](http://jasmine.github.io/) unit tests

I'll be more likely to accept a pull request that includes tests :)


Author
------

[Sam Stokes](https://github.com/samstokes)


License
-------

See LICENSE file.
