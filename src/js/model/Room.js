/**
 * Created by tc on 4/Mar/2014.
 */

import EventEmitter from 'EventEmitter';

var currentId = 1;

export class Room extends EventEmitter {
   constructor (title = `Room ${currentId}`, objects = []) {
      super();
      this.title = title;
      this.objects = objects;
      this.id = currentId++;
   }

   toObject () {
      return { //
         title:     this.title,
         objects:   _.map(this.objects, obj => obj.toObject(['design'])),
         id:        this.id
      }
   }

   toJson () {
      return JSON.stringify(this.toObject());
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
