import React, { Component } from 'react';
import axios from 'axios';

import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';

import AddGroup from './modals/AddGroup';
import GroupMembers from './modals/GroupMembers';

import { errorModalStyle, editOptionsModalStyle } from '../../modalStyles';
import { getMsalToken } from '../../helperFunctions/adFunctions';

import './adminTables.css';

const backendURL = window.frontendConfig.REACT_APP_BACKEND_URL;

export default class Groups extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tableKeys: ["Group Name", "Owner Email", "Created At", "Created By", "Actions"],
            data: [],

            errorModal: {
                errorModalOpen: false,
                errorTitle: "",
                errorMessage: "",
                errorID: ""
            },
            editModal: {
                editModalOpen: false,
                editMode: "addGroup"
            },
        }

        this.closeErrorModal = this.closeErrorModal.bind(this);
        this.closeEditModal = this.closeEditModal.bind(this);
        this.getGroups = this.getGroups.bind(this);
        this.deleteGroup = this.deleteGroup.bind(this);
        this.editMembers = this.editMembers.bind(this);
        this.addGroup = this.addGroup.bind(this);

        this.getGroups();
    }

    closeErrorModal() {
        this.setState({
            errorModal: {
                errorModalOpen: false,
                errorID: ""
            }
        })
    }
    closeEditModal() {
        this.setState({
            editModal: {
                editModalOpen: false,

            }
        })
        this.getGroups();
    }

    getGroups = async () => {
        let msalToken = getMsalToken();
        axios.defaults.headers.common = {
            'Authorization': `Bearer ${msalToken}`
        };
        const url = `${backendURL}/admin/get-groups/`;
        await axios.get(url)
            .then((res) => {
                this.setState({
                    data: res.data.data
                })
            })
            .catch((err) => {
                if (err.code === "ERR_NETWORK") {
                    let errorModal = {
                        errorModalOpen: true,
                        errorTitle: "Backend server error",
                        errorMessage: "Failed to connect to backend. If the issue persists, contact the administrator of the app."
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

    editMembers(e) {
        let index = e.target.parentElement.parentElement.rowIndex;
        let groupToEdit = this.state.data[index].group_name;
        this.setState({
            groupToEdit: groupToEdit,
            editModal: {
                editModalOpen: true,
                editMode: "editMembers"
            }
        })
    }

    deleteGroup = async (e) => {
        let rowIndex = e.target.parentElement.parentElement.rowIndex;
        let groupToDelete = this.state.data[rowIndex].group_name;
        let url = `${backendURL}/admin/groups/delete-group/`;
        let params = {
            groupToDelete: groupToDelete
        }
        let msalToken = getMsalToken();
        axios.defaults.headers.common = {
            'Authorization': `Bearer ${msalToken}`
        };
        await axios.post(url, params)
            .then((res) => {
                this.getGroups();
            })
            .catch((err) => {
                this.setState({
                    errorModal: {
                        errorModalOpen: true,
                        errorTitle: err.response.data.error.title,
                        errorMessage: err.response.data.error.title
                    }
                })
            })
    }

    addGroup() {
        this.setState({
            editModal: {
                editModalOpen: true,
                editMode: "addGroup"
            }
        })

    }

    render() {
        return (
            <div className='admin-table-root'>
                <h2 className='section-title'>EC2C Groups</h2>
                <table className='table-table'>
                    {this.state.tableKeys.map(i => <th>{i}</th>)}
                    <tbody>
                        {this.state.data.map(i =>
                            <tr>
                                <td>{i.group_name}</td>
                                <td>{i.owner_email}</td>
                                <td>{i.created_at}</td>
                                <td>{i.created_by}</td>
                                <td>
                                    <button className='action-button' onClick={this.editMembers}>Edit Members</button>
                                    <button className='action-button'>Change Ownership</button>
                                    <button className='action-button' onClick={this.deleteGroup}>Delete</button>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <button className='action-button admin-table-add-button' onClick={this.addGroup}>Create User Group</button>
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
                            {this.state.editModal.editMode === "addGroup" ? <AddGroup
                                closeEditModal={this.closeEditModal} /> : <></>}
                            {this.state.editModal.editMode === "editMembers" ? <GroupMembers
                                groupToEdit={this.state.groupToEdit}
                                closeEditModal={this.closeEditModal} /> : <></>}
                        </Box>
                    </Fade>
                </Modal>
            </div>
        )
    }
}
