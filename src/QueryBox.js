import React, { PropTypes } from 'react';
import './QueryBox.css';

const { string, func } = PropTypes;

export default function QueryBox({ query, placeholder, onChange }) {
  return (
    <div className="query-box">
      <input
        type="text"
        value={query}
        placeholder={placeholder}
        onChange={onChange} />
    </div>
  );
}

QueryBox.propTypes = {
  query: string.isRequired,
  onChange: func.isRequired,
  placeholder: string
};
