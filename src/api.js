import * as url from 'url';
import { jsonp, createUniqueCallbackName, urlKeys, getSizes } from './utils';

const API_HOST = url.parse(process.env.REACT_APP_FLICKR_HOST || 'https://api.flickr.com/services/rest/');
const API_KEY = process.env.REACT_APP_FLICKR_API_KEY;

if (API_KEY === undefined) {
  console.warn('No Flickr API key specified! Requests will not work!');
}

// Call Flickr's API
export const flickr = (() => {
  // IE9 and CORS
  if (typeof XDomainRequest === 'function' && location.protocol === API_HOST.protocol) {
    return flickrXHR;
  }

  // Other browsers and CORS
  if (typeof XMLHttpRequest === 'function' && 'withCredentials' in XMLHttpRequest.prototype) {
    return flickrFetch;
  }

  // JSONP fallback
  return flickrJsonp;
})();

// Search photos using Flickr's API
export async function searchPhotos(text, params) {
  const data = await flickr('flickr.photos.search', {
    text,
    sort: 'relevance',
    safe_search: 1,
    extras: urlKeys.join(','),
    ...params
  });

  return {
    ...data.photos,
    photo: data.photos.photo.map(photo => ({
      ...photo,
      sizes: getSizes(photo)
    }))
  };
}

// Async iterator for pulling photos from Flickr's API
// Automatically fetches new pages when needed
export function streamPhotos(query, { pageSize = 10 } = {}) {
  let page = 0;
  let pages = 1;
  let photo = [];

  return {
    async next() {
      if (page >= pages) {
        return { done: true };
      }

      ({ page, pages, photo } = await searchPhotos(query, { page: page + 1, per_page: pageSize }));

      return { done: false, value: photo };
    }
  };
}

// Call Flickr's API using fetch
async function flickrFetch(method, params) {
  const url = createFlickrUrl(method, params);
  const response = await fetch(url);
  const json = await response.json();
  checkFlickrJson(json);
  return json;
}

// Call Flickr's API using jsonp
async function flickrJsonp(method, params) {
  const jsoncallback = createUniqueCallbackName();
  const url = createFlickrUrl(method, { ...params, jsoncallback });
  const json = await jsonp(url, jsoncallback);
  checkFlickrJson(json);
  return json;
}

// Call Flickr's API using XHR
function flickrXHR(method, params) {
  const url = createFlickrUrl(method, params);
  const XHR = window.XDomainRequest || window.XMLHttpRequest;
  return new Promise((resolve, reject) => {
    const xhr = new XHR();
    xhr.open('get', url);
    xhr.onload = () => {
      try {
        resolve(JSON.parse(xhr.responseText));
      } catch (e) {
        reject(e);
      }
    };
    xhr.onerror = event => {
      reject(event.error);
    }
    xhr.send(null);
  });
}

// Check the status of Flickr's JSON response
function checkFlickrJson(data) {
  if (data.stat !== 'ok') {
    throw new Error(`Flickr error ${data.code}: ${data.message}`);
  }
}

function createFlickrUrl(method, params = {}) {
  return url.format({
    ...API_HOST,
    query: {
      method,
      format: 'json',
      api_key: API_KEY,
      nojsoncallback: (params.jsoncallback === undefined) ? 1 : undefined,
      ...params
    }
  });
}
