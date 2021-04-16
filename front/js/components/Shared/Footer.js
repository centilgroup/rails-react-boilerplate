import React from 'react';

const Footer = () => {
  const style = {
    position: 'fixed',
    bottom: 0,
    width: '100%',
    backgroundColor: '#fff',
    fontSize: 'initial',
    borderTop: '1px solid rgba(0, 0, 0, 0.1)',
  };

  return (
    <div style={style}>
      <div className="m-3">Centil, LLC 2021.</div>
    </div>
  );
};

export default Footer;
