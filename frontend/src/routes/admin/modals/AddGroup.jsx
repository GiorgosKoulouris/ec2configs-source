
import React, { Component } from 'react';
import axios from 'axios';

import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';

import { getUserEmail } from '../../../helperFunctions/adFunctions';

import { errorModalStyle } from '../../../modalStyles';

import './deleteUser.css';

const backendURL = process.env.REACT_APP_BACKEND_URL;

export default class AddGroup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            groupName: "",
            ownerEmail: "-- Choose Owner --",
            userList: [],
            errorModal: {
                errorModalOpen: false,
                errorTitle: "",
                errorMessage: "",
                errorID: ""
            }
        }
        this.getUsers = this.getUsers.bind(this);
        this.createGroup = this.createGroup.bind(this);
        this.updateGroupName = this.updateGroupName.bind(this);
        this.updateOwnerEmail = this.updateOwnerEmail.bind(this);
        this.closeErrorModal = this.closeErrorModal.bind(this);

        this.getUsers();
    }

    updateGroupName(e) {
        let groupName = e.target.value;
        this.setState({
            groupName: groupName
        })
    }

    updateOwnerEmail(e) {
        let ownerEmail = e.target.value;
        this.setState({
            ownerEmail: ownerEmail
        })
    }

    getUsers = async () => {
        let url = `${backendURL}/admin/get-users/`;
        await axios.get(url)
            .then((res) => {
                let userList = ["-- Choose Owner --"];
                for (let i = 0; i < res.data.data.length; i++) {
                    userList.push(res.data.data[i].email)
                }
                this.setState({
                    userList: userList
                })
            })
            .catch((err) => {
                console.log(err)
                this.setState({
                    errorModal: {
                        errorModalOpen: true,
                        errorTitle: err.response.data.error.title,
                        errorMessage: err.response.data.error.title,
                        errorID: err.response.data.error.errorID
                    }
                })
            })
    }

    closeErrorModal() {
        this.setState({
            errorModal: {
                errorModalOpen: false,
                errorID: ""
            }
        })
    }

    createGroup = async () => {
        let url = `${backendURL}/admin/groups/add-group`
        let params = {
            ownerEmail: this.state.ownerEmail,
            groupToCreate: this.state.groupName
        }
        if (params.ownerEmail === "-- Choose Owner --" || params.groupToCreate === "") {
            this.setState({
                errorModal: {
                    errorModalOpen: true,
                    errorTitle: "Input error",
                    errorMessage: "Group name blank or no group owner is chosen.",
                }
            })
        } else {
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
                            errorID: err.response.data.error.errorID
                        }
                    })
                })
        }
    }

    render() {
        return (
            <div className='delete-user-modal-root'>
                <h2 className='delete-user-modal-title'>Create User Group</h2>
                <h4 className='add-group-field-title'>Group Name</h4>
                <div>
                    <input value={this.state.groupName} className='table-input' onChange={this.updateGroupName}></input>
                </div>
                <h4 className='add-group-field-title'>Group Owner</h4>
                <select className='dropDownMenu' onChange={this.updateOwnerEmail}>
                    {this.state.userList.map(e =>
                        <option value={e}>{e}</option>
                    )}
                </select>
                <div className='add-group-button-section'>
                    <button className='action-button delete-user-modal-button' onClick={this.createGroup}>Confirm</button>
                    <button className='action-button delete-user-modal-button' onClick={this.props.closeEditModal}>Cancel</button>
                </div>
                <Modal open={this.state.errorModal.errorModalOpen} onClose={this.closeErrorModal} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
                    <Fade in={this.state.errorModal.errorModalOpen}>
                        <Box sx={errorModalStyle}>
                            <h2 className='error-modal-title'>{this.state.errorModal.errorTitle}</h2>
                            <p className='error-modal-text'>{this.state.errorModal.errorMessage}</p>
                            <p className='error-modal-text'>{`Error ID: ${this.state.errorModal.errorID}`}</p>
                        </Box>
                    </Fade>
                </Modal>
            </div>
        )
    }
}
