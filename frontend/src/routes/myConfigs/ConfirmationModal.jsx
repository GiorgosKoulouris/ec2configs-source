import React, { Component } from 'react';
import { getMsalToken } from '../../helperFunctions/adFunctions';

import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';

import ReactLoading from "react-loading";

import { loadingModalStyle }from '../../modalStyles';

import axios from 'axios';

import '../../global.css';

import './ConfirmationModal.css';

const backendURL = process.env.REACT_APP_BACKEND_URL;

export default class ConfirmationModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            actionType: props.params.saveMethod,
            loadingModal: {
                loadingModalOpen: false
            }
        }
        if (this.state.actionType === 'Delete') {
            this.state.titleText = 'Confirm Deletion';
            this.state.longText = 'This action will destroy any provisioned objects and will delete the configuration.';
        } else if (this.state.actionType === 'Destroy') {
            this.state.titleText = 'Confirm Destruction';
            this.state.longText = 'This action will destroy any provisioned objects.'
        }

        this.closeModal = this.closeModal.bind(this);
        this.applyAction = this.applyAction.bind(this);
    }

    closeModal() {
        this.props.closeConfirmationModal();
    }

    applyAction = async () => {
        let loadingModalTitle = '';
        if (this.state.actionType === 'Delete') {
            loadingModalTitle = "Deleting configuration"
        } else if (this.state.actionType === 'Destroy') {
            loadingModalTitle = "Destroying configuration"
        }
        let loadingModal = {
            title: loadingModalTitle,
            loadingModalOpen: true
        }
        this.setState({
            loadingModal: loadingModal
        })
        let params = this.props.params;

        let msalToken = getMsalToken();
        axios.defaults.headers.common = {
            'Authorization': `Bearer ${msalToken}`
        };
        const urlDelete = `${backendURL}/modify-config/`
        await axios.post(urlDelete, params, { timeout: 90000 })
            .then((res) => {

            })
            .catch((err) => {
                if (err.code === "ECONNABORTED") {
                    let errorModal = {
                        errorModalOpen: true,
                        errorTitle: 'Action still pending',
                        errorMessage: 'Action may take some time. Please wait until the config is not in a "Pending" state.'
                    }
                    this.setState({
                        errorModal: errorModal,
                        loadingModal: {
                            loadingModalOpen: false
                        }
                    })
                } else if (err.code === "ERR_NETWORK") {
                    let errorModal = {
                        errorModalOpen: true,
                        errorTitle: "Backend server error",
                        errorMessage: "Failed to connect to backend. If the issue persists, contact the administrator of the app.",
                    }
                    this.setState({
                        errorModal: errorModal,
                        loadingModal: {
                            loadingModalOpen: false
                        }
                    })
                } else {
                    let errorModal = {
                        errorModalOpen: true,
                        errorTitle: err.response.data.error.title,
                        errorMessage: err.response.data.error.message,
                        errorID: err.response.data.error.errorID
                    }
                    this.setState({
                        errorModal: errorModal,
                        loadingModal: {
                            loadingModalOpen: false
                        }
                    })
                }
            })

        this.closeModal();
    }

    render() {
        return (
            <div className='confirmation-modal-root'>
                <h1 className='confirmation-modal-title'>{this.state.titleText}</h1>
                <p>{this.state.longText}</p>
                <div className='confirmation-button-section-inner'>
                    <button className='action-button confirmation-button-first' onClick={this.applyAction}>{this.state.actionType}</button>
                    <button className='action-button confirmation-button-last' onClick={this.closeModal}>Cancel</button>
                </div>
                <Modal open={this.state.loadingModal.loadingModalOpen} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
                    <Fade in={this.state.loadingModal.loadingModalOpen}>
                        <Box sx={loadingModalStyle}>
                            <>
                                <h2 className='error-modal-title'>{this.state.loadingModal.title}</h2>
                                <ReactLoading type="bubbles" color="#3fbcf28b"
                                    height={100} width={65} />
                            </>
                        </Box>
                    </Fade>
                </Modal>
            </div>
        )
    }
}
