/**
 * Created by tc on 3/Mar/2014.
 */

import 'config';
import 'RoomService';
import {app} from 'app';
import Room from 'Room';

// console.log('loading REditController');

var resizeTimeoutId = null;

function REditController ($scope, config, drawingService, roomService) {

   function makeObjectAdder (creator) {
      return () => {
         var room = roomService.current.room;
         drawingService[creator](obj => {
            $scope.safeApply(() => roomService.addObject(obj, room))
         });
      }
   }

   var resizeHandler = () => {
      _.each(roomService.rooms, room => {
         // console.log('Resizing', room, room.title);
         drawingService.setRoomCurrentFromDesign(room);
      })
   };

   // TODO: Maybe this should be a dedicated service?
   $scope.safeApply = (fn) => {
      var phase = $scope.$root.$$phase;
      if (phase == '$apply' || phase == '$digest') {
         if (fn && typeof(fn) === 'function') {
            // console.log('Not calling apply');
            fn();
         }
      } else {
         // console.log('Calling apply');
         $scope.$apply(fn);
      }
   };

   // TODO: This cannot be right...
   drawingService.on('canvas-resized', () => $scope.safeApply());
   drawingService.on('selection-changed', () => $scope.safeApply());

   $scope.appName = config.appName;

   $scope.dirty = () => roomService.dirty;

   Object.defineProperty($scope, 'rooms', {
      get: () => roomService.rooms
   });

   Object.defineProperty($scope, 'current', {
      get: () => roomService.current,
      set: (newRoom) => roomService.current = newRoom
   });

   Object.defineProperty($scope, 'selectedObject', {
      get: () => drawingService.selectedObject
   });

   $scope.drawingRevision = () => {
      return drawingService.revision();
   };
   $scope.revision = () => {
      return roomService.revision();
   };
   $scope.newRoom = () => {
      return roomService.newRoom();
   };
   $scope.duplicateRoom = () => {
      drawingService.deactivateSelection();
      return roomService.duplicateRoom($scope.safeApply);
   };
   $scope.deleteRoom = () => {
      return roomService.deleteRoom();
   };

   $scope.inspector = {
      visible: true
   };

   $scope.roomList = {
      visible: true
   };

   $scope.toggle = (thing) => {
      thing.visible = !thing.visible;
      drawingService.invalidateLayout();
   };

   $scope.redraw = () => {
      // console.log('redrawing');
      drawingService.drawRoom(roomService.current.room);
   };

   $scope.addNode = makeObjectAdder('newNode');

   $scope.addDoor = makeObjectAdder('newDoor');

   $scope.addRadiationSource = makeObjectAdder('newRadiationSource');


   $scope.$watch('drawingRevision()', () => {
      // console.log('Drawing watch');
      if (resizeTimeoutId) {
         // console.log('Clearing old resize timeout', resizeTimeoutId);
         clearTimeout(resizeTimeoutId);
      }
      // console.log('Setting new resize timeout');
      resizeTimeoutId = setTimeout(resizeHandler, 1);
   });

   $scope.$watch('revision()', () => {
      // console.log('Dirty watch');
      drawingService.drawRoom(roomService.current.room);
   });

}

export var controller = app.controller('REditController',
                                       ['$scope', 'config', 'DrawingService',
                                        'RoomService', REditController]);

export default controller;
