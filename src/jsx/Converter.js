import React, {useContext, useState} from 'react';

// Socket.io
import {Event, SocketContext} from './socket.io';

// Components
import {DirectoryInput, FileInput, TextInput} from './elements/inputs';
import PropTypes from 'prop-types';

/**
 * Converter - the iEEG to BIDS Converter component.
 * @param {object} props
 * @return {JSX.Element}
 */
const Converter = (props) => {
  // React Context
  const socketContext = useContext(SocketContext);

  // React State
  const [edfFile, setEdfFile] = useState({});
  const [bidsDirectory, setBidsDirectory] = useState(null);
  const [siteID, setSiteID] = useState('');

  const fireBidsConverter = () => {
    socketContext.emit('ieeg_to_bids', {
      file_path: edfFile.path,
      bids_directory: bidsDirectory,
      read_only: false,
    });
  };

  const fireModifyBidsTsv = () => {
    socketContext.emit('modify_bids_tsv', {
      bids_directory: bidsDirectory,
      site_id: siteID,
    });
  };

  const onMessage = (message) => {
    console.log(message);
  };

  const onUserInput = async (name, value) => {
    if (name === 'edfFile') {
      await setEdfFile(value);
    } else if (name === 'bidsDirectory') {
      await setBidsDirectory(value);
    } else if (name === 'siteID') {
      await setSiteID(value);
    }
  };

  return props.visible ? (
    <>
      <div style={{
        fontSize: '20px',
        textAlign: 'center',
        verticalAlign: 'middle',
        cursor: 'default',
        padding: '20px',
      }}>
        iEEG to BIDS Converter
      </div>
      <div style={{backgroundColor: '#039b83'}}>
        <div style={{
          padding: '20px',
        }}>
          <FileInput id='edfFile'
            name='edfFile'
            accept='.edf'
            label='1. The file.edf to convert: '
            onUserInput={onUserInput}
          />
        </div>
        <div style={{
          padding: '20px',
        }}>
          <DirectoryInput id='bidsDirectory'
            name='bidsDirectory'
            value='Choose directory'
            label='2. The BIDS output directory: '
            onUserInput={onUserInput}
          />
          <a style={{fontSize: '14px', cursor: 'default'}}>
            {bidsDirectory ?? 'No directory chosen'}
          </a>
        </div>
        <div style={{
          padding: '20px',
        }}>
          <b style={{cursor: 'default'}}>
            3. Convert file.edf to BIDS format:&nbsp;
          </b>
          <button onClick={fireBidsConverter}>
            Start Task
          </button>
        </div>
        <div style={{
          padding: '20px',
        }}>
          <FileInput id='events_tsv'
            name='events_tsv'
            accept='.tsv'
            label='4. The events.tsv to include: '
            onUserInput={onUserInput}
          />
          <b style={{cursor: 'default'}}>
            Package events.tsv in BIDS:&nbsp;
          </b>
          <button onClick={fireModifyBidsTsv}>
          Start Task
          </button>
        </div>
      </div>
      <div style={{marginTop: '20px',
        fontSize: '20px',
        textAlign: 'center',
        verticalAlign: 'middle',
        cursor: 'default',
      }}>
        Finalize participants.tsv for LORIS
      </div>
      <div style={{marginTop: '20px',
        backgroundColor: '#039b83',
        padding: '20px',
        cursor: 'default',
      }}>
        <TextInput id='siteID'
          name='siteID'
          label='5. The SiteID from LORIS: '
          value={siteID}
          onUserInput={onUserInput}
        />
      </div>
      <div style={{
        padding: '20px',
        backgroundColor: '#039b83',
      }}>
        <b style={{cursor: 'default'}}>
          6. Modify participants.tsv data:&nbsp;
        </b>
        <button onClick={fireModifyBidsTsv}>
          Start Task
        </button>
      </div>
      <Event event='response' handler={onMessage} />
    </>
  ) : null;
};
Converter.propTypes = {
  visible: PropTypes.bool,
};

export default Converter;
