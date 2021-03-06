/**
 * Created by tc on 17/Mar/2014.
 */

import {Node, mergeDefaults, nodeDefaults} from 'Node';


export var RadiationSource = fabric.util.createClass(Node, {
   initialize: function (scale, options = {}) {
      options = mergeDefaults(options, nodeDefaults(scale, 'red', 15));
      this.callSuper('initialize', scale, options);
      this.strength = 100;
      this.class = 'RadiationSource'
   }
});

Object.defineProperty(RadiationSource.prototype, 'objectType', { get: () => {
                         return 'radiation';
                      } });
