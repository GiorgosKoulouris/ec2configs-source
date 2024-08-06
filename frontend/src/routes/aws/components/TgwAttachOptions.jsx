import React, { Component } from 'react';
import './tables.css';

export default class TgwAttachOptions extends Component {
    constructor(props) {
        super(props);

        let tempTgwList = ["-- Choose TGW --"];
        tempTgwList = tempTgwList.concat(props.tgwList, "-- Other --");
        let tempVpcList = ["-- Choose VPC --"];
        tempVpcList = tempVpcList.concat(props.vpcList, "-- Other --");

        let data = props.data;
        for (let i = 0; i < data.length; i++) {
            let tempSubs = ["-- Choose Subnet --"];
            if (data[i].vpcName !== "-- Other --" && data[i].vpcName !== "-- Choose VPC --") {
                for (let s = 0; s < props.subnets.length; s++) {
                    if (props.subnets[s].parentVPC === data[i].vpcName) {
                        tempSubs.push(props.subnets[s].name);
                    }
                }
            }
            data[i].subnetList = tempSubs;
        }

        this.state = {
            data: data,
            tgwList: tempTgwList,
            vpcList: tempVpcList,
            subnets: props.subnets,
            tableKeys: ["Transit GW", "VPC", "Subnet", "Actions"]
        }

        this.addAssoc = this.addAssoc.bind(this);
        this.deleteAssoc = this.deleteAssoc.bind(this);
        this.updateTgwName = this.updateTgwName.bind(this);
        this.updateTgwId = this.updateTgwId.bind(this);
        this.updateVpcName = this.updateVpcName.bind(this);
        this.updateVpcId = this.updateVpcId.bind(this);
        this.updateSubnetName = this.updateSubnetName.bind(this);
        this.updateSubnetId = this.updateSubnetId.bind(this);
    }

    addAssoc() {
        let data = this.state.data;
        data.push({ tgwName: "-- Choose TGW --", tgwId: "", vpcName: "-- Choose VPC --", vpcId: "", subnetList: ["-- Choose Subnet --"], subnetName: "-- Choose Subnet --", subnetId: "" })
        this.props.updateTgwAttachments(data);
    }
    updateTgwName(e) {
        let rowIndex = e.target.parentElement.parentElement.rowIndex;
        let data = this.state.data;
        data[rowIndex].tgwName = e.target.value;
        data[rowIndex].tgwId = "";
        this.props.updateTgwAttachments(data);
    }
    updateTgwId(e) {
        let rowIndex = e.target.parentElement.parentElement.rowIndex;
        let data = this.state.data;
        data[rowIndex].tgwId = e.target.value;
        this.props.updateTgwAttachments(data);
    }
    updateVpcName(e) {
        let rowIndex = e.target.parentElement.parentElement.rowIndex;
        let data = this.state.data;
        data[rowIndex].vpcName = e.target.value;
        data[rowIndex].vpcId = "";

        let subnetList = ["-- Choose Subnet --"];
        if (e.target.value !== "-- Other --" && e.target.value !== "-- Choose VPC --") {
            let subnets = this.state.subnets
            for (let i = 0; i < subnets.length; i++) {
                if (subnets[i].parentVPC === data[rowIndex].vpcName) {
                    subnetList = subnetList.concat(subnets[i].name)
                }
            }
        }
        data[rowIndex].subnetList = subnetList;
        data[rowIndex].subnetName = "-- Choose Subnet --";
        data[rowIndex].subnetId = "";
        this.props.updateTgwAttachments(data);
    }
    updateVpcId(e) {
        let rowIndex = e.target.parentElement.parentElement.rowIndex;
        let data = this.state.data;
        data[rowIndex].vpcId = e.target.value;
        this.props.updateTgwAttachments(data);
    }
    updateSubnetName(e) {
        let rowIndex = e.target.parentElement.parentElement.rowIndex;
        let data = this.state.data;
        data[rowIndex].subnetName = e.target.value;
        this.props.updateTgwAttachments(data);
    }
    updateSubnetId(e) {
        let rowIndex = e.target.parentElement.parentElement.rowIndex;
        let data = this.state.data;
        data[rowIndex].subnetId = e.target.value;
        this.props.updateTgwAttachments(data);
    }
    deleteAssoc(e) {
        let rowIndex = e.target.parentElement.parentElement.rowIndex;
        let data = this.state.data;
        data.splice(rowIndex, 1);
        this.props.updateTgwAttachments(data);
    }

    render() {
        return (
            <div className='table-root'>
                <h2 className='section-title'>Transit Gateway Attachments</h2>
                <table className='table-table'>
                    {this.state.tableKeys.map(h =>
                        <th>{h}</th>
                    )}
                    <tbody>
                        {this.state.data.map(i =>
                            <tr>
                                <td>
                                    <select className={i.tgwName !== "-- Choose TGW --" ? 'dropDownMenu' : 'dropDownMenu blackhole'}
                                        onChange={this.updateTgwName}>
                                        {this.state.tgwList.map(e =>
                                            i.tgwName === e ?
                                                <option value={e} selected>{e}</option> :
                                                <option value={e}>{e}</option>)}
                                    </select>
                                    {i.tgwName === "-- Other --" ?
                                        <input type='text' value={i.tgwId} className={i.tgwId !== "" ? 'table-input' : 'table-input blackhole'}
                                            onChange={this.updateTgwId}>
                                        </input>
                                        : <></>}
                                </td>

                                <td>
                                    <select className={i.vpcName !== "-- Choose VPC --" ? 'dropDownMenu' : 'dropDownMenu blackhole'}
                                        onChange={this.updateVpcName}>
                                        {this.state.vpcList.map(e =>
                                            i.vpcName === e ?
                                                <option value={e} selected>{e}</option> :
                                                <option value={e}>{e}</option>)}
                                    </select>
                                    {i.vpcName === "-- Other --" ?
                                        <input type='text' value={i.vpcId} className={i.vpcId !== "" ? 'table-input' : 'table-input blackhole'}
                                            onChange={this.updateVpcId}>
                                        </input>
                                        : <></>}
                                </td>

                                <td>
                                    {i.vpcName !== "-- Other --" ?
                                        <select className={i.subnetName !== "-- Choose Subnet --" ? 'dropDownMenu' : 'dropDownMenu blackhole'}
                                            onChange={this.updateSubnetName}>
                                            {i.subnetList.map(e =>
                                                i.subnetName === e ?
                                                    <option value={e} selected>{e}</option> :
                                                    <option value={e}>{e}</option>)}
                                        </select>
                                        : <></>}
                                    {i.subnetName === "-- Other --" || i.vpcName === "-- Other --" ?
                                        <input type='text' value={i.subnetId} className={i.subnetId !== "" ? 'table-input' : 'table-input blackhole'}
                                            onChange={this.updateSubnetId}>
                                        </input>
                                        : <></>}
                                </td>

                                <td>
                                    <button className='action-button' onClick={this.deleteAssoc}>Delete</button>
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
