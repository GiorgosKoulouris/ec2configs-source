
import React, { Component } from 'react';
import axios from 'axios';

import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';

import { getUserEmail } from '../../../helperFunctions/adFunctions';

import { errorModalStyle } from '../../../modalStyles';

const backendURL = window.frontendConfig.REACT_APP_BACKEND_URL;

export default class UserMemberships extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userToEdit: props.userToEdit,
            tableKeys: ["Group", "Added By", "Added At", "Actions"],
            data: [],
            groupList: [],
            errorModal: {
                errorModalOpen: false,
                errorTitle: "",
                errorMessage: ""
            }
        }
        this.getGroups = this.getGroups.bind(this);
        this.getMemberships = this.getMemberships.bind(this);
        this.addMembership = this.addMembership.bind(this);
        this.removeMembership = this.removeMembership.bind(this);
        this.updateGroupName = this.updateGroupName.bind(this);
        this.saveCurrentMemberships = this.saveCurrentMemberships.bind(this);
        this.closeErrorModal = this.closeErrorModal.bind(this);

        this.getGroups();
        this.getMemberships();
    }

    updateGroupName(e) {
        let index = e.target.parentElement.parentElement.rowIndex;
        let groupName = e.target.value;
        let tempData = this.state.data;
        tempData[index].group_name = groupName;
        this.setState({
            data: tempData
        })
    }

    removeMembership(e) {
        let index = e.target.parentElement.parentElement.rowIndex;
        let tempData = this.state.data;
        tempData.splice(index, 1);
        this.setState({
            data: tempData
        })
    }

    getMemberships = async () => {
        let params = {
            userEmail: this.state.userToEdit
        }
        let url = `${backendURL}/admin/user/get-memberships/`;
        await axios.get(url, { params })
            .then((res) => {
                this.setState({
                    data: res.data.data
                })
            })
            .catch((err) => {
                console.log(err)
                this.setState({
                    errorModal: {
                        errorModalOpen: true,
                        errorTitle: err.response.data.error.title,
                        errorMessage: err.response.data.error.message
                    }
                })
            })
    }

    getGroups = async () => {
        let url = `${backendURL}/admin/get-groups/`;
        await axios.get(url)
            .then((res) => {
                let tempData = ["-- Choose group --"];
                for (let i = 0; i < res.data.data.length; i++) {
                    tempData.push(res.data.data[i].group_name)
                }
                this.setState({
                    groupList: tempData
                })
            })
            .catch((err) => {
                console.log(err)
                this.setState({
                    errorModal: {
                        errorModalOpen: true,
                        errorTitle: err.response.data.error.title,
                        errorMessage: err.response.data.error.message
                    }
                })
            })
    }

    closeErrorModal() {
        this.setState({
            errorModal: {
                errorModalOpen: false
            }
        })
    }

    addMembership() {
        let tempData = this.state.data;
        tempData.push({
            group_name: "-- Choose group --",
            added_by: "",
            added_at: "",
        })
        this.setState({
            data: tempData
        })
    }

    saveCurrentMemberships = async () => {
        let tempData = this.state.data;
        let hasErrors = false;
        for (let i = 0; i < tempData.length; i++) {
            if (tempData[i].group_name === "-- Choose group --") {
                hasErrors = true;
            }
        }
        if (hasErrors) {
            this.setState({
                errorModal: {
                    errorModalOpen: true,
                    errorTitle: "Input error",
                    errorMessage: "Fix any assignments with no chosen target group.",
                }
            })
        } else {
            let url = `${backendURL}/admin/user/modify-memberships`
            let params = {
                userToEdit: this.state.userToEdit,
                memberships: this.state.data,
            }
            await axios.post(url, params)
                .then((res) => {
                    this.props.closeEditModal();
                })
                .catch((err) => {
                    this.setState({
                        errorModal: {
                            errorModalOpen: true,
                            errorTitle: err.response.data.error.title,
                            errorMessage: err.response.data.error.message,
                        }
                    })
                })
        }
    }

    render() {
        return (
            <div className='share-modal-root'>
                <div className='table-root'>
                    <h1 className='section-title'>Memberships</h1>
                    <table className='table-table'>
                        {this.state.tableKeys.map(i => <th>{i}</th>)}
                        <tbody>
                            {this.state.data.map(i =>
                                <tr>
                                    <td>
                                        <select className='dropDownMenu' value={i.group_name} onChange={this.updateGroupName}>
                                            {this.state.groupList.map(e =>
                                                i.group_name === e ?
                                                    <option value={e} selected>{e}</option> :
                                                    <option value={e}>{e}</option>
                                            )}
                                        </select>
                                    </td>
                                    <td>{i.added_by}</td>
                                    <td>{i.added_at}</td>
                                    <td>
                                        <button className='action-button' onClick={this.removeMembership}>Remove</button>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    <div className='share-button-section'>
                        <button className='action-button share-add-button' onClick={this.addMembership}>Add Membership</button>
                        <div className='share-button-section-inner'>
                            <button className='action-button share-save-button' onClick={this.saveCurrentMemberships}>Save</button>
                            <button className='action-button share-save-button' onClick={this.props.closeEditModal}>Cancel</button>
                        </div>
                    </div>
                </div>
                <Modal open={this.state.errorModal.errorModalOpen} onClose={this.closeErrorModal} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
                    <Fade in={this.state.errorModal.errorModalOpen}>
                        <Box sx={errorModalStyle}>
                            <h2 className='error-modal-title'>{this.state.errorModal.errorTitle}</h2>
                            <p className='error-modal-text'>{this.state.errorModal.errorMessage}</p>
                        </Box>
                    </Fade>
                </Modal>
            </div>
        )
    }
}
