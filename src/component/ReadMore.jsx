import React, { useState } from 'react';

const ReadMore = ({ text, maxLength = 100 }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Function to toggle text expansion
  const toggleReadMore = () => {
    setIsExpanded(!isExpanded);
  };

  // If the text is shorter than maxLength, no need to truncate
  if (text.length <= maxLength) {
    return <p className='text-sm'>{text}</p>;
  }

  return (
    <p className='text-sm'>
        {/* Show truncated text or full text based on state */}
      {isExpanded ? text : `${text.substring(0, maxLength)}...`}
      
      {/* Toggle between "Read more" and "Show less" */}
      <span
        onClick={toggleReadMore}
        className="text-blue-500 cursor-pointer ml-2"
      >
        {isExpanded ? 'Show less' : 'Read more'}
      </span>
    </p>
  );
};

export default ReadMore;
