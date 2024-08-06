import React, { Component } from 'react';
import './tables.css';

class CustGatewayOptions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: props.data,
      tableKeys: ['Name', 'BGP ASN', 'IP Address', 'Actions']
    }

    this.updateGatewayName = this.updateGatewayName.bind(this);
    this.updateIP = this.updateIP.bind(this);
    this.updateBgpAsn = this.updateBgpAsn.bind(this);
    this.deleteGateway = this.deleteGateway.bind(this);
    this.addGateway = this.addGateway.bind(this);

  }

  updateGatewayName(e) {
    var rowIndex = e.target.parentElement.parentElement.rowIndex
    var data = this.state.data
    data[rowIndex].name = e.target.value
    this.props.updateCustGWs(data, rowIndex, "renameGW");
  }

  updateIP(e) {
    var data = this.state.data;
    var indexToUpdate = e.target.parentElement.parentElement.rowIndex;
    data[indexToUpdate].ipAddress = e.target.value;
    this.props.updateCustGWs(data, indexToUpdate, "updateGW");
  }

  updateBgpAsn(e) {
    var data = this.state.data;
    var indexToUpdate = e.target.parentElement.parentElement.rowIndex;
    data[indexToUpdate].bgpASN = e.target.value;
    this.props.updateCustGWs(data, indexToUpdate, "updateGW");
  }

  deleteGateway(e) {
    var data = this.state.data;
    var indexToDelete = e.target.parentElement.parentElement.rowIndex;
    data.splice(indexToDelete, 1);
    this.props.updateCustGWs(data, indexToDelete, "deleteGW");
  }

  addGateway() {
    var data = this.state.data;
    data.push({ name: "cust-gw", bgpASN: 65000, ipAddress: "" })
    this.props.updateCustGWs(data, -1, "addGW");
  }

  render() {
    return (
      <div className='table-root'>
        <h2 className='section-title'>Customer Gateways</h2>
        <table className='table-table'>
          {this.state.tableKeys.map(i => <th>{i}</th>)}
          <tbody>
            {this.state.data.map(i =>
              <tr>
                <td><input type='text' value={i.name} className={i.name !== "" ? 'table-input' : 'table-input blackhole'}
                  onChange={this.updateGatewayName}></input></td>
                <td><input type='text' value={i.bgpASN} className={i.bgpASN !== "" ? 'table-input' : 'table-input blackhole'}
                  onChange={this.updateBgpAsn}></input></td>
                <td><input type='text' value={i.ipAddress} className={i.ipAddress !== "" ? 'table-input' : 'table-input blackhole'}
                  onChange={this.updateIP}></input></td>
                <td><button className='action-button' onClick={this.deleteGateway}>Delete</button></td>
              </tr>
            )}
          </tbody>
        </table>
        <button className='action-button add-row-button' onClick={this.addGateway}>Add Gateway</button>
      </div>
    )
  }
}

export default CustGatewayOptions