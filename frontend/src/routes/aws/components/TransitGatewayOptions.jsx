import React, { Component } from 'react';
import './tables.css';

export default class TransitGatewayOptions extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: props.data,
            tableKeys: ['Name', 'DNS Support', 'VPN ECMP Support', 'Default RT Association', 'Default RT propagation', 'Multicast', 'CIDR', 'Actions'],
            selectOptions: ["enable", "disable"]
        }
        this.updateTgwName = this.updateTgwName.bind(this);
        this.updateTgwCidr = this.updateTgwCidr.bind(this);
        this.updateDnsSupport = this.updateDnsSupport.bind(this);
        this.updateEcmpSupport = this.updateEcmpSupport.bind(this);
        this.updateRtAssoc = this.updateRtAssoc.bind(this);
        this.updateRtProp = this.updateRtProp.bind(this);
        this.updateMulticast = this.updateMulticast.bind(this);
        this.deleteTgw = this.deleteTgw.bind(this);
        this.addTgw = this.addTgw.bind(this);
    }

    updateTgwName(e) {
        let rowIndex = e.target.parentElement.parentElement.rowIndex
        let data = this.state.data
        data[rowIndex].name = e.target.value
        this.props.updateTGWs(data, rowIndex, "renameTGW");
    }
    updateTgwCidr(e) {
        let rowIndex = e.target.parentElement.parentElement.rowIndex
        let data = this.state.data
        data[rowIndex].cidr = e.target.value
        this.props.updateTGWs(data, rowIndex, "updateTGW");
    }
    updateDnsSupport(e) {
        let rowIndex = e.target.parentElement.parentElement.rowIndex
        let data = this.state.data
        data[rowIndex].dnsSupport = e.target.value
        this.props.updateTGWs(data, rowIndex, "updateTGW");
    }
    updateEcmpSupport(e) {
        let rowIndex = e.target.parentElement.parentElement.rowIndex
        let data = this.state.data
        data[rowIndex].ecmpSupport = e.target.value
        this.props.updateTGWs(data, rowIndex, "updateTGW");
    }
    updateRtAssoc(e) {
        let rowIndex = e.target.parentElement.parentElement.rowIndex
        let data = this.state.data
        data[rowIndex].rtAssoc = e.target.value
        this.props.updateTGWs(data, rowIndex, "updateTGW");
    }
    updateRtProp(e) {
        let rowIndex = e.target.parentElement.parentElement.rowIndex
        let data = this.state.data
        data[rowIndex].rtProp = e.target.value
        this.props.updateTGWs(data, rowIndex, "updateTGW");
    }
    updateMulticast(e) {
        let rowIndex = e.target.parentElement.parentElement.rowIndex
        let data = this.state.data
        data[rowIndex].multicast = e.target.value
        this.props.updateTGWs(data, rowIndex, "updateTGW");
    }
    deleteTgw(e) {
        let data = this.state.data;
        let indexToDelete = e.target.parentElement.parentElement.rowIndex;
        // Remove element
        data.splice(indexToDelete, 1);
        this.props.updateTGWs(data, indexToDelete, "deleteTGW");
    }

    addTgw() {
        let data = this.state.data;
        // Add element
        data.push({ name: "default", dnsSupport: "enable", ecmpSupport: "enable", rtAssoc: "enable", rtProp: "enable", cidr: "", multicast: "disable" })
        // Set State
        this.props.updateTGWs(data, -1, "addTgw");
    }

    render() {
        return (
            <div className='table-root'>
                <h2 className='section-title'>Transit Gateways</h2>
                <table className='table-table'>
                    {this.state.tableKeys.map(i => <th>{i}</th>)}
                    <tbody>
                        {this.state.data.map(i =>
                            <tr>
                                <td>
                                    <input type='text' value={i.name} className={i.name !== "" ? 'table-input' : 'table-input blackhole'}
                                        onChange={this.updateTgwName}></input>
                                </td>
                                <td>
                                    <select className='dropDownMenu' onChange={this.updateDnsSupport}>
                                        {this.state.selectOptions.map(e =>
                                            i.dnsSupport === e ?
                                                <option value={e} selected>{e}</option> :
                                                <option value={e}>{e}</option>)}
                                    </select>
                                </td>
                                <td>
                                    <select className='dropDownMenu' onChange={this.updateEcmpSupport}>
                                        {this.state.selectOptions.map(e =>
                                            i.ecmpSupport === e ?
                                                <option value={e} selected>{e}</option> :
                                                <option value={e}>{e}</option>)}
                                    </select>
                                </td>
                                <td>
                                    <select className='dropDownMenu' onChange={this.updateRtAssoc}>
                                        {this.state.selectOptions.map(e =>
                                            i.rtAssoc === e ?
                                                <option value={e} selected>{e}</option> :
                                                <option value={e}>{e}</option>)}
                                    </select>
                                </td>
                                <td>
                                    <select className='dropDownMenu' onChange={this.updateRtProp}>
                                        {this.state.selectOptions.map(e =>
                                            i.rtProp === e ?
                                                <option value={e} selected>{e}</option> :
                                                <option value={e}>{e}</option>)}
                                    </select>
                                </td>
                                <td>
                                    <select className='dropDownMenu' onChange={this.updateMulticast}>
                                        {this.state.selectOptions.map(e =>
                                            i.multicast === e ?
                                                <option value={e} selected>{e}</option> :
                                                <option value={e}>{e}</option>)}
                                    </select>
                                </td>
                                <td>
                                    <input type='text' value={i.cidr} className='table-input' onChange={this.updateTgwCidr}></input>
                                </td>
                                <td><button className='action-button' onClick={this.deleteTgw}>Delete</button></td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <button className='action-button add-row-button' onClick={this.addTgw}>Add Gateway</button>
            </div>
        )
    }
}
