import React, { Component } from 'react';
import './tables.css';

export default class RtAssociationOptions extends Component {
    constructor(props) {
        super(props);

        let tempSubnetList = ["-- Choose Subnet --"];
        tempSubnetList = tempSubnetList.concat(props.subnetList, "-- Other --");
        let tempRtList = ["-- Choose RT --"];
        tempRtList = tempRtList.concat(props.routeTableList, "-- Other --");

        this.state = {
            data: props.data,
            routeTableList: tempRtList,
            subnetList: tempSubnetList,
            tableKeys: ["Route Table", "Subnet", "Actions"]
        }

        this.addAssoc = this.addAssoc.bind(this);
        this.deleteRtAssoc = this.deleteRtAssoc.bind(this);
        this.updateRouteTableName = this.updateRouteTableName.bind(this);
        this.updateRouteTableId = this.updateRouteTableId.bind(this);
        this.updateSubnetName = this.updateSubnetName.bind(this);
        this.updateSubnetId = this.updateSubnetId.bind(this);
        this.updateRouteTableList = this.updateRouteTableList.bind(this);
    }

    addAssoc() {
        let data = this.state.data;
        data.push({ routeTableName: "-- Choose RT --", routeTableId: "", subnetName: "-- Choose Subnet --", subnetId: "" })
        this.props.updateRtAssociations(data);
    }
    updateRouteTableName(e) {
        let rowIndex = e.target.parentElement.parentElement.rowIndex;
        let data = this.state.data;
        data[rowIndex].routeTableName = e.target.value;
        data[rowIndex].routeTableId = "";
        this.props.updateRtAssociations(data);
    }
    updateRouteTableId(e) {
        let rowIndex = e.target.parentElement.parentElement.rowIndex;
        let data = this.state.data;
        data[rowIndex].routeTableId = e.target.value;
        this.props.updateRtAssociations(data);
    }
    updateSubnetName(e) {
        let rowIndex = e.target.parentElement.parentElement.rowIndex;
        let data = this.state.data;
        data[rowIndex].subnetName = e.target.value;
        data[rowIndex].subnetId = "";
        this.props.updateRtAssociations(data);
    }
    updateSubnetId(e) {
        let rowIndex = e.target.parentElement.parentElement.rowIndex;
        let data = this.state.data;
        data[rowIndex].subnetId = e.target.value;
        this.props.updateRtAssociations(data);
    }
    deleteRtAssoc(e) {
        let rowIndex = e.target.parentElement.parentElement.rowIndex;
        let data = this.state.data;
        data.splice(rowIndex, 1);
        this.props.updateRtAssociations(data);
    }
    updateRouteTableList(data, index, action) {
        let newData = this.state.data;
        let currentTableList = this.state.routeTableList;
        let itemToUpdate = currentTableList[index + 1];
        switch (action) {
            case "renameRT":
                let newRtName = data[index].name;
                for (let i = 0; i < newData.length; i++) {
                    if (newData[i].routeTableName === itemToUpdate) {
                        newData[i].routeTableName = newRtName;
                    }
                }
                break;
            case "deleteRT":
                for (let i = 0; i < newData.length; i++) {
                    if (newData[i].routeTableName === itemToUpdate) {
                        newData.splice(i, 1);
                    }
                }
                break;

            default:
                break;
        }

        let newRouteTableList = ["-- Choose RT --"]
        for (let i = 0; i < data.length; i++) {
            newRouteTableList = newRouteTableList.concat(data[i].name);
        }
        newRouteTableList = newRouteTableList.concat("-- Other --");
        this.setState({
            routeTableList: newRouteTableList
        })
        this.props.updateRtAssociations(newData);
    }

    render() {
        return (
            <div className='table-root'>
                <h2 className='section-title'>Route Table Associations</h2>
                <table className='table-table'>
                    {this.state.tableKeys.map(h =>
                        <th>{h}</th>
                    )}
                    <tbody>
                        {this.state.data.map(i =>
                            <tr>
                                <td>
                                    <select className={i.routeTableName !== "-- Choose RT --" ? 'dropDownMenu' : 'dropDownMenu blackhole'}
                                        onChange={this.updateRouteTableName}>
                                        {this.state.routeTableList.map(e =>
                                            i.routeTableName === e ?
                                                <option value={e} selected>{e}</option> :
                                                <option value={e}>{e}</option>)}
                                    </select>
                                    {i.routeTableName === "-- Other --" ?
                                        <input type='text' value={i.routeTableId} className={i.routeTableId !== "" ? 'table-input' : 'table-input blackhole'}
                                            onChange={this.updateRouteTableId}>
                                        </input>
                                        : <></>}
                                </td>

                                <td>
                                    <select className={i.subnetName !== "-- Choose Subnet --" ? 'dropDownMenu' : 'dropDownMenu blackhole'}
                                        onChange={this.updateSubnetName}>
                                        {this.state.subnetList.map(e =>
                                            i.subnetName === e ?
                                                <option value={e} selected>{e}</option> :
                                                <option value={e}>{e}</option>)}
                                    </select>
                                    {i.subnetName === "-- Other --" ?
                                        <input type='text' value={i.subnetId} className={i.subnetId !== "" ? 'table-input' : 'table-input blackhole'}
                                            onChange={this.updateSubnetId}>
                                        </input>
                                        : <></>}
                                </td>

                                <td>
                                    <button className='action-button' onClick={this.deleteRtAssoc}>Delete</button>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <button className='action-button add-button' onClick={this.addAssoc}>Add association</button>
            </div>
        )
    }
}
