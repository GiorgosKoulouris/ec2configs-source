
import React, { Component } from 'react';
import axios from 'axios';

import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';

import { getUserEmail, getMsalToken } from '../../../helperFunctions/adFunctions';

import { errorModalStyle } from '../../../modalStyles';

const backendURL = process.env.REACT_APP_BACKEND_URL;

export default class GroupMembers extends Component {
    constructor(props) {
        super(props);
        this.state = {
            groupToEdit: props.groupToEdit,
            tableKeys: ["Member", "Added By", "Added At", "Actions"],
            data: [],
            userList: [],
            errorModal: {
                errorModalOpen: false,
                errorTitle: "",
                errorMessage: "",
                errorID: ""
            }
        }
        this.getUsers = this.getUsers.bind(this);
        this.getMembers = this.getMembers.bind(this);
        this.addMember = this.addMember.bind(this);
        this.removeMember = this.removeMember.bind(this);
        this.updateMember = this.updateMember.bind(this);
        this.saveCurrentMembers = this.saveCurrentMembers.bind(this);
        this.closeErrorModal = this.closeErrorModal.bind(this);

        this.getUsers();
        this.getMembers();
    }

    updateMember(e) {
        let index = e.target.parentElement.parentElement.rowIndex;
        let user_email = e.target.value;
        let tempData = this.state.data;
        tempData[index].user_email = user_email;
        this.setState({
            data: tempData
        })
    }

    removeMember(e) {
        let index = e.target.parentElement.parentElement.rowIndex;
        let tempData = this.state.data;
        tempData.splice(index, 1);
        this.setState({
            data: tempData
        })
    }

    getMembers = async () => {
        let params = {
            groupToEdit: this.state.groupToEdit
        }
        let msalToken = getMsalToken();
        axios.defaults.headers.common = {
            'Authorization': `Bearer ${msalToken}`
        };
        let url = `${backendURL}/admin/groups/get-members/`;
        await axios.get(url, { params })
            .then((res) => {
                this.setState({
                    data: res.data.data
                })
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

    getUsers = async () => {
        let msalToken = getMsalToken();
        axios.defaults.headers.common = {
            'Authorization': `Bearer ${msalToken}`
        };
        let url = `${backendURL}/admin/get-users/`;
        await axios.get(url)
            .then((res) => {
                let tempData = ["-- Choose user --"];
                for (let i = 0; i < res.data.data.length; i++) {
                    tempData.push(res.data.data[i].email)
                }
                this.setState({
                    userList: tempData
                })
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

    closeErrorModal() {
        this.setState({
            errorModal: {
                errorModalOpen: false,
                errorID: ""
            }
        })
    }

    addMember() {
        let tempData = this.state.data;
        tempData.push({
            user_email: "-- Choose user --",
            added_by: "",
            added_at: "",
        })
        this.setState({
            data: tempData
        })
    }

    saveCurrentMembers = async () => {
        let tempData = this.state.data;
        let hasErrors = false;
        for (let i = 0; i < tempData.length; i++) {
            if (tempData[i].user_email === "-- Choose user --") {
                hasErrors = true;
            }
        }
        if (hasErrors) {
            this.setState({
                errorModal: {
                    errorModalOpen: true,
                    errorTitle: "Input error",
                    errorMessage: "Fix any entries that have no chosen user.",
                }
            })
        } else {
            let url = `${backendURL}/admin/groups/modify-members`
            let params = {
                groupToEdit: this.state.groupToEdit,
                members: this.state.data,
                addedByEmail: getUserEmail(),
            }
            let msalToken = getMsalToken();
            axios.defaults.headers.common = {
                'Authorization': `Bearer ${msalToken}`
            };
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
                            errorID: err.response.data.error.errorID,
                        }
                    })
                })
        }
    }

    render() {
        return (
            <div className='share-modal-root'>
                <div className='table-root'>
                    <h1 className='section-title'>Members</h1>
                    <table className='table-table'>
                        {this.state.tableKeys.map(i => <th>{i}</th>)}
                        <tbody>
                            {this.state.data.map(i =>
                                <tr>
                                    <td>
                                        <select className='dropDownMenu' value={i.user_email} onChange={this.updateMember}>
                                            {this.state.userList.map(e =>
                                                i.user_email === e ?
                                                    <option value={e} selected>{e}</option> :
                                                    <option value={e}>{e}</option>
                                            )}
                                        </select>
                                    </td>
                                    <td>{i.added_by}</td>
                                    <td>{i.added_at}</td>
                                    <td>
                                        <button className='action-button' onClick={this.removeMember}>Remove</button>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    <div className='share-button-section'>
                        <button className='action-button share-add-button' onClick={this.addMember}>Add Member</button>
                        <div className='share-button-section-inner'>
                            <button className='action-button share-save-button' onClick={this.saveCurrentMembers}>Save</button>
                            <button className='action-button share-save-button' onClick={this.props.closeEditModal}>Cancel</button>
                        </div>
                    </div>
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
