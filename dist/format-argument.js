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
      if (value && typeof value.toPraatCode === 'function')
        return value.toPraatCode().toString();
      else
        return formatArgument(value.toString());
  }
};
//# sourceMappingURL=format-argument.js.map
