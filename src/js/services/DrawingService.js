/**
 * Created by tc on 6/Mar/2014.
 */

module _ from 'lodash';
module domReady from 'domReady';
module fabric from 'fabric';
module jQuery from 'jquery';

import {app} from 'app';
import {Room} from 'Room';
import {Node} from 'Node';
import {Door} from 'Door';
import {RadiationSource} from 'RadiationSource';

import EventEmitter from 'EventEmitter';

// To make WebStorm happy...
var domReady;


var MIN_CHANGE = 1e-8;

export class DrawingService extends EventEmitter {

   constructor () {
      super();
      // console.log('Creating new DrawingService');

      var mainCanvas = document.getElementById('main-canvas');
      var jsonDiv = document.getElementById('json-div');
      var containerDiv = document.getElementById('container-div');
      // TODO: Get these values from the configuration.
      var designHeight = 1000;
      var designWidth = 1600;
      var fabricCanvas = new fabric.Canvas('main-canvas', {
         height:          designHeight,
         width:           designWidth,
         backgroundColor: 'white'
      });

      fabricCanvas.on('object:modified', options => {
         this.updateDesignHandler(options);
      });

      fabricCanvas.on('before:selection:cleared', options => {
         if (options && options.target) {
            var target = options.target;
            // console.log('before:selection:cleared:', target);
            setTimeout(() => {
               this.setDesignFromCurrent(target);
            })
         }
      }, 0);


       fabricCanvas.on('object:moving', options => {
         if (options.target === this.selectedObject) {
            this.emit('selection-changed');
         }
       });

      /*
       fabricCanvas.on('object:scaling', options => {
       this.updateDesignHandler(options);
       });

       fabricCanvas.on('object:rotating', options => {
       this.updateDesignHandler(options);
       });
       */

      if (mainCanvas) {
         mainCanvas.height = designHeight;
         mainCanvas.width = designWidth;
      }
      if (jsonDiv) {
         jsonDiv.width = designWidth;
      }

      this._mainCanvas = mainCanvas;
      this._fabricCanvas = fabricCanvas;
      this._jsonDiv = jsonDiv;
      this._containerDiv = containerDiv;
      this._designHeight = designHeight;
      this._designWidth = designWidth;
      this.scale = 1.0;
      this._currentRoom = null;
      this._selected = { obj: null };
      this._revision = 0;


      fabricCanvas.on('object:selected', options => {
         // console.log('Selected:', options, options.target);
         this.selectedObject = options.target;
      });

      fabricCanvas.on('before:selection:cleared', options => {
         // console.log('Deselected:', options);
         this.selectedObject = null;
      });

      // The attributes stored in design objects.  Their order is important for
      // scale computations of images ('imageScale' has to succeed 'scaleX').
      this._designAttributes = ['originX', 'originY', 'scaleX', 'scaleY',
                                'imageScale', 'flipX', 'flipY', 'angle', 'left',
                                'top', 'radius', 'height', 'width', 'rx',
                                'ry' ];
      this._designUpdateEnabled = true;

      document.defaultView.addEventListener('resize', () => {
         this.invalidateLayout();
      });

      domReady(() => setTimeout(() => {
         this.invalidateLayout();
      }, 0));
   }

   revision () {
      return this._revision;
   }

   get selectedObject () {
      // console.log('Getting selected object', this._selected.obj);
      return this._selected.obj;
   }

   set selectedObject (newValue) {
      // console.log('Setting selected object', newValue);
      this._selected.obj = newValue;
      this.emit('selection-changed');
   }

   updateDesignHandler (options) {
      if (options && options.target) {
         this.setDesignFromCurrent(options.target);
      } else {
         // console.log('Modified unknown object:', options);
      }
   }

