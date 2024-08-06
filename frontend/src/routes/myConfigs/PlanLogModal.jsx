import React, { Component } from 'react';
import axios from 'axios';

import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';

import { errorModalStyle, loadingModalStyle } from '../../modalStyles';

import ReactLoading from "react-loading";

import { getUserEmail, getMsalToken } from '../../helperFunctions/adFunctions';

import './planLogModal.css';

const backendURL = process.env.REACT_APP_BACKEND_URL;

export default class PlanLogModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            planLogText: props.planLogModal.planLogText,
            errorModal: {
                errorModalOpen: false,
                errorTitle: "",
                errorMessage: ""
            },
            loadingModal: {
                loadingModalOpen: false,
                title: "",
                message: ""
            },
        }
        this.applyPlan = this.applyPlan.bind(this);
        this.closeLogModal = this.closeLogModal.bind(this);
        this.closeErrorModal = this.closeErrorModal.bind(this);
    }

    closeErrorModal() {
        this.setState({
            errorModal: {
                errorModalOpen: false
            }
        })
    }

    closeLogModal() {
        this.props.reloadConfigs();
        this.props.closePlanLogModal();
    }

    applyPlan = async () => {
        let params = {
            userEmail: getUserEmail(),
            saveMethod: "Apply",
            configUUID: this.props.planLogModal.configUUID,
            provider: this.props.planLogModal.provider
        }
        let loadingModal = {
            title: "Applying configuration",
            loadingModalOpen: true
        }
        this.setState({
            loadingModal: loadingModal
        })
        let msalToken = getMsalToken();
        axios.defaults.headers.common = {
            'Authorization': `Bearer ${msalToken}`
        };
        const url = `${backendURL}/modify-config/`
        await axios.post(url, params, { timeout: 90000 })
            .then((res) => {
                this.setState({
                    loadingModal: {
                        loadingModalOpen: false
                    }
                })
                this.closeLogModal();
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
                    }
                    this.setState({
                        errorModal: errorModal,
                        loadingModal: {
                            loadingModalOpen: false
                        }
                    })
                }
            })
    }

    render() {
        return (
            <div className='pl-modal-root'>
                <pre className='pl-modal-log'>{this.state.planLogText}</pre>
                <div className='pl-modal-button-section'>
                    {this.props.planLogModal.canApply ?
                        <button className='action-button pl-modal-button' onClick={this.applyPlan}>Apply</button>
                        : <></>}
                    <button className='action-button pl-modal-button' onClick={this.closeLogModal}>Close</button>
                </div>
                <Modal open={this.state.errorModal.errorModalOpen} onClose={this.closeErrorModal} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
                    <Fade in={this.state.errorModal.errorModalOpen}>
                        <Box sx={errorModalStyle}>
                            <h2 className='error-modal-title'>{this.state.errorModal.errorTitle}</h2>
                            <p className='error-modal-text'>{this.state.errorModal.errorMessage}</p>
                        </Box>
                    </Fade>
                </Modal>
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
