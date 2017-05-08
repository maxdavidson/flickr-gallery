import React, { PureComponent } from 'react';
import { string, number, bool, func, shape, arrayOf } from 'prop-types';
import createResizeDetector from 'element-resize-detector';
import debounce from 'lodash.debounce';
import { PhotoSwipeGallery } from 'react-photoswipe';
import Loader from './Loader';
import { computeLayout, getBestSize } from './utils';
import './ImageGallery.css';

const FlickPhoto = shape({
  id: string.isRequired,
  title: string.isRequired,
  sizes: arrayOf(shape({
    source: string.isRequired,
    width: number.isRequired,
    height: number.isRequired
  })).isRequired
});

const photoSwipeOptions = {
  bgOpacity: 0.8,
  history: false,
  modal: true
};

const resizeDetector = createResizeDetector({ strategy: 'scroll' });

export default class FlickrGallery extends PureComponent {
  static propTypes = {
    photos: arrayOf(FlickPhoto).isRequired,
    rowHeight: number,
    loading: bool,
    done: bool,
    threshold: number,
    onLoad: func,
    onScroll: func
  };

  static defaultProps = {
    rowHeight: 180,
    loading: false,
    done: false,
    threshold: 360,
    onLoad() { },
    onScroll() { }
  };

  state = {
    // We don't know the scroll width until we've rendered at least once...
    scrollWidth: Infinity
  };

  handleScroll = debounce(() => {
    this.props.onScroll(this.imageGallery);
    this.checkScrollPosition();
  }, 25);

  handleResize = debounce(({ scrollWidth }) => {
    this.setState({  scrollWidth });
  }, 250);

  checkScrollPosition = () => {
    const { clientHeight, scrollTop, scrollHeight } = this.imageGalleryRef;
    const { onLoad, loading, done, threshold } = this.props;

    const hasMore = !loading && !done;

    if (hasMore && (scrollHeight < scrollTop + clientHeight + threshold)) {
      onLoad();
    }
  }

  storeRef = ref => {
    this.imageGalleryRef = ref;
  };

  componentDidMount() {
    resizeDetector.listenTo(this.imageGalleryRef, this.handleResize);
    this.checkScrollPosition();
  }

  componentDidUpdate() {
    this.checkScrollPosition();
  }

  componentWillUnmount() {
    resizeDetector.removeListener(this.imageGalleryRef, this.handleResize);
  }

  render() {
    const { photos, loading, rowHeight } = this.props;
    const { scrollWidth } = this.state;

    const rowDimensions = { width: scrollWidth, height: rowHeight };

    const thumbnails = computeLayout(
      photos.map(photo => getBestSize(photo.sizes, rowDimensions)),
      scrollWidth, rowHeight
    );

    const windowViewport = {
      width: window.clientWidth,
      height: window.clientHeight
    };

    const items = photos.map(({ title, sizes }, i) => {
      const bestSize = getBestSize(sizes, windowViewport);
      const thumbnail = thumbnails[i];
      return {
        title,
        src: bestSize.source,
        w: bestSize.width,
        h: bestSize.height,
        thumbnail: (
          <img
            alt={title}
            src={thumbnail.source}
            width={thumbnail.width}
            height={thumbnail.height} />
        )
      };
    });

    return (
      <div className="image-gallery" ref={this.storeRef} onScroll={this.handleScroll}>
        <PhotoSwipeGallery
          items={items}
          options={photoSwipeOptions}
          thumbnailContent={item => item.thumbnail} />
        {loading && <Loader />}
      </div>
    );
  }
}
