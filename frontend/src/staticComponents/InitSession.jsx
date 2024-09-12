import React, { Component } from 'react';

import { Navigate } from 'react-router-dom';
import axios from 'axios';

import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';

import { getMsalToken } from '../helperFunctions/adFunctions';
import { errorModalStyle } from '../modalStyles';

const backendURL = window.frontendConfig.REACT_APP_BACKEND_URL;

export class InitSession extends Component {
  constructor(props) {
    super(props);
    this.state = {
      errorModal: {
        errorModalOpen: false,
        errorTitle: "",
        errorMessage: ""
      },
      shouldNavigate: false
    }

    this.closeErrorModal = this.closeErrorModal.bind(this);
    this.initSession = this.initSession.bind(this);

    this.initSession();
  }

  closeErrorModal() {
    this.setState({
      errorModal: {
        errorModalOpen: false
      }
    })
    this.initSession();
  }

  initSession = async () => {
    let url = `${backendURL}/login`
    let msalToken = getMsalToken();
    axios.defaults.headers.common = {
      'Authorization': `Bearer ${msalToken}`
    };
    await axios.get(url)
      .then((res) => {
        this.setState({
          shouldNavigate: true
        })
      })
      .catch((err) => {
        let resError = err.response.data.error;
        this.setState({
          errorModal: {
            errorModalOpen: true,
            errorTitle: resError.title,
            errorMessage: resError.message
          }
        })
      })
  }
  render() {
    return (
      <>
        {this.state.shouldNavigate ? <Navigate to='/' /> : <></>}
        <Modal open={this.state.errorModal.errorModalOpen} onClose={this.closeErrorModal} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
          <Fade in={this.state.errorModal.errorModalOpen}>
            <Box sx={errorModalStyle}>
              <h2 className='error-modal-title'>{this.state.errorModal.errorTitle}</h2>
              <p className='error-modal-text'>{this.state.errorModal.errorMessage}</p>
            </Box>
          </Fade>
        </Modal>
      </>
    )
  }
}
