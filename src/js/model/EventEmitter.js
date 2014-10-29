/**
 * Created by tc on 6/Mar/2014.
 */

// A subset of the node.js EventEmitter class.

import _ from 'lodash';

export class EventEmitter {
   constructor () {
      this._eventListeners = {};
   }

   addListener (event, listener) {
      if (event !== null && event !== undefined) {
         // console.log('addListener', this);
         var listeners = this._eventListeners[event];
         if (listeners === undefined) {
            this._eventListeners[event] = listeners = [];
         }
         listeners.push(listener);
         // console.log('Added listener:', listeners);
      }
      return this;
   }

   on (event, listener) {
      this.addListener(event, listener);
   }

   removeListener (event, listener) {
      // console.log('removeListener', event, listener, this);
      if (event !== null && event !== undefined) {
         var listeners = this._eventListeners[event];
         if (listeners) {
            this._eventListeners[event] = _.remove(listeners, listener);
            // console.log('Removed listener', listeners);
         }
      }
      return this;
   }

   emit (event, ...args) {
      if (event !== null && event !== undefined) {
         var listeners = this._eventListeners[event] || [];
         // console.log('Emitting', event);
         _(listeners).forEach(listener => {
            // console.log('Calling listener', listener);
            listener(...args);
         });
         return !_.isEmpty(listeners);
      } else {
         return false;
      }
   }
}

export default EventEmitter;
