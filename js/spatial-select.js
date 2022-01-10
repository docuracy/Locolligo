// Copyright 2019 Google LLC.
// SPDX-License-Identifier: Apache-2.0

// First, we need to define a "successor" function. This works for
// numbers, dates and strings, but not other key types - add as
// necessary.
function successor(key) {
  var MAX_DATE = 8640000000000000;
  if (typeof key === 'number') {
    if (key === -Infinity) return -Number.MAX_VALUE;
    if (key === Infinity) return new Date(-MAX_DATE);
    if (key === 0) return Number.MIN_VALUE;
    var epsilon = Math.abs(key);
    while (key + epsilon / 2 !== key)
      epsilon = epsilon / 2;
    return key + epsilon;
  }
  if (key instanceof Date) {
    var n = key.valueOf() + 1;
    return n <= new Date(n) ? MAX_DATE : '';
  }
  if (typeof key === 'string') {
    return key + '\x00';
  }
  throw TypeError('Unsupported key type: ' + key);
}

// Returns true if key is before range;
function before(key, range) {
  if (range && range.lower !== undefined) {
    var c = indexedDB.cmp(key, range.lower);
    if (range.lowerOpen && c <= 0) return true;
    if (!range.lowerOpen && c < 0) return true;
  }
  return false;
}

// Returns true if key is after range.
function after(key, range) {
  if (range && range.upper !== undefined) {
    var c = indexedDB.cmp(key, range.upper);
    if (range.upperOpen && c >= 0) return true;
    if (!range.upperOpen && c > 0) return true;
  }
  return false;
}

// Returns the lowest key in range.
function lowest(range) {
  if (!range || range.lower === undefined)
    return -Infinity;
  if (!range.lowerOpen)
    return range.lower;
  return successor(range.lower);
}

// And here's the N-dimensions selection function.
// * index is the IDBIndex with an array key path of length N
// * query is [dim, dim, ...] where dim is IDBKeyRange or null
// * valueCallback() will be called asynchronously with each value
// * completeCallback() will be called asynchronously when completed
function select(index, query, valueCallback, completeCallback) {
  var min = query.map(lowest);
  // max is harder to compute, so detect during iteration.
  index.openCursor(IDBKeyRange.lowerBound(min)).onsuccess = function(e) {
    var cursor = e.target.result;
    if (!cursor) {
      completeCallback();
      return;
    }

    for (var i = 0; i < query.length; ++i) {
      var key = cursor.key[i];
      var range = query[i];
      var bound;

      if (before(key, range)) {
        bound = range.lower;
        if (indexedDB.cmp(key, bound) === 0)
          cursor.continue();
        else
          cursor.continue(cursor.key.slice(0, i).concat([bound]));
        return;
      }

      if (after(key, range)) {
        if (i === 0) {
          completeCallback();
        } else {
          cursor.continue(cursor.key.slice(0, i)
                          .concat([successor(cursor.key[i])])
                          .concat([lowest(query[i + 1])]));
        }
        return;
      }
    }
    valueCallback(cursor.value);
    cursor.continue();
  };
}
