import React, { PureComponent } from 'react';
import debounce from 'lodash.debounce';
import QueryBox from './QueryBox';
import ImageGallery from './ImageGallery';
import { createCompleter, CancellationError } from './utils';
import * as API from './api';
import './FlickrGallery.css';

export default class FlickrGallery extends PureComponent {
  state = {
    query: '',
    photos: [],
    loading: false,
    done: true,
    online: navigator.onLine
  };

  currentQuery = null;
  currentStream = null;
  currentRequest = null;
  currentCanceler = null;

  fetchPhotos = debounce(async () => {
    const { query } = this.state;

    // If invalid query, stop
    if (query === '') {
      this.setState({ photos: [], done: true });
      return;
    }

    // If not same query, cancel existing requests if they exist
    if (query === this.currentQuery) {
      if (this.currentRequest !== null) {
        return this.currentRequest;
      }
    } else {
      // Cancel current request
      if (this.currentCanceler !== null) {
        this.currentCanceler.reject(new CancellationError())
        this.currentCanceler = null;
        this.currentRequest = null;
      }

      this.currentQuery = null;
      this.currentStream = null;
    }

    // Start stream if it does not exist
    if (this.currentStream === null) {
      this.currentQuery = query;
      this.currentStream = API.streamPhotos(query);
      this.setState({ photos: [], done: false });
    }

    this.setState({ loading: true });

    // Start the request, and store a canceler
    this.currentCanceler = createCompleter();

    this.currentRequest = Promise.race([
      this.currentStream.next(),
      this.currentCanceler.promise,
    ]);

    // Fetch the next request
    let done, value;
    try {
      ({ done, value } = await this.currentRequest);
      if (done) {
        this.currentStream = null;
        this.currentQuery = null;
      } else {
        this.setState(prevState => ({
          photos: prevState.photos.concat(value),
        }));
      }
    } catch (error) {
      if (!(error instanceof CancellationError)) {
        console.error(error);
      }
    } finally {
      this.setState({ done, loading: false });
      this.currentRequest = null;
    }
  }, 500);

  handleInputChange = e => {
    const query = e.target.value;
    this.setState({ query }, this.fetchPhotos);
  };

  dismissError = error => {
    this.setState({ error: null });
  };

  updateOnlineStatus = () => {
    this.setState({ online: navigator.onLine });
  };

  storeRef = ref => {
    this.flickrGalleryRef = ref;
  };

  componentDidMount() {
    window.addEventListener('online', this.updateOnlineStatus, false);
    window.addEventListener('offline', this.updateOnlineStatus, false);
  }

  componentWillUnmount() {
    window.removeEventListener('online', this.updateOnlineStatus);
    window.removeEventListener('offline', this.updateOnlineStatus);
    if (this.currentCanceler !== null) {
      this.currentCanceler.reject(new CancellationError());
    }
  }

  render() {
    const { photos, query, loading, online, done } = this.state;

    return (
      <div className="flickr-gallery" ref={this.storeRef}>
        <QueryBox
          query={query}
          placeholder="search flickr"
          onChange={this.handleInputChange} />
        <ImageGallery
          photos={photos}
          loading={loading || (!done && !online)}
          done={done}
          onLoad={this.fetchPhotos} />
      </div>
    );
  }
}
