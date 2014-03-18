/**
 * Created by tc on 17/Mar/2014.
 */

import {Node, mergeDefaults, nodeDefaults} from 'Node';


export var Door = fabric.util.createClass(Node, {
   initialize: function (scale, options = {}) {
      options = mergeDefaults(options, nodeDefaults(scale, 'blue'));
      this.callSuper('initialize', scale, options);
   }
});

Object.defineProperty(Door.prototype, 'objectType', { get: () => {
   return 'door'
}});
