import React, { Component } from 'react';
import axios from 'axios';
import { getUserEmail, getMsalToken } from '../../helperFunctions/adFunctions';
import { errorModalStyle } from '../../modalStyles';

import './updateShareModal.css';
import '../../global.css';

import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';

const backendURL = process.env.REACT_APP_BACKEND_URL;

export default class UpdateShareModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            errorModal: {
                errorModalOpen: false,
                errorTitle: "",
                errorMessage: "",
                errorID: ""
            },
            configUUID: props.configUUID,
            userEmail: getUserEmail(),
            tableKeys: ['Share type', 'Shared with', 'Permissions', 'Actions'],
            data: [],
            shareTypeList: ['User', 'Group'],
            userList: [],
            groupList: [],
            permissionList: ['Read', 'Edit', 'Apply', 'Full']
        }

        this.getCurrentShares = this.getCurrentShares.bind(this);
        this.saveCurrentShares = this.saveCurrentShares.bind(this);
        this.updateShareType = this.updateShareType.bind(this);
        this.updateShareTarget = this.updateShareTarget.bind(this);
        this.updatePermissions = this.updatePermissions.bind(this);
        this.removeShare = this.removeShare.bind(this);
        this.addShare = this.addShare.bind(this);
        this.closeErrorModal = this.closeErrorModal.bind(this);

        this.getCurrentShares();
    }

    closeErrorModal(e) {
        this.setState({
            errorModal: {
                errorModalOpen: false
            }
        })
    }

    getCurrentShares = async () => {
        let url = `${backendURL}/get-config-shares`;
        let params = {
            configUUID: this.state.configUUID
        }
        let msalToken = getMsalToken();
        axios.defaults.headers.common = {
            'Authorization': `Bearer ${msalToken}`
        };
        await axios.get(url, { params })
            .then((res) => {
                let newUserList = res.data.data.userList;
                let currentUserIndex = -1;
                for (let i = 0; i < newUserList.length; i++) {
                    if (newUserList[i] === this.state.userEmail) {
                        currentUserIndex = i;
                    }
                }
                newUserList.splice(currentUserIndex, 1);
                let finalUserList = ["-- Choose User --"];
                finalUserList = finalUserList.concat(newUserList);

                let groupList = [{ group_name: "-- Choose Group --" }];
                groupList = groupList.concat(res.data.data.groupList)
                this.setState({
                    data: res.data.data.shares,
                    userList: finalUserList,
                    groupList: groupList
                })
            })
            .catch((err) => {
                this.setState({
                    errorModal: {
                        errorModalOpen: true,
                        errorTitle: err.response.data.error.title,
                        errorMessage: err.response.data.error.message,
                        errorID: err.response.data.error.errorID,
                    }
                })
            })
    }
    saveCurrentShares = async () => {
        let url = `${backendURL}/modify-config-shares`;
        let params = {
            configUUID: this.state.configUUID,
            shares: this.state.data
        }
        let msalToken = getMsalToken();
        axios.defaults.headers.common = {
            'Authorization': `Bearer ${msalToken}`
        };
        await axios.post(url, params)
            .then((res) => {
                this.props.closeModal();
            })
            .catch((err) => {
                this.setState({
                    errorModal: {
                        errorModalOpen: true,
                        errorTitle: err.response.data.error.title,
                        errorMessage: err.response.data.error.message,
                        errorID: err.response.data.error.errorID,
                    }
                })
            })
    }

    updateShareType(e) {
        let indexToUpdate = e.target.parentElement.parentElement.rowIndex;
        let data = this.state.data;
        data[indexToUpdate].share_type = e.target.value;
        if (e.target.value === "User") {
            data[indexToUpdate].target_id = this.state.userList[0];
        } else {
            data[indexToUpdate].target_id = this.state.groupList[0];
        }
        this.setState({
            data: data
        })
    }
    updateShareTarget(e) {
        let indexToUpdate = e.target.parentElement.parentElement.rowIndex;
        let data = this.state.data;
        data[indexToUpdate].target_id = e.target.value
        this.setState({
            data: data
        })
    }
    updatePermissions(e) {
        let indexToUpdate = e.target.parentElement.parentElement.rowIndex;
        let data = this.state.data;
        data[indexToUpdate].permissions = e.target.value
        this.setState({
            data: data
        })
    }
    addShare() {
        let newData = this.state.data;
        newData.push({ share_type: "User", target_id: this.state.userList[0], permissions: this.state.permissionList[0] });
        this.setState({
            data: newData
        })
    }
    removeShare(e) {
        let newData = this.state.data;
        let indexToDelete = e.target.parentElement.parentElement.rowIndex;
        newData.splice(indexToDelete, 1);
        this.setState({
            data: newData
        })
    }
    render() {
        return (
            <div className='share-modal-root'>
                <div className='table-root'>
                    <h1 className='section-title'>Active Shares</h1>
                    <table className='table-table'>
                        {this.state.tableKeys.map(i => <th>{i}</th>)}
                        <tbody>
                            {this.state.data.map(i =>
                                <tr>
                                    <td>
                                        <select className='dropDownMenu' value={i.share_type} onChange={this.updateShareType}>
                                            {this.state.shareTypeList.map(e =>
                                                i.share_type === e ?
                                                    <option value={e} selected>{e}</option> :
                                                    <option value={e}>{e}</option>
                                            )}
                                        </select>
                                    </td>
                                    <td>
                                        <select className='dropDownMenu' value={i.target_id} onChange={this.updateShareTarget}>
                                            {i.share_type === "User" ?
                                                this.state.userList.map(e =>
                                                    i.target_id === e ?
                                                        <option value={e} selected>{e}</option> :
                                                        <option value={e}>{e}</option>
                                                ) :
                                                this.state.groupList.map(e =>
                                                    i.target_id === e ?
                                                        <option value={e.group_name} selected>{e.group_name}</option> :
                                                        <option value={e.group_name}>{e.group_name}</option>
                                                )
                                            }
                                        </select>
                                    </td>
                                    <td>
                                        <select className='dropDownMenu' value={i.permissions} onChange={this.updatePermissions}>
                                            {this.state.permissionList.map(e =>
                                                i.permissions === e ?
                                                    <option value={e} selected>{e}</option> :
                                                    <option value={e}>{e}</option>
                                            )}
                                        </select>
                                    </td>
                                    <td>
                                        <button className='action-button' onClick={this.removeShare}>Remove</button>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    <div className='share-button-section'>
                        <button className='action-button share-add-button' onClick={this.addShare}>Add Share</button>
                        <div className='share-button-section-inner'>
                            <button className='action-button share-save-button' onClick={this.saveCurrentShares}>Save</button>
                            <button className='action-button share-save-button' onClick={this.props.closeModal}>Cancel</button>
                        </div>
                    </div>
                </div>
                <Modal open={this.state.errorModal.errorModalOpen} onClose={this.closeErrorModal} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
                    <Fade in={this.state.errorModal.errorModalOpen}>
                        <Box sx={errorModalStyle}>
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
