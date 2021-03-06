import React from 'react';
import { createHashHistory } from 'history';
import { Router, Switch, Route, Link, Redirect } from 'react-router-dom';
import { ResizableBox } from 'react-resizable';
import ReactGA from 'react-ga';
import FlickrGallery from './FlickrGallery';
import 'react-resizable/css/styles.css';

const history = createHashHistory();

if (process.env.NODE_ENV === 'production') {
  const trackingID = process.env.REACT_APP_UA_TRACKING_ID;
  if (typeof trackingID === 'string') {
    ReactGA.initialize(trackingID);
    history.listen((location, action) => {
      if (action === 'PUSH') {
        ReactGA.pageview(location.pathname);
      }
    });
  }
}

export default function Root() {
  return (
    <Router history={history}>
      <Switch>
        <Route path="/" exact component={Home} />
        <Route path="/fullscreen" component={FullscreenDemo} />
        <Route path="/widgets" component={WidgetsDemo} />
        <Route component={NoMatch} />
      </Switch>
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
