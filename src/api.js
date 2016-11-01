import * as url from 'url';
import { jsonp, createUniqueCallbackName, urlKeys, getSizes } from './utils';

const API_HOST = url.parse(process.env.REACT_APP_FLICKR_HOST || 'https://api.flickr.com/services/rest/');
const API_KEY = process.env.REACT_APP_FLICKR_API_KEY;
const SUPPORTS_CORS = (typeof XMLHttpRequest === 'function') && ('withCredentials' in XMLHttpRequest.prototype);

if (API_KEY === undefined) {
  console.warn('No Flickr API key specified! Requests will not work!');
}

// Call Flickr's API
export const flickr = SUPPORTS_CORS ? flickrFetch : flickrJsonp;

// Search photos using Flickr's API
export async function searchPhotos(text, params) {
  const data = await flickr('flickr.photos.search', Object.assign({
    text,
    sort: 'relevance',
    safe_search: 1,
    extras: urlKeys.join(',')
  }, params));

  return Object.assign({}, data.photos, {
    photo: data.photos.photo.map(photo => Object.assign({}, photo, {
      sizes: getSizes(photo)
    }))
  });
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
  const url = createFlickrUrl(method, Object.assign({}, params, { jsoncallback }));
  const json = await jsonp(url, jsoncallback);
  checkFlickrJson(json);
  return json;
}

// Check the status of Flickr's JSON response
function checkFlickrJson(data) {
  if (data.stat !== 'ok') {
    throw new Error(`Flickr error ${data.code}: ${data.message}`);
  }
}

function createFlickrUrl(method, params = {}) {
  return url.format(Object.assign({}, API_HOST, {
    query: Object.assign({
      method,
      format: 'json',
      api_key: API_KEY,
      nojsoncallback: (params.jsoncallback === undefined) ? 1 : undefined
    }, params)
  }));
}
