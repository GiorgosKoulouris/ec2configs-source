import React, { Component } from 'react'

export default class EgressGwOptions extends Component {
    constructor(props) {
        super(props);
        let vpcList = ['-- Other --'];
        for (let i = 0; i < props.vpcList.length; i++) {
            vpcList.push(props.vpcList[i]);
        }

        let tempData = props.data;
        let outerBlackhole = false;
        for (let i = 0; i < tempData.length; i++) {
            let innerBlackhole = true;
            let attachedVpcName = tempData[i].attachedVpcName;
            for (let e = 0; e < vpcList.length; e++) {
                if (attachedVpcName === vpcList[e]) {
                    innerBlackhole = false;
                }
            }
            if (innerBlackhole) {
                tempData[i].attachedVpcName = 'BLACKHOLE'
                outerBlackhole = true;
            }
        }
        if (outerBlackhole) {
            vpcList.push('BLACKHOLE');
        }

        this.state = {
            data: tempData,
            vpcList: vpcList,
            tableKeys: ['Name', 'Attached VPC', 'Actions'],
        }
        this.updateGwName = this.updateGwName.bind(this);
        this.updateAttachedVpcName = this.updateAttachedVpcName.bind(this);
        this.updateAttachedVpcId = this.updateAttachedVpcId.bind(this);
        this.deleteGw = this.deleteGw.bind(this);
        this.addGw = this.addGw.bind(this);
    }

    updateGwName(e) {
        let rowIndex = e.target.parentElement.parentElement.rowIndex
        let data = this.state.data
        data[rowIndex].name = e.target.value
        this.props.updateEgressGWs(data, rowIndex, "renameGW");
    }
    updateAttachedVpcName(e) {
        var data = this.state.data;
        var indexToUpdate = e.target.parentElement.parentElement.rowIndex;
        data[indexToUpdate].attachedVpcName = e.target.value;
        var nowHasBlackhole = false;
        var newVpcList = this.state.vpcList;
        let listHadBlackhole = false;
        for (let i = 0; i < this.state.vpcList.length; i++) {
            if (this.state.vpcList[i] === 'BLACKHOLE') {
                listHadBlackhole = true;
            }
        }
        for (let i = 0; i < data.length; i++) {
            if (data[i].attachedVpcName === "BLACKHOLE") {
                nowHasBlackhole = true;
            }
        }
        if (!nowHasBlackhole && listHadBlackhole) {
            let indexToDelete = this.state.vpcList.indexOf("BLACKHOLE");
            newVpcList.splice(indexToDelete, 1);
        }
        // this.state.vpcList = newVpcList;
        this.props.updateEgressGWs(data, indexToUpdate, "updateGW");
    }
    updateAttachedVpcId(e) {
        let data = this.state.data;
        let indexToUpdate = e.target.parentElement.parentElement.rowIndex;
        data[indexToUpdate].attachedVpcId = e.target.value;
        this.props.updateEgressGWs(data, indexToUpdate, "updateGW");
    }

    deleteGw(e) {
        let data = this.state.data;
        let indexToDelete = e.target.parentElement.parentElement.rowIndex;
        data.splice(indexToDelete, 1);
        this.props.updateEgressGWs(data, indexToDelete, "deleteGW");
    }

    addGw() {
        let data = this.state.data;
        // Add element
        data.push({ name: "default", attachedVpcName: this.state.vpcList[0], attachedVpcId: "" })
        // Set State
        this.props.updateEgressGWs(data, -1, "addTgw");
    }

    render() {
        return (
            <div className='table-root'>
                <h2 className='section-title'>Egress Gateways</h2>
                <table className='table-table'>
                    {this.state.tableKeys.map(i => <th>{i}</th>)}
                    <tbody>
                        {this.state.data.map(i =>
                            <tr>
                                <td>
                                    <input type='text' value={i.name} className={i.name !== "" ? 'table-input' : 'table-input blackhole'}
                                        onChange={this.updateGwName}></input>
                                </td>
                                <td>
                                    <select value={i.attachedVpcName} className={i.attachedVpcName !== 'BLACKHOLE' ? 'dropDownMenu' : 'dropDownMenu blackhole'}
                                        onChange={this.updateAttachedVpcName}>
                                        {this.state.vpcList.map(e =>
                                            i.attachedVpcName === e ?
                                                <option value={e} selected>{e}</option> :
                                                <option value={e}>{e}</option>)}
                                    </select>
                                    {i.attachedVpcName === "-- Other --" ?
                                        <input type='text' value={i.attachedVpcId} className={i.attachedVpcId !== "" ? 'table-input' : 'table-input blackhole'}
                                            onChange={this.updateAttachedVpcId}>
                                        </input>
                                        : <></>}
                                </td>
                                <td><button className='action-button' onClick={this.deleteGw}>Delete</button></td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <button className='action-button add-row-button' onClick={this.addGw}>Add Gateway</button>
            </div>
        )
    }
}