   setDesignFromCurrent (object) {
      // console.log('Setting design from current data', object.type);

      function updateValue (oldValue, newValue) {
         if (oldValue === undefined || oldValue === null) {
            return true
         } else if (typeof newValue === 'number') {
            return !isNaN(newValue) &&
                   Math.abs(oldValue - newValue) > MIN_CHANGE;
         } else {
            return oldValue !== newValue;
         }
      }

      if (this._designUpdateEnabled) {
         if (object.type === 'group') {
            _.forEach(object.objects, obj => {
               this.setDesignFromCurrent(obj);
            });
         } else {
            var scale = this.scale;
            var design = object.design = _.clone(object.design) || {};

            // console.log('setDesignFromCurrent()', object, scale);
            _.forEach(this._designAttributes, (key) => {
               // console.log('Data:', key, 'design', design[key], 'object',
               //             object[key], 'scale', scale);
               var oldValue = design[key];
               var newValue;
               switch (key) {
                  case 'left':
                  case 'top':
                  case 'radius':
                  case 'height':
                  case 'width':
                  case 'rx':
                  case 'ry':
                     newValue = object.get(key) / scale;
                     break;
                  case 'imageScale':
                     newValue = 1;
                     break;
                  default:
                     newValue = object.get(key);
               }
               // console.log('Data (after computation):', key, oldValue, newValue);
               if (updateValue(oldValue, newValue)) {
                  // console.log(`Changing ${key} from ${oldValue} to ${newValue}`);
                  design[key] = newValue;
               }
            });
         }
      }
   }

   newObject (cont, kind = Node) {
      var obj = new kind(this.scale);
      // This is to make sure that inconsistent values in the design are updated
      // before the object is passed to the application (e.g., rx != ry for
      // rectangles).
      this.setDesignFromCurrent(obj);
      cont(obj);
   }

   setObjectCurrentFromDesign (object) {
      // console.log('Setting current data from design:', object.type);
      var scale = this.scale;
      var design = object.design;
      _.forEach(this._designAttributes, (key) => {
         var oldValue = object[key];
         var newValue;
         switch (key) {
            case 'left':
            case 'top':
            case 'radius':
            case 'height':
            case 'width':
            case 'rx':
            case 'ry':
               newValue = design[key] * scale;
               break;
            case 'scaleX':
            case 'scaleY':
               if (object.type === 'path-group') {
                  newValue = design[key];
               } else {
                  newValue = object[key];
               }
               break;
            default:
               newValue = design[key];
         }
         if (newValue !== undefined && (oldValue === undefined ||
                                        Math.abs(oldValue - newValue) >
                                        MIN_CHANGE)) {
            // console.log(`Changing ${key} from ${oldValue} to ${newValue}`);
            object.set(key, newValue);
         }
      });
      if (object.type === 'path-group') {
         object.scale(scale * (design.imageScale || 1));
         // object.setCoords();
      }
   }


   setRoomCurrentFromDesign (room = this._currentRoom) {
      var objects = room.objects;
      // console.log('resizeCanvas(): updating objects', objects);
      for (var i = 0, len = objects.length; i < len; i++) {
         this.setObjectCurrentFromDesign(objects[i]);
      }
   }

   newNode (cont, parameters = {}) {
      this.newObject(cont, Node);
   }

   newDoor (cont) {
      this.newObject(cont, Door);
   }

   newRadiationSource (cont) {
      this.newObject(cont, RadiationSource);
   }


   deactivateSelection () {
      var fabricCanvas = this._fabricCanvas;

      var activeGroup = fabricCanvas.getActiveGroup();
      var activeObject = fabricCanvas.getActiveObject();
      fabricCanvas.discardActiveGroup();
      fabricCanvas.discardActiveObject();
      if (activeGroup) {
         this.setDesignFromCurrent(activeGroup);
      }
      if (activeObject) {
         this.setDesignFromCurrent(activeObject);
      }
   }

