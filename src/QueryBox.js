import React from 'react';
import { string, func } from 'prop-types';
import './QueryBox.css';

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
