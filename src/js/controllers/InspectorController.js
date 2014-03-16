import {app} from 'app';
import 'config';

function inspectorController () {
}

// console.log('loading InspectorController');
export var controller = app.controller('InspectorController',
                                       ['$scope', 'config',
                                        inspectorController]);

export default controller;
