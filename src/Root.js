import React from 'react';
import { HashRouter as Router, Match, Miss, Link, Redirect } from 'react-router';
import { ResizableBox } from 'react-resizable';
import ReactGA from 'react-ga';
import FlickrGallery from './FlickrGallery';
import 'react-resizable/css/styles.css';

if (process.env.NODE_ENV === 'production') {
  const trackingID = process.env.REACT_APP_UA_TRACKING_ID;
  if (typeof trackingID === 'string') {
    ReactGA.initialize(trackingID);
  }
}

export default function Root() {
  return (
    <Router>
      {({ action, location }) => {
        if (action === 'PUSH') {
          ReactGA.pageview(location.pathname);
        }
        return (
          <span>
            <Match pattern="/" exactly component={Home} />
            <Match pattern="/fullscreen" component={FullscreenDemo} />
            <Match pattern="/widgets" component={WidgetsDemo} />
            <Miss component={NoMatch} />
          </span>
        );
      }}
    </Router>
  );
}

function Home() {
  return (
    <span>
      <h2>flickr-gallery demos</h2>
      <ul>
        <li><Link to="/fullscreen">Fullscreen</Link></li>
        <li><Link to="/widgets">Resizable widgets</Link></li>
      </ul>
    </span>
  );
}

function NoMatch() {
  return (
    <Redirect to="/" />
  );
}

function FullscreenDemo() {
  return (
    <FlickrGallery />
  );
}

function WidgetsDemo() {
  return (
    <div>
      <ResizableBox width={480} height={320}>
        <FlickrGallery />
      </ResizableBox>
      <ResizableBox width={640} height={320}>
        <FlickrGallery />
      </ResizableBox>
    </div>
  );
}
