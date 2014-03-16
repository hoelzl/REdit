/**
 * Created by tc on 3/Mar/2014.
 */

import {app} from 'app';
import 'config';

// console.log('loading RoomController');

function roomController ($scope, config) {
   $scope.appName = config.appName;
}

export var controller = app.controller('RoomController',
                                       ['$scope', 'config', roomController]);

export default controller;