   drawRoom (room = this._currentRoom) {
      // console.log('drawContents called');
      this._currentRoom = room;
      if (!room) return;

      var canvas = this._mainCanvas;
      // Clear the canvas
      //noinspection SillyAssignmentJS
      canvas.width = canvas.width;
      // this._jsonDiv.width = canvas.width;

      var fabricCanvas = this._fabricCanvas;
      if (fabricCanvas) {
         fabricCanvas.deactivateAll();
         fabricCanvas.clear();
         for (var i = 0, len = room.objects.length; i < len; i++) {
            fabricCanvas.add(room.objects[i]);
         }
         fabricCanvas.renderAll();
      }
   }

   computeMaxDimensions (canvas = this._mainCanvas) {
      canvas = $(canvas);  // Huh? Why do we pass canvas as parameter then? --tc
      var roomList = $('#room-list');

      if (roomList.length > 0) {
         var offsetLeft = roomList.offset().left + roomList.outerWidth(true);
         var offsetTop = roomList.offset().top;
      } else {
         offsetLeft = 0;
         offsetTop = canvas.offset().top;
      }

      var inspector = $('#inspector');
      var inspectorWidth = inspector.outerWidth(true) || 0;

      var additionalOffset = canvas.outerWidth(true) - canvas.outerWidth();
      var viewport = $(document.defaultView);

      // console.log('dimensions:', viewport.width(), offsetLeft, inspectorWidth,
      //             additionalOffset);

      return {
         top:  offsetTop,
         left: offsetLeft,
         height: viewport.height() - offsetTop - 10,
         width: viewport.width() - offsetLeft - inspectorWidth -
                additionalOffset
      }
   }

   computeScaledDimensions (canvas = this._mainCanvas) {
      canvas = $(canvas);  // See above --tc

      var maxDimensions = this.computeMaxDimensions(canvas);
      var designHeight = this._designHeight;
      var designWidth = this._designWidth;

      var scaleHeight = maxDimensions.height / designHeight;
      var scaleWidth = maxDimensions.width / designWidth;
      var scale = Math.min(scaleWidth, scaleHeight);

      return {
         scale:     scale,
         designScale: scaleHeight / this._designHeight,
         maxHeight: maxDimensions.height,
         canvasCss: {
            position: 'absolute',
            top:      maxDimensions.top,
            left:     maxDimensions.left,
            height: designHeight * scale,
            width: designWidth * scale
         }
      }
   }

   resizeCanvas () {
      if (this._mainCanvas) {
         var mainCanvas = this._mainCanvas;
         var dimensions = this.computeScaledDimensions(mainCanvas);
         var css = dimensions.canvasCss;
         var scale = dimensions.scale;

         // console.log('resizing canvas', dimensions.height, dimensions.width);

         this.scale = scale;

         // console.log('Discarding active group and object');
         this.deactivateSelection();
         this._designUpdateEnabled = false;

         // Set the dimensions of the main drawing area and position it absolutely.
         mainCanvas.height = css.height;
         mainCanvas.width = css.width;

         var $containerDiv = $(this._containerDiv);
         var $mainCanvas = $(mainCanvas);
         $containerDiv.css(css);

         // Children of the main canvas have to positioned relative to the
         // canvas, not the page...
         css.left = 0;
         css.top = 0;
         $mainCanvas.css(css);

         var fabricCanvas = this._fabricCanvas;
         fabricCanvas.setDimensions(css);

         if (this._currentRoom) {
            this.setRoomCurrentFromDesign();
         }
         // Adjust the inspector and room list as well.
         $('#room-list').height(dimensions.maxHeight);
         $('#inspector').height(dimensions.maxHeight);

         this._designUpdateEnabled = true;
         this._revision++;
         this.emit('canvas-resized');
      }
   }

   invalidateLayout () {
      // console.log('invalidateLayout()')
      setTimeout(() => {
         this.resizeCanvas();
         setTimeout(() => this.drawRoom());
      })
   }
}

app.service('DrawingService', DrawingService);

export default DrawingService;
