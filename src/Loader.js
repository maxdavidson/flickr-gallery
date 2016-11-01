import React from 'react';
import Spinner from 'react-spinner';
import './Loader.css';

export default function Loader() {
  return (
    <div className="loader">
      <Spinner />
    </div>
  );
}
