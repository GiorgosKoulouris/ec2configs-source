import React, { Component } from 'react';

import './dhGroupsModal.css'
import '../tables.css'

export default class AlgorithmsModal extends Component {
  constructor(props) {
    super(props);
    let data = props.data;
    let EncryptionAlgorithms = ["AES128", "AES256", "AES128-GCM-16", "AES256-GCM-16"];
    let IntegrityAlgorithms = ["SHA1", "SHA2-256", "SHA2-384", "SHA2-512"];
    let algList;
    if (data.type === "Encryption") {
      algList = EncryptionAlgorithms;
    } else {
      algList = IntegrityAlgorithms;
    }
    let initialSet = [];
    for (let i = 0; i < data.currentSet.length; i++) {
      initialSet.push(data.currentSet[i])
    }
    this.state = {
      tableKeys: ["Algorithm", "Active"],
      type: data.type,
      vpnIndex: data.vpnIndex,
      tunnelIndex: data.tunnelIndex,
      phaseIndex: data.phaseIndex,
      initialSet: initialSet,
      currentSet: data.currentSet,
      algList: algList
    }

    this.triggerCheckbox = this.triggerCheckbox.bind(this);
    this.saveCurrentSet = this.saveCurrentSet.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  triggerCheckbox(e) {
    let rowIndex = e.target.parentElement.parentElement.rowIndex;
    let algList = this.state.algList;
    let selectedAlg = algList[rowIndex];
    let currentSet = this.state.currentSet;
    if (currentSet.includes(selectedAlg)) {
      let index = currentSet.indexOf(selectedAlg);
      currentSet.splice(index, 1)
    } else {
      currentSet.push(selectedAlg);
    }

    this.setState({
      currentSet: currentSet
    })
  }

  saveCurrentSet() {
    let setToSave = [];
    let currentSet = this.state.currentSet;
    let algList = this.state.algList;
    for (let i = 0; i < algList.length; i++) {
      if (currentSet.includes(algList[i])) {
        setToSave.push(algList[i]);
      }
    }
    this.props.updateAlgorithms(setToSave, this.state.type, this.state.vpnIndex, this.state.tunnelIndex, this.state.phaseIndex);
  }

  closeModal() {
    this.props.updateAlgorithms(this.state.initialSet, this.state.type, this.state.vpnIndex, this.state.tunnelIndex, this.state.phaseIndex);
  }

  render() {
    return (
      <div className='dh-grp-modal-root'>

        <h1 className='section-title'>{this.state.type === "Encryption" ? "Encryption Algorithms" : "Integrity Algorithms"}</h1>
        <table className='table-table'>
          {this.state.tableKeys.map(i => <th>{i}</th>)}
          <tbody>
            {this.state.algList.map(i =>
              <tr>
                <td>{i}</td>
                <td>
                  {this.state.currentSet.includes(i) ?
                    <input type="checkbox" checked="checked" onClick={this.triggerCheckbox}></input>
                    :
                    <input type="checkbox" onClick={this.triggerCheckbox}></input>
                  }
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className='share-button-section'>
          <div className='share-button-section-inner'>
            <button className='action-button share-save-button' onClick={this.saveCurrentSet}>Save</button>
            <button className='action-button share-save-button' onClick={this.closeModal}>Cancel</button>
          </div>
        </div>
      </div>

    )
  }
}
