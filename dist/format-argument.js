"use strict";
'use strict';
module.exports = function formatArgument(value) {
  switch (typeof value) {
    case 'number':
      return value.toString();
    case 'string':
      return '"' + value.replace(/"/g, '""') + '"';
    case 'boolean':
      return value ? formatArgument(1) : formatArgument(0);
    default:
      return formatArgument(value.toString());
  }
};
//# sourceMappingURL=format-argument.js.map
