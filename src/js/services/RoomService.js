/**
 * Created by tc on 6/Mar/2014.
 */

module _ from 'lodash';
module angular from 'angular';
import {app} from 'app';
import Room from 'Room';


export class RoomService {
   constructor ($sce) {
      // console.log('Creating new RoomService:', $sce);
      this._rooms = [];
      this._revision = 0;
      this.$sce = $sce;
      var service = this;

      this._current = {
         _room:          null,
         _dirtyListener: () => service.dirty(),

         get room () {
            return this._room;
         },

         set room (newRoom) {
            var oldRoom = this._room;
            if (oldRoom) {
               oldRoom.removeListener('dirty', this._dirtyListener);
            }
            this._room = newRoom;
            if (newRoom) {
               newRoom.on('dirty', this._dirtyListener);
            }
            service.dirty();
         }
      };
   }

   get rooms () {
      return this._rooms;
   }

   set rooms (newValue) {
      this._rooms = newValue;
      this.dirty();
   }

   get current () {
      return this._current;
   }

   dirty () {
      // console.log('dirty()', this.current.room);
      this._revision++;
   }

   get (start, count, callback) {
      var array = this._rooms.slice(start, start + count - 1);
      callback(array);
   }

   revision () {
      return this._revision;
   }

   findRoomIndex (room) {
      return _.indexOf(this.rooms, room);
   }

   insertAfterRoom (originalRoom, newRoom) {
      var rooms = this.rooms;
      if (newRoom) {
         if (originalRoom) {
            rooms.splice(_.indexOf(rooms, originalRoom) + 1, 0, newRoom);
         } else {
            rooms.push(newRoom);
         }
         this.current.room = newRoom;
      } else {
         throw(Error('Trying to insert null as room.'));
      }
   }

   generateJson () {
      var room = this.current();
      return room.toJson();
   }

   newRoom () {
      var newRoom = new Room();
      newRoom.textSanitizor = this.$sce.trustAsHtml;
      this.insertAfterRoom(this.current.room, newRoom);
      return newRoom;
   }

   duplicateRoom (postCallback) {
      var originalRoom = this.current.room;
      var newRoom;
      if (originalRoom) {
         newRoom = originalRoom.duplicate(postCallback);
      } else {
         newRoom = new Room('Failed duplicate attempt');
      }
      this.insertAfterRoom(originalRoom, newRoom);
      return newRoom;
   }

   deleteRoom () {
      var deletedRoom = this.current.room;
      if (deletedRoom) {
         var roomIndex = this.findRoomIndex(deletedRoom);
         var rooms = this.rooms;
         if (roomIndex >= 0) {
            rooms.splice(roomIndex, 1);
            if (roomIndex >= rooms.length) {
               if (rooms.length > 0) {
                  this.current.room = rooms[rooms.length - 1];
               } else {
                  this.current.room = null;
               }
            } else {
               this.current.room = rooms[roomIndex];
            }
            this.dirty();
         } else {
            console.log('Trying to delete non-existent room.')
         }
      }
      return deletedRoom;
   }

   addObject (object, room) {
      if (room) {
         room.addObject(object);
         room.dirty();
      }
   }
}

app.service('RoomService', RoomService);

export default RoomService;
