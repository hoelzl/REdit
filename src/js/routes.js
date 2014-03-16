/**
 * Created by tc on 3/Mar/2014.
 */

import {app} from 'app';

// console.log('loading routes.js');

var routes = app.config(['$routeProvider', function ($routeProvider) {
   $routeProvider.when('/', {
      templateUrl: 'inspector.html',
      controller:  'InspectorController'
   });
}]);

export default routes;
