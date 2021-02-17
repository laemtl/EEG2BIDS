import React from 'react';
import PropTypes from 'prop-types';

/**
 * Welcome - the welcome component.
 * @param {object} props
 * @return {JSX.Element}
 */
const Welcome = (props) => {
  return props.visible ? (
    <>
      <div style={{
        fontSize: '20pt',
        textAlign: 'center',
        verticalAlign: 'middle',
        cursor: 'default',
        padding: '20px 20px 0 20px',
        backgroundColor: '#039b83',
      }}>
        Welcome to pyCat!
      </div>
      <div style={{backgroundColor: '#039b83', padding: '10px'}}>
        <p style={{fontSize: '16pt'}}>Hello user,</p>
        <p><b>pyCat</b> is a simple tool for de-identification of iEEG datasets.
          In addition to de-identifying iEEG files, this tool contains a feature
          that allows mapping the candidate's information to its
          study identifier.
        </p>
        <p>
          <b>The de-identifier tab allows to:</b>
        </p>
        <p>
          <b>The iEEG Converter tab allows to:</b>
        </p>
        <p>
          <b>The Validator tab allows to:</b>
        </p>
        <br/>
        <p>
          You may begin your task by following the menu above.
          Please remember to always backup your data!
        </p>
      </div>
    </>
  ) : null;
};
Welcome.propTypes = {
  visible: PropTypes.bool,
};

export default Welcome;
