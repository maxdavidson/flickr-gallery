import load from 'little-loader';

const pixelRatio = window.devicePixelRatio || 1;

export function getViewport() {
  return {
    width: document.documentElement.clientWidth,
    height: document.documentElement.clientHeight
  };
}

export function sizeComparator(a, b) {
  return a.width * a.height - b.width * b.height;
}

export function getBestSize(candidateSizes, limitingSize) {
  const sortedSizes = candidateSizes.slice().sort(sizeComparator);
  let size;
  for (let i = 0, len = sortedSizes.length; i < len; ++i) {
    size = sortedSizes[i];
    if (size.width > limitingSize.width * pixelRatio || size.height > limitingSize.height * pixelRatio) {
      break;
    }
  }
  return size;
}

function resizeToHeight(item, desiredHeight) {
  return Object.assign({}, item, {
    width: desiredHeight * item.width / item.height,
    height: desiredHeight
  });
}

export function computeLayout(items, rowWidth, minRowHeight) {
  const maxRatio = rowWidth / minRowHeight;
  const scaledItems = [];
  let rowItems = [];
  let rowRatio = 0;

  items.forEach(item => {
    const nextRatio = rowRatio + item.width / item.height;
    if (nextRatio < maxRatio || rowItems.length === 0) {
      rowItems.push(item);
      rowRatio = nextRatio;
    } else {
      scaledItems.push(...rowItems.map(item => resizeToHeight(item, rowWidth / rowRatio)));
      rowItems = [item];
      rowRatio = item.width / item.height;
    }
  });

  scaledItems.push(...rowItems.map(item => resizeToHeight(item, minRowHeight)));

  return scaledItems;
}

let counter = 0;
export function createUniqueCallbackName() {
  return `callback${counter++}`;
}

export async function jsonp(url, callbackName = createUniqueCallbackName()) {
  let scriptElement;
  try {
    return await new Promise((resolve, reject) => {
      window[callbackName] = resolve;
      load(url, {
        callback: reject,
        setup(script) {
          scriptElement = script;
        }
      });
    });
  } finally {
    delete window[callbackName];
    if (scriptElement) {
      scriptElement.remove();
    }
  }
}

// Possible URL keys
export const urlKeys = ['url_t', 'url_n', 'url_m', 'url_z', 'url_c', 'url_l', 'url_o'];

export function getSizes(photo) {
  return urlKeys
    .filter(urlKey => urlKey in photo)
    .map(urlKey => {
      const suffix = urlKey.slice(urlKey.lastIndexOf('_') + 1);
      return {
        source: photo[urlKey],
        width: Number(photo[`width_${suffix}`]),
        height: Number(photo[`height_${suffix}`])
      }
    })
    .sort(sizeComparator)
}

// Hack to enable extension of Error with Babel, using ES5-style "class" wrapper
export const ExtendableError = (() => {
  function ExtendableError(message) {
    Error.call(this, message);
    this.name = this.constructor.name;
    this.message = message;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = (new Error(message)).stack;
    }
  }

  ExtendableError.prototype = Object.create(Error.prototype);
  ExtendableError.prototype.constructor = ExtendableError;

  return ExtendableError;
})();


export class CancellationError extends ExtendableError {
  constructor() {
    super('Promise was canceled');
    this.isCanceled = true;
  }
}

/**
 * Creates an object containing a promise and methods to resolve or reject it.
 * Similar to C++11's `std::promise` (http://en.cppreference.com/w/cpp/thread/promise),
 * or Dart's `Completer` (https://api.dartlang.org/stable/dart-async/Completer-class.html)
 */
export function createCompleter() {
  let resolve, reject;

  // This works because the promise executor is executed immediately
  const promise = new Promise((resolve2, reject2) => {
    resolve = resolve2;
    reject = reject2;
  });

  return { promise, resolve, reject };
}
