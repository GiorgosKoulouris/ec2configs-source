import React, { Component } from 'react';
import axios from 'axios';

import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';

import DeleteUser from './modals/DeleteUser';
import UserMemberships from './modals/UserMemberships';


import { errorModalStyle, editOptionsModalStyle } from '../../modalStyles';
import { getUserEmail, getMsalToken } from '../../helperFunctions/adFunctions';

import './adminTables.css';

const backendURL = window.frontendConfig.REACT_APP_BACKEND_URL;

export default class Users extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentUserEmail: getUserEmail(),
            tableKeys: ["Username", "Email", "First Login", "Last Login", "Admin", "Actions"],
            data: [],
            userEmailList: [],
            errorModal: {
                errorModalOpen: false,
                errorTitle: "",
                errorMessage: "",
                errorID: ""
            },
            editModal: {
                editModalOpen: false,
                editMode: "modifyMemberships"
            },
            userToEdit: ""
        }

        this.getUsers = this.getUsers.bind(this);
        this.openEditModal = this.openEditModal.bind(this);
        this.closeEditModal = this.closeEditModal.bind(this);

        this.getUsers()

    }

    getUsers = async () => {
        let msalToken = getMsalToken();
        axios.defaults.headers.common = {
            'Authorization': `Bearer ${msalToken}`
        };
        const url = `${backendURL}/admin/get-users/`;
        await axios.get(url)
            .then((res) => {
                let userEmailList = [];
                for (let i = 0; i < res.data.data.length; i++) {
                    userEmailList.push(res.data.data[i].email);
                }
                this.setState({
                    data: res.data.data,
                    userEmailList: userEmailList
                })
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
                        errorID: err.response.data.error.errorID
                    }
                    this.setState({
                        errorModal: errorModal
                    })
                }
            })

    }

    openEditModal(e) {
        let rowIndex = e.target.parentElement.rowIndex;
        let editMode = e.target.innerText;
        let userEmail = this.state.data[rowIndex].email;
        this.setState({
            editModal: {
                editModalOpen: true,
                editMode: editMode
            },
            userToEdit: userEmail
        })
    }

    closeEditModal() {
        this.setState({
            editModal: {
                editModalOpen: false,
                errorID: ""
            }
        })
        this.getUsers();
    }

    render() {
        return (
            <div className='admin-table-root'>
                <h2 className='section-title'>EC2C Users</h2>
                <table className='table-table'>
                    {this.state.tableKeys.map(i => <th>{i}</th>)}
                    <tbody>
                        {this.state.data.map(i =>
                            <tr>
                                <td>{i.username}</td>
                                <td>{i.email}</td>
                                <td>{i.first_login}</td>
                                <td>{i.last_login}</td>
                                <td>{i.is_admin}</td>
                                <button className='action-button' onClick={this.openEditModal}>Modify Memberships</button>
                                {i.email !== this.state.currentUserEmail ?
                                    <button className='action-button' onClick={this.openEditModal}>Delete User</button>
                                    : <></>
                                }
                            </tr>
                        )}
                    </tbody>
                </table>
                <Modal open={this.state.errorModal.errorModalOpen} onClose={this.closeErrorModal} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
                    <Fade in={this.state.errorModal.errorModalOpen}>
                        <Box sx={errorModalStyle}>
                            <h2 className='error-modal-title'>{this.state.errorModal.errorTitle}</h2>
                            <p className='error-modal-text'>{this.state.errorModal.errorMessage}</p>
                            <p className='error-modal-text'>{`Error ID: ${this.state.errorModal.errorID}`}</p>
                        </Box>
                    </Fade>
                </Modal>
                <Modal open={this.state.editModal.editModalOpen} onClose={this.closeEditModal} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
                    <Fade in={this.state.editModal.editModalOpen}>
                        <Box sx={editOptionsModalStyle}>
                            {this.state.editModal.editMode === "Delete User" ? <DeleteUser
                                userToDelete={this.state.userToEdit}
                                userEmailList={this.state.userEmailList}
                                closeEditModal={this.closeEditModal} /> : <></>}
                            {this.state.editModal.editMode === "Modify Memberships" ? <UserMemberships
                                userToEdit={this.state.userToEdit}
                                closeEditModal={this.closeEditModal} /> : <></>}
                        </Box>
                    </Fade>
                </Modal>
            </div>
        )
    }
}
