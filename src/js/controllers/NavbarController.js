/**
 * Created by tc on 2/Mar/2014.
 */

import {app} from 'app';
import 'config';

// console.log('loading NavbarController');

function navbarController ($scope, config) {
   $scope.appName = config.appName;
}

var controller = app.controller('NavbarController',
                                ['$scope', 'config', navbarController]);

export default controller;
