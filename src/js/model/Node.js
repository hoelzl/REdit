/**
 * Created by tc on 17/Mar/2014.
 */

module fabric from 'fabric';
module jQuery from 'jquery';


export function mergeDefaults (parameters, defaults) {
   var result = {};
   jQuery.extend(result, defaults);
   return jQuery.extend(result, parameters);
}

function generateDesign (parameters) {
   var result = {};
   for (var key in parameters) {
      var value = parameters[key];
      if (value[0] >= 0) {
         result[key] = value[0] * Math.random() + value[1];
      } else {
         value[0] = -value[0];
         result[key] = Math.random() > 0.5 ?
            value[0] * Math.random() + value[1] : 0;
      }
   }
   return result;
}

export function nodeDefaults (scale, color = 'green', radius = 10) {
   var design = generateDesign({
                                  radius: [0, radius],
                                  top:    [900, 0],
                                  left:   [1500, 0]
                               });
   design.top += design.radius;
   design.left += design.radius;

   return {
      design:      design,
      radius:      design.radius,
      top: design.top * scale,
      left: design.left * scale,
      hasControls: false,
      fill:        color
   };
}

export var Node = fabric.util.createClass(fabric.Circle, {
   initialize: function (scale, options = {}) {
      options = mergeDefaults(options, nodeDefaults(scale));
      this.callSuper('initialize', options);
      this.class = 'Node';
   }
});

Object.defineProperty(Node.prototype, 'objectType', { get: () => {
   return 'node'
}});

