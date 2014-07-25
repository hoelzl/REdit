/**
 * Created by tc on 4/Mar/2014.
 */

import EventEmitter from 'EventEmitter';

var currentId = 1;

var dist = (p1, p2) => {
   var x1 = p1.x;
   var y1 = p1.y;
   var x2 = p2.x;
   var y2 = p2.y;
   var x = x1 - x2;
   var y = y1 - y2;
   return Math.sqrt(x*x + y*y);
};

var dist3 = (p1, p2, p3) => {
   var center = {x: (p1.x + p2.x)/2, y: (p1.y + p2.y)/2};
   return dist(center, p3);
};

export class Room extends EventEmitter {
   constructor (title = `Room ${currentId}`, objects = []) {
      super();
      this.title = title;
      this.objects = objects;
      this.id = currentId++;
      this.exportedSlots = ['design', 'objectType', 'strength', 'value', 'home', 'id'];
   }

   computeEdges (allNodes) {

      var edges = [];
      var objects = _.filter(allNodes, node => node.objectType !== 'radiation');
      var radiationSources = _.filter(allNodes, node => node.objectType === 'radiation');
      for (var i = 0; i < objects.length - 1; i++) {
         for (var j = i+1; j < objects.length; j++) {
            var p1 = objects[i], p2 = objects[j];
            var x1 = p1.x;
            var y1 = p1.y;
            var x2 = p2.x;
            var y2 = p2.y;
            var distance = dist(p1, p2) / 10;
            var cost = distance;
            for (var k = 0; k < radiationSources.length; k++) {
               var radiationDist = dist3(p1, p2, radiationSources[k]);
               console.log('radiationDist', radiationDist, cost);
               cost += 10000 * (radiationSources[k].strength || 1) / (radiationDist * radiationDist);
               console.log('new cost', cost);
            }
            edges.push({from: {x: x1, y: y1}, to: {x: x2, y: y2}, cost: cost, dist: distance});
            edges.push({from: {x: x2, y: y2}, to: {x: x1, y: y1}, cost: cost, dist: distance});
         }
      }
      return edges;
   }

   toObject () {
      return { //
         title:   this.title,
         objects: _.map(this.objects, obj => obj.toObject(this.exportedSlots)),
         id:      this.id
      }
   }

   toSimplifiedObject () {
      var objects = _.map(this.objects, obj => obj.toSimplifiedObject(this.exportedSlots));
      return {
         homes: _.filter(objects, obj => obj.home),
         nodes: _.filter(objects, obj => obj.objectType !== 'radiation'),
         edges: this.computeEdges(objects)
      }
   }

   toJson () {
      return JSON.stringify(this.toObject());
   }

   toSimplifiedJson () {
      return JSON.stringify(this.toSimplifiedObject());
   }

   static fromObject (obj) {
      var room = new Room(obj.title);
      room.id = obj.id;
      fabric.util.enlivenObjects(obj.objects, objs => {
         room.objects = objs;
      });
      return room;
   }

   static fromJson (json) {
      return Room.fromObject(JSON.parse(json));
   }

   dirty () {
      this.emit('dirty', this);
   }

   addObject (obj) {
      this.objects.push(obj);
   }

   duplicate (callback) {
      var objects = this.objects;
      // console.log('duplicate()', this, objects, objects.length);

      // Need to populate objects in this convoluted manner since #clone may be
      // async, and the result for async objects is undefined, whereas the
      // callback is not invoked for objects for which clone is synchronous.
      var clonedObjects = [];
      var newRoom = new Room(`Duplicate of ${this.title}`, clonedObjects);

      for (var i = 0, len = objects.length; i < len; i++) {
         var newObj = objects[i].clone(c => {
            // console.log('Cloned', c);
            clonedObjects.push(c);
            newRoom.dirty();
            if (callback) {
               callback();
            }
         }, ['design']);
         if (newObj) {
            clonedObjects.push(newObj);
         }
      }

      return  newRoom;
   }
}

export default Room;
