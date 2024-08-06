import React, { Component } from 'react';
import './tables.css';
import '../../../componentHelper.css';


class VpcOptions extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: props.data,
      tableKeys: ['VPC Name', 'CIDR Block', 'Tenancy', 'DNS Support', 'DNS Hostnames', 'Actions'],
      tenancyOptions: ['default', 'dedicated'],
      dnsOptions: ['true', 'false']
    }

    this.addVPC = this.addVPC.bind(this);
    this.deleteVPC = this.deleteVPC.bind(this);
    this.updateVpcName = this.updateVpcName.bind(this);
    this.updateVPCBlock = this.updateVPCBlock.bind(this);
    this.updateVPCTenancy = this.updateVPCTenancy.bind(this);
    this.updateVPCDnsSupp = this.updateVPCDnsSupp.bind(this);
    this.updateVPCDnsHostnames = this.updateVPCDnsHostnames.bind(this);
  }

  addVPC() {
    let data = this.state.data;
    // Add element
    data.push({ name: "default-name", cidr: "", tenancy: "default", dnsSupport: "true", dnsHostnames: "true" })
    // Set State
    this.props.updateVPCs(data, 0, "addVPC");
  }
  deleteVPC(e) {
    let data = this.state.data;
    let rowIndex = e.target.parentElement.parentElement.rowIndex
    // Remove element
    data.splice(rowIndex, 1);
    this.props.updateVPCs(data, rowIndex, "deleteVPC");
  }

  updateVpcName(e) {
    let rowIndex = e.target.parentElement.parentElement.rowIndex;
    let data = this.state.data;
    data[rowIndex].name = e.target.value;
    this.props.updateVPCs(data, rowIndex, "renameVPC");
  }
  updateVPCBlock(e) {
    let rowIndex = e.target.parentElement.parentElement.rowIndex;
    let data = this.state.data;
    data[rowIndex].cidr = e.target.value;
    this.props.updateVPCs(data, rowIndex, "updateCIDR");
  }
  updateVPCTenancy(e) {
    let rowIndex = e.target.parentElement.parentElement.rowIndex;
    let data = this.state.data;
    data[rowIndex].tenancy = e.target.value;
    this.props.updateVPCs(data, rowIndex, "updateTenancy");
  }
  updateVPCDnsSupp(e) {
    let rowIndex = e.target.parentElement.parentElement.rowIndex;
    let data = this.state.data;
    data[rowIndex].dnsSupport = e.target.value;
    this.props.updateVPCs(data, rowIndex, "updateDnsSupp");
  }
  updateVPCDnsHostnames(e) {
    let rowIndex = e.target.parentElement.parentElement.rowIndex;
    let data = this.state.data;
    data[rowIndex].dnsHostnames = e.target.value;
    this.props.updateVPCs(data, rowIndex, "updateDnsHostnames");
  }


  render() {
    return (
      <div className='table-root'>
        <h2 className='section-title'>VPC</h2>
        <table className='table-table'>
          {this.state.tableKeys.map(i => <th>{i}</th>)}
          <tbody>
            {this.state.data.map(i =>
              <tr>
                <td><input type='text' value={i.name} className={i.name !== "" ? 'table-input' : 'table-input blackhole'}
                  onChange={this.updateVpcName}></input></td>
                <td><input type='text' value={i.cidr} className={i.cidr !== "" ? 'table-input' : 'table-input blackhole'}
                  onChange={this.updateVPCBlock}></input></td>
                <td><select className='dropDownMenu' onChange={this.updateVPCTenancy}>
                  {this.state.tenancyOptions.map(e => <option value={e}>{e}</option>)}
                </select></td>
                <td><select className='dropDownMenu' onChange={this.updateVPCDnsSupp}>
                  {this.state.dnsOptions.map(e => <option value={e}>{e}</option>)}
                </select></td>
                <td><select className='dropDownMenu' onChange={this.updateVPCDnsHostnames}>
                  {this.state.dnsOptions.map(e => <option value={e}>{e}</option>)}
                </select></td>
                <td><button className='action-button' onClick={this.deleteVPC}>Delete</button></td>
              </tr>
            )}
          </tbody>
        </table>
        <button className='action-button add-row-button' onClick={this.addVPC}>Add VPC</button>
      </div>
    )
  }
}

export default VpcOptions