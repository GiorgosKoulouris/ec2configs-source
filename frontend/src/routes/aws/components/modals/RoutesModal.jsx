import React, { Component } from 'react';

import './dhGroupsModal.css';
import '../tables.css';
import './routeModal.css';

import { errorModalStyle } from '../../../../modalStyles';


import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';

export default class RoutesModal extends Component {
  constructor(props) {
    super(props);
    let data = props.data;
    let targetPairs = [
      ["-- Choose Type --", []],
      ["Transit GW", props.targetList.transitGwList],
      ["VP GW", props.targetList.vpGwList],
      ["Peering connection", props.targetList.peeringList],
      ["Egress GW", props.targetList.egressGwList],
      ["NAT GW", props.targetList.natGatewayList],
      ["Internet GW", ["Default"]]
    ];
    for (let i = 0; i < targetPairs.length; i++) {
      targetPairs[i][1] = targetPairs[i][1].concat("-- Other --");
    }

    let initialSet = [];
    for (let i = 0; i < data.length; i++) {
      initialSet.push(data[i]);
    }
    this.state = {
      initialSet: initialSet,
      rtIndex: props.tableIndex,
      data: data,
      tableKeys: ["Destination", "Target", "Description", "Actions"],
      targetTypeList: ["-- Choose Type --", "Transit GW", "VP GW", "Peering connection", "Egress GW", "NAT GW", "Network Interface", "Internet GW"],
      targetPairs: targetPairs,
      errorModal: {
        errorModalOpen: false,
        errorTitle: "",
        errorMessage: ""
      }
    }

    this.addRoute = this.addRoute.bind(this);
    this.saveCurrentSet = this.saveCurrentSet.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.updateDestination = this.updateDestination.bind(this);
    this.updateTargetType = this.updateTargetType.bind(this);
    this.updateTargetName = this.updateTargetName.bind(this);
    this.updateTargetId = this.updateTargetId.bind(this);
    this.deleteRoute = this.deleteRoute.bind(this);
    this.updateDescription = this.updateDescription.bind(this);

    this.closeErrorModal = this.closeErrorModal.bind(this);
  }

  closeErrorModal() {
    this.setState({
      errorModal: {
        errorModalOpen: false
      }
    })
  }

  updateTargetType(e) {
    let rowIndex = e.target.parentElement.parentElement.rowIndex;
    let data = this.state.data;
    data[rowIndex].targetType = e.target.value;
    data[rowIndex].targetName = "-- Other --";
    data[rowIndex].targetId = "";
    this.setState({
      data: data
    })
  }
  updateTargetName(e) {
    let rowIndex = e.target.parentElement.parentElement.rowIndex;
    let data = this.state.data;
    data[rowIndex].targetName = e.target.value;
    data[rowIndex].targetId = "";
    this.setState({
      data: data
    })
  }
  updateTargetId(e) {
    let rowIndex = e.target.parentElement.parentElement.rowIndex;
    let data = this.state.data;
    data[rowIndex].targetId = e.target.value;
    this.setState({
      data: data
    })
  }
  updateDestination(e) {
    let rowIndex = e.target.parentElement.parentElement.rowIndex;
    let data = this.state.data;
    data[rowIndex].dest = e.target.value;
    this.setState({
      data: data
    })
  }
  updateDescription(e) {
    let rowIndex = e.target.parentElement.parentElement.rowIndex;
    let data = this.state.data;
    data[rowIndex].name = e.target.value;
    this.setState({
      data: data
    })
  }

  addRoute() {
    let data = this.state.data;
    data.push({ name: "", dest: "", targetType: "-- Choose Type --", targetName: "", targetId: "" })
    this.setState({
      data: data
    })
  }
  deleteRoute(e) {
    let rowIndex = e.target.parentElement.parentElement.rowIndex;
    let data = this.state.data;
    data.splice(rowIndex, 1);
    this.setState({
      data: data
    })
  }

  saveCurrentSet() {
    let modalElement = Array.from(document.getElementsByClassName("dh-grp-modal-root"))
    let numberOfErrors = Array.from(modalElement[0].getElementsByClassName("blackhole")).length;
    if (numberOfErrors > 0) {
      let errorModal = {
        errorModalOpen: true,
        errorTitle: "Input error",
        errorMessage: "Please fix any errors before you save/apply."
      };
      this.setState({
        errorModal: errorModal
      })
    } else {
      this.props.updateRoutes(this.state.data, this.state.rtIndex);
    }
  }

  closeModal() {
    this.props.updateRoutes(this.state.initialSet, this.state.rtIndex);
  }

  render() {
    return (
      <div className='dh-grp-modal-root'>

        <h1 className='section-title'>Edit Routes</h1>
        <table className='table-table'>
          {this.state.tableKeys.map(i => <th>{i}</th>)}
          <tbody>
            {this.state.data.map(i =>
              <tr>
                <td>
                  <input type='text' value={i.dest}
                    className={i.dest !== "" ? 'table-input' : 'table-input blackhole'}
                    onChange={this.updateDestination}></input>
                </td>
                <td>
                  <select className='dropDownMenu' onChange={this.updateTargetType}>
                    {this.state.targetTypeList.map(e =>
                      e === i.targetType ?
                        <option value={e} selected>{e}</option> :
                        <option value={e}>{e}</option>
                    )}
                  </select>
                  {this.state.targetPairs.map(t =>
                    i.targetType === t[0] ?
                      <select className={i.targetName !== "" ? 'dropDownMenu' : 'dropDownMenu blackhole'} onChange={this.updateTargetName}>
                        {t[1].map(e =>
                          e === i.targetName ?
                            <option value={e} selected>{e}</option> :
                            <option value={e}>{e}</option>
                        )}
                      </select>
                      : <></>
                  )}
                  {i.targetType === "Network Interface" || i.targetName === "-- Other --" ?
                    <input type='text' value={i.targetId} onChange={this.updateTargetId}
                      className={i.targetId !== "" ? 'table-input' : 'table-input blackhole'}></input>
                    : <></>}

                </td>
                <td>
                  <input type='text' className={i.name !== "" ? 'table-input' : 'table-input blackhole'}
                    value={i.name} onChange={this.updateDescription}></input>
                </td>
                <td>
                  <button className='action-button' onClick={this.deleteRoute}>Delete</button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <button className='action-button add-button' onClick={this.addRoute}>Add Route</button>
        <div className='share-button-section'>
          <div className='share-button-section-inner'>
            <button className='action-button share-save-button' onClick={this.saveCurrentSet}>Save</button>
            <button className='action-button share-save-button' onClick={this.closeModal}>Cancel</button>
          </div>
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
