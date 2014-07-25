/**
 * Created by tc on 25/Jul/2014.
 */


import {Node, mergeDefaults, nodeDefaults} from 'Node';

var victimId = 1;

export var Victim = fabric.util.createClass(Node, {
   initialize: function (scale, options = {}) {
      options = mergeDefaults(options, nodeDefaults(scale, 'black', 10));
      this.callSuper('initialize', scale, options);
      this.value = 1;
      this.class = 'Victim';
      this.victimId = `v${victimId++}`;
      this.objects = () => [
         {class: 'victim', id: this.victimId, reward: this.value}
      ];
   }
});

Object.defineProperty(Victim.prototype, 'objectType', { get: () => {
   return 'victim';
} });
