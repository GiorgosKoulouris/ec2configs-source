import React, { Component } from 'react';
import './tables.css';
import '../../../componentHelper.css';

import { editOptionsModalStyleWide } from '../../../modalStyles';
import RoutesModal from './modals/RoutesModal';

import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';

export default class RouteTables extends Component {
    constructor(props) {
        super(props);
        let vpcList = ["-- Other --"];
        vpcList = vpcList.concat(props.vpcList);
        this.state = {
            data: props.data,
            tableKeys: ["Name", "Attached VPC", "Actions"],
            vpcList: vpcList,
            targetList: props.targetList,
            editRoutesModal: {
                editModalOpen: false,
                tableName: "",
                tableIndex: 0,
                routes: []
            }
        }

        this.addTable = this.addTable.bind(this);
        this.updateTableName = this.updateTableName.bind(this);
        this.updateAttachedVpcName = this.updateAttachedVpcName.bind(this);
        this.updateAttachedVpcId = this.updateAttachedVpcId.bind(this);
        this.deleteTable = this.deleteTable.bind(this);
        this.editRoutes = this.editRoutes.bind(this);
        this.updateRoutes = this.updateRoutes.bind(this);
    }

    addTable() {
        let data = this.state.data;
        data.push({ name: "", attachedVpcName: "-- Other --", attachedVpcId: "", routes: [], hasBlackhole: false })
        this.props.updateRouteTables(data);
    }
    updateTableName(e) {
        let rowIndex = e.target.parentElement.parentElement.rowIndex;
        let data = this.state.data;
        data[rowIndex].name = e.target.value;
        this.props.updateRouteTables(data, rowIndex, "renameRT");
    }
    updateAttachedVpcName(e) {
        let rowIndex = e.target.parentElement.parentElement.rowIndex;
        let data = this.state.data;
        data[rowIndex].attachedVpcName = e.target.value;
        data[rowIndex].attachedVpcId = "";
        this.props.updateRouteTables(data);
    }
    updateAttachedVpcId(e) {
        let rowIndex = e.target.parentElement.parentElement.rowIndex;
        let data = this.state.data;
        data[rowIndex].attachedVpcId = e.target.value;
        this.props.updateRouteTables(data);
    }
    editRoutes(e) {
        let rowIndex = e.target.parentElement.parentElement.rowIndex;
        let routes = this.state.data[rowIndex].routes;
        let tableName = this.state.data[rowIndex].name;
        this.setState({
            editRoutesModal: {
                editModalOpen: true,
                tableIndex: rowIndex,
                routes: routes,
                tableName: tableName
            }
        })
    }
    updateRoutes(routes, index) {
        let data = this.state.data;
        data[index].routes = routes;
        data[index].hasBlackhole = false;
        this.props.updateRouteTables(data);
        this.setState({
            editRoutesModal: {
                editModalOpen: false
            }
        })
    }
    deleteTable(e) {
        let rowIndex = e.target.parentElement.parentElement.rowIndex;
        let data = this.state.data;
        data.splice(rowIndex, 1)
        this.props.updateRouteTables(data, rowIndex, "deleteRT");
    }
    render() {
        return (
            <div className='table-root'>
                <h2 className='section-title'>Route Tables</h2>
                <table className='table-table'>
                    {this.state.tableKeys.map(i => <th>{i}</th>)}
                    <tbody>
                        {this.state.data.map(i =>
                            <tr>
                                <td><input type='text' value={i.name} className={i.name !== "" ? 'table-input' : 'table-input blackhole'}
                                    onChange={this.updateTableName}></input>
                                </td>
                                <td>
                                    <select className='dropDownMenu' onChange={this.updateAttachedVpcName}>
                                        {this.state.vpcList.map(e =>
                                            e === i.attachedVpcName ?
                                                <option value={e} selected>{e}</option> :
                                                <option value={e}>{e}</option>
                                        )}
                                    </select>
                                    {i.attachedVpcName === '-- Other --' ?
                                        <input type='text' value={i.attachedVpcId} className={i.attachedVpcId !== "" ? 'table-input' : 'table-input blackhole'}
                                            onChange={this.updateAttachedVpcId}></input>
                                        : <></>}
                                </td>
                                <td>
                                    <button className={!i.hasBlackhole ? 'action-button' : 'action-button blackhole'}
                                        onClick={this.editRoutes}>Edit Routes</button>
                                    <button className='action-button' onClick={this.deleteTable}>Delete</button>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <button className='action-button add-row-button' onClick={this.addTable}>Add Route Table</button>
                <Modal open={this.state.editRoutesModal.editModalOpen} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
                    <Fade in={this.state.editRoutesModal.editModalOpen}>
                        <Box sx={editOptionsModalStyleWide}>
                            <RoutesModal data={this.state.editRoutesModal.routes}
                                tableIndex={this.state.editRoutesModal.tableIndex}
                                targetList={this.state.targetList}
                                updateRoutes={this.updateRoutes} />
                        </Box>
                    </Fade>
                </Modal>
            </div>
        )
    }
}
