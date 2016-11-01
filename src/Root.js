import React from 'react';
import { BrowserRouter as Router, Match, Miss, Link, Redirect } from 'react-router';
import { ResizableBox } from 'react-resizable';
import FlickrGallery from './FlickrGallery';
import 'react-resizable/css/styles.css';

export default function Root() {
  return (
    <Router>
      <span>
        <Match exactly pattern="/" component={Home} />
        <Match pattern="/fullscreen" component={FullscreenDemo} />
        <Match pattern="/widgets" component={WidgetsDemo} />
        <Miss component={NoMatch} />
      </span>
    </Router>
  );
}

function Home() {
  return (
    <span>
      <h2>React Gallery demos</h2>
      <ul>
        <li><Link to="/fullscreen">Full screen</Link></li>
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
