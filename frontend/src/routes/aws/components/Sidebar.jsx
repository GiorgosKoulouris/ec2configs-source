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
            awsRegionList: [],
            awsAccountList: [],
            awsAccount: props.aws.awsAccount,
            awsRegion: props.aws.awsRegion,
            awsAzList: [],
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
        this.getAccounts = this.getAccounts.bind(this);
        this.getRegions = this.getRegions.bind(this);
        this.updateAwsAccount = this.updateAwsAccount.bind(this);
        this.updateAwsRegion = this.updateAwsRegion.bind(this);
        this.getAZs = this.getAZs.bind(this);
        this.closeErrorModal = this.closeErrorModal.bind(this);

        // Run to initialize the lists only if it is not in edit mode
        this.getAccounts();
        if (!props.isModal) {
            this.getRegions();
        } else {
            this.getAZs(props.aws.awsRegion)
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

    getAccounts = async () => {
        let msalToken = getMsalToken();
        axios.defaults.headers.common = {
          'Authorization': `Bearer ${msalToken}`
        };
        const url = `${backendURL}/aws/get-accounts/`;
        await axios.get(url)
            .then((res) => {
                var accountsArray = [];
                for (let i = 0; i < res.data.data.length; i++) {
                    var d = res.data.data[i].account_name;
                    accountsArray.push(d)
                }
                this.state.awsAccountList = accountsArray;
                if (!this.state.isModal) {
                    this.state.awsAccount = accountsArray[0];
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
        const url = `${backendURL}/aws/get-regions/`;
        await axios.get(url)
            .then((res) => {
                var regionsArray = [];
                for (let i = 0; i < res.data.data.length; i++) {
                    var d = res.data.data[i].aws_name;
                    regionsArray.push(d)
                }
                this.state.awsRegionList = regionsArray;
                this.state.awsRegion = regionsArray[0];
                this.getAZs(regionsArray[0]);
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
    getAZs = async (region) => {
        let msalToken = getMsalToken();
        axios.defaults.headers.common = {
          'Authorization': `Bearer ${msalToken}`
        };
        const url = `${backendURL}/aws/get-azs/`;
        let params = {
            region: region
        }
        await axios.get(url, { params })
            .then((res) => {
                var azList = [];
                for (let i = 0; i < res.data.data.length; i++) {
                    var d = res.data.data[i].az;
                    azList.push(d)
                }
                this.props.updateAccountInfo(
                    this.state.awsAccount, this.state.awsRegion, azList, this.state.awsAccountList
                )
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

    updateAwsAccount = async (e) => {
        var selectedAccount = e.target.value;
        this.state.awsAccount = selectedAccount;
        await this.getAZs(this.state.awsRegion);
    }
    updateAwsRegion = async (e) => {
        var selectedRegion = e.target.value;
        this.state.awsRegion = selectedRegion;
        await this.getAZs(selectedRegion);
    }

    render() {
        return (
            <div className='sidebar'>
                {!this.state.isModal ? <h2>Create Config</h2> : <h2>Edit Config</h2>}
                <h3 className='sidebar-title'>Configuration Name</h3>
                <input className={this.state.configName !== "" ? 'table-input sidebar-input' : 'table-input sidebar-input blackhole'}
                    type='text' value={this.state.configName} onChange={this.updateConfigName}></input>

                <div className='divider-line'></div>
                <h3 className='sidebar-title'>AWS Account</h3>
                {!this.state.isModal ?
                    <select className={this.state.awsAccount !== "" ? 'dropDownMenu' : 'dropDownMenu blackhole'}
                        onChange={this.updateAwsAccount}>
                        {this.state.awsAccountList.map(e => <option value={e}>{e}</option>)}
                    </select> :
                    <div>{this.state.awsAccount}</div>
                }
                <h3 className='sidebar-title'>Region</h3>
                {!this.state.isModal ?
                    <select className={this.state.awsRegion !== "" ? 'dropDownMenu' : 'dropDownMenu blackhole'} onChange={this.updateAwsRegion}>
                        {this.state.awsRegionList.map(e => <option value={e}>{e}</option>)}
                    </select> :
                    <div>{this.state.awsRegion}</div>
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