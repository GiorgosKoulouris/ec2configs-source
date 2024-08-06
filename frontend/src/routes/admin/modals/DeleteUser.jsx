
import React, { Component } from 'react';
import axios from 'axios';

import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';

import { errorModalStyle } from '../../../modalStyles';

import './deleteUser.css';

const backendURL = process.env.REACT_APP_BACKEND_URL;

export default class DeleteUser extends Component {
    constructor(props) {
        super(props);
        let userToDelete = props.userToDelete
        let refinedUserList = ["-- Choose User --"];
        for (let i = 0; i < props.userEmailList.length; i++) {
            refinedUserList.push(props.userEmailList[i]);
        }
        if (refinedUserList.includes(userToDelete)) {
            refinedUserList.splice(refinedUserList.indexOf(userToDelete), 1);
        }
        this.state = {
            userToDelete: userToDelete,
            userEmailList: refinedUserList,
            userToTransfer: refinedUserList[0],
            errorModal: {
                errorModalOpen: false,
                errorTitle: "",
                errorMessage: ""
            }
        }
        this.updateUserToTransfer = this.updateUserToTransfer.bind(this);
        this.deleteUser = this.deleteUser.bind(this);

        this.closeErrorModal = this.closeErrorModal.bind(this);
    }

    updateUserToTransfer(e) {
        let userToTransfer = e.target.value;
        this.setState({
            userToTransfer: userToTransfer
        })
    }

    deleteUser = async () => {
        if (this.state.userToTransfer === "-- Choose User --") {
            let errorModal = {
                errorModalOpen: true,
                errorTitle: "Invalid Option",
                errorMessage: "Please choose an active user to transfer ownerships."
            };
            this.setState({
                errorModal: errorModal
            })
        } else {
            const url = `${backendURL}/admin/delete-user/`;
            let params = {
                userToModify: this.state.userToDelete,
                userToTransfer: this.state.userToTransfer
            }

            await axios.post(url, params)
                .then((res) => {
                    this.props.closeEditModal();
                })
                .catch((err) => {
                    let errorModal = {
                        errorModalOpen: true,
                        errorTitle: err.response.data.error.title,
                        errorMessage: err.response.data.error.message,
                    };
                    this.setState({
                        errorModal: errorModal
                    })
                })

        }
    }

    closeErrorModal() {
        this.setState({
            errorModal: {
                errorModalOpen: false
            }
        })
    }

    render() {
        return (
            <div className='delete-user-modal-root'>
                <h2 className='delete-user-modal-title'>Delete user</h2>
                <h3>{this.state.userToDelete}</h3>
                <p className='delete-user-modal-info'>
                    Note that deleting the user will result in them losing all access to shared configurations as well as their group assignments.
                    This is not reversible.<br></br><br></br>
                    Before you proceed, choose another user to transfer the ownership of any configurations or groups currently owned by {this.state.userToDelete}
                </p>
                <select className='dropDownMenu' onChange={this.updateUserToTransfer}>
                    {this.state.userEmailList.map(e =>
                        <option value={e}>{e}</option>
                    )}
                </select>
                <div>
                    <button className='action-button delete-user-modal-button' onClick={this.deleteUser}>Confirm</button>
                    <button className='action-button delete-user-modal-button' onClick={this.props.closeEditModal}>Cancel</button>
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
