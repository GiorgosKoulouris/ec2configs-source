import React, { Component } from 'react';
import axios from 'axios';
import './tables.css';
import './sidebar.css';

import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';

import { getMsalToken } from '../../../helperFunctions/adFunctions';

const backendURL = window.frontendConfig.REACT_APP_BACKEND_URL

export class Sidebar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isModal: props.isModal,
            configName: props.configName,
            azRegionList: [],
            azSubscriptionList: [],
            azSubscription: props.az.azSubscription,
            azRegion: props.az.azRegion,
            errorModal: {
                errorModalOpen: false,
                errorTitle: "",
                errorMessage: "",
                errorID: ""
            },
            modalStyle: {
                position: 'absolute',
                padding: 5,
                top: '30%',
                left: '42%',
                bgcolor: '#031d2f',
                display: "flex",
                flexDirection: "column",
                justifyContent: 'center',
                alignItems: 'center',
                border: '1px solid #b8def9'
            }
        }
        this.updateConfigName = this.updateConfigName.bind(this);
        this.getSubscriptions = this.getSubscriptions.bind(this);
        this.getRegions = this.getRegions.bind(this);
        this.updateAzSubscription = this.updateAzSubscription.bind(this);
        this.updateAzRegion = this.updateAzRegion.bind(this);
        this.closeErrorModal = this.closeErrorModal.bind(this);

        // Run to initialize the lists only if it is not in edit mode
        this.getSubscriptions();
        if (!props.isModal) {
            this.getRegions();
        }
    }

    closeErrorModal() {
        this.setState({
            errorModal: {
                errorModalOpen: false
            }
        })
    }

    updateConfigName(e) {
        let name = e.target.value;
        this.props.updateConfigInfo(name)
        this.setState({
            configName: name
        })
    }

    getSubscriptions = async () => {
        let msalToken = getMsalToken();
        axios.defaults.headers.common = {
            'Authorization': `Bearer ${msalToken}`
        };
        const url = `${backendURL}/az/get-subscriptions/`;
        await axios.get(url)
            .then((res) => {
                var subscriptionList = [];
                for (let i = 0; i < res.data.data.length; i++) {
                    var d = res.data.data[i].subscription_name;
                    subscriptionList.push(d)
                }
                this.state.azSubscriptionList = subscriptionList;
                if (!this.state.isModal) {
                    this.state.azSubscription = subscriptionList[0]
                    this.props.updateAccountInfo(subscriptionList[0], this.state.azRegion, subscriptionList)
                }
            })
            .catch((err) => {
                if (err.code === "ERR_NETWORK") {
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
                        errorID: err.response.data.error.errorID,
                    }
                    this.setState({
                        errorModal: errorModal
                    })
                }
            })
    }

    getRegions = async () => {
        let msalToken = getMsalToken();
        axios.defaults.headers.common = {
            'Authorization': `Bearer ${msalToken}`
        };
        const url = `${backendURL}/az/get-regions/`;
        await axios.get(url)
            .then((res) => {
                var regionsArray = [];
                for (let i = 0; i < res.data.data.length; i++) {
                    var d = res.data.data[i].display_name;
                    regionsArray.push(d)
                }
                this.setState({
                    azRegionList: regionsArray
                })
                if (!this.state.isModal) {
                    this.state.azRegion = regionsArray[0]
                    this.props.updateAccountInfo(this.state.azSubscription, regionsArray[0], this.state.azSubscriptionList)
                }
            })
            .catch((err) => {
                if (err.code === "ERR_NETWORK") {
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
                        errorID: err.response.data.error.errorID,
                    }
                    this.setState({
                        errorModal: errorModal
                    })
                }
            })
    }

    updateAzSubscription = async (e) => {
        var selectedSubscription = e.target.value;
        this.state.azSubscription = selectedSubscription;
        this.props.updateAccountInfo(selectedSubscription, this.state.azRegion, this.state.azSubscriptionList)
    }
    updateAzRegion = async (e) => {
        var selectedRegion = e.target.value;
        this.state.azRegion = selectedRegion;
        this.props.updateAccountInfo(this.state.azSubscription, selectedRegion, this.state.azSubscriptionList);
    }

    render() {
        return (
            <div className='sidebar'>
                {!this.state.isModal ? <h2>Create Config</h2> : <h2>Edit Config</h2>}
                <h3 className='sidebar-title'>Configuration Name</h3>
                <input className={this.state.configName !== "" ? 'table-input sidebar-input' : 'table-input sidebar-input blackhole'}
                    type='text' value={this.state.configName} onChange={this.updateConfigName}></input>

                <div className='divider-line'></div>
                <h3 className='sidebar-title'>Subscription</h3>
                {!this.state.isModal ?
                    <select className={this.state.azSubscription !== "" ? 'dropDownMenu' : 'dropDownMenu blackhole'}
                        onChange={this.updateAzSubscription}>
                        {this.state.azSubscriptionList.map(e => <option value={e}>{e}</option>)}
                    </select> :
                    <div>{this.state.azSubscription}</div>
                }
                <h3 className='sidebar-title'>Region</h3>
                {!this.state.isModal ?
                    <select className={this.state.azRegion !== "" ? 'dropDownMenu' : 'dropDownMenu blackhole'} onChange={this.updateAzRegion}>
                        {this.state.azRegionList.map(e => <option value={e}>{e}</option>)}
                    </select> :
                    <div>{this.state.azRegion}</div>
                }

                <div className='divider-line'></div>

                <div className='sidebar-button-section'>
                    <div><button className='action-button sidebar-button' onClick={this.props.postConfig}>Save Configuration</button></div>
                    {this.state.isModal ? <div><button className='action-button sidebar-button' onClick={this.props.postConfig}>Cancel</button></div> : <></>}
                </div>
                <Modal open={this.state.errorModal.errorModalOpen} onClose={this.closeErrorModal} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
                    <Fade in={this.state.errorModal.errorModalOpen}>
                        <Box sx={this.state.modalStyle}>
                            <h2 className='error-modal-title'>{this.state.errorModal.errorTitle}</h2>
                            <p className='error-modal-text'>{this.state.errorModal.errorMessage}</p>
                            <p className='error-modal-text'>{"Error ID: " + this.state.errorModal.errorID}</p>
                        </Box>
                    </Fade>
                </Modal>
            </div>
        )
    }
}

export default Sidebar