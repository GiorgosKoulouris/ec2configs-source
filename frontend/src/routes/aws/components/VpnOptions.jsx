import React, { Component } from 'react';
import './tables.css';
import './vpnOptions.css';
import '../../../componentHelper.css';

import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';

import DhGroupsModal from './modals/DhGroupsModal';
import AlgorithmsModal from './modals/AlgorithmsModal';
import IkeVersionModal from './modals/IkeVersionModal';
import { errorModalStyle, editOptionsModalStyle, editModalStyle } from '../../../modalStyles';

class VpnOptions extends Component {
  constructor(props) {
    super(props);

    let tempCustomerGwList = ["-- Choose GW --", "-- Other --"];
    let customerGwList = tempCustomerGwList.concat(props.gateways.customerGwList);
    let usedCustGws = [];
    for (let i = 0; i < props.data.length; i++) {
      usedCustGws.push(props.data[i].custGwName);
    }
    if (usedCustGws.includes("BLACKHOLE")) {
      customerGwList = customerGwList.concat("BLACKHOLE")
    }

    let tempTransitGwList = ["-- Choose GW --", "-- Other --"];
    let transitGwList = tempTransitGwList.concat(props.gateways.transitGwList);
    let usedTGWs = [];
    for (let i = 0; i < props.data.length; i++) {
      if (props.data[i].gwType === "Transit GW") {
        usedTGWs.push(props.data[i].gwName);
      }
    }
    if (usedTGWs.includes("BLACKHOLE")) {
      transitGwList = transitGwList.concat("BLACKHOLE")
    }

    let tempVpGwList = ["-- Choose GW --", "-- Other --"];
    let vpGwList = tempVpGwList.concat(props.gateways.vpGwList);
    let usedVpGWs = [];
    for (let i = 0; i < props.data.length; i++) {
      if (props.data[i].gwType === "VPN GW") {
        usedVpGWs.push(props.data[i].gwName);
      }
    }
    if (usedVpGWs.includes("BLACKHOLE")) {
      vpGwList = vpGwList.concat("BLACKHOLE")
    }

    this.state = {
      groupEditModal: {
        editModalOpen: false,
        dhOptions: {
          vpnIndex: 0,
          tunnelIndex: 0,
          phaseIndex: 0,
          currentGroups: []
        }
      },
      algoEditModal: {
        editModalOpen: false,
        opts: {
          type: "Encryption",
          vpnIndex: 0,
          tunnelIndex: 0,
          phaseIndex: 0,
          currentSet: []
        }
      },
      ikeVersionModal: {
        editModalOpen: false,
        opts: {
          vpnIndex: 0,
          tunnelIndex: 0,
          currentSet: []
        }
      },
      data: props.data,
      mainTableKeys: ['Name', 'Customer Gateway', "Gateway", "Static Routes Only", "Actions"],
      p1TableKeys: [
        'On Start',
        'IKE Version',
        'PSK',
        'DPD Timeout',
        'DPD Action',
        'P1 DH Groups',
        'P1 Encryption',
        'P1 Integrity',
        'P1 Lifetime'],
      p2TableKeys: [
        'P2 DH Groups',
        'P2 Encryption',
        'P2 Integrity',
        'P2 Lifetime'],
      gatewayOptions: ["VPN GW", "Transit GW"],
      trueFalseOptions: ['true', 'false'],
      customerGwList: customerGwList,
      transitGwList: transitGwList,
      vpGwList: vpGwList,
      onStartOptions: ["add", "start"],
      dpdActionOptions: ["clear", "restart", "none"],
      vpnRoutesTableKeys: ["Name", "CIDR", "Actions"],
    }

    this.addVPN = this.addVPN.bind(this);
    this.deleteVPN = this.deleteVPN.bind(this);
    this.updateVpnName = this.updateVpnName.bind(this);
    this.updateCustGwName = this.updateCustGwName.bind(this);
    this.updateCustGwId = this.updateCustGwId.bind(this);
    this.updateGwType = this.updateGwType.bind(this);
    this.updateGwId = this.updateGwId.bind(this);
    this.updateGwName = this.updateGwName.bind(this);
    this.updateStaticRoutes = this.updateStaticRoutes.bind(this);
    this.updateOnStartAction = this.updateOnStartAction.bind(this);
    this.updateIkeVersion = this.updateIkeVersion.bind(this);
    this.updatePsk = this.updatePsk.bind(this);
    this.updateDpdTimeout = this.updateDpdTimeout.bind(this);
    this.updateDpdAction = this.updateDpdAction.bind(this);
    this.updateP1Encrypt = this.updateP1Encrypt.bind(this);
    this.updateP1Integrity = this.updateP1Integrity.bind(this);
    this.updateP1Lifetime = this.updateP1Lifetime.bind(this);
    this.updateP2Encrypt = this.updateP2Encrypt.bind(this);
    this.updateP2Integrity = this.updateP2Integrity.bind(this);
    this.updateP2Lifetime = this.updateP2Lifetime.bind(this);

    this.openP1DhGroupEditModal = this.openP1DhGroupEditModal.bind(this);
    this.openP2DhGroupEditModal = this.openP2DhGroupEditModal.bind(this);
    this.updateDhGroups = this.updateDhGroups.bind(this);
    this.updateAlgorithms = this.updateAlgorithms.bind(this);
    this.updateIkeVersionData = this.updateIkeVersionData.bind(this);

    this.addStaticRoute = this.addStaticRoute.bind(this);
    this.updateRouteCidr = this.updateRouteCidr.bind(this);
    this.updateRouteName = this.updateRouteName.bind(this);
    this.deleteStaticRoute = this.deleteStaticRoute.bind(this);


    this.closeEditModal = this.closeEditModal.bind(this);
  }

  closeEditModal(groupList, vpnIndex, tunnelIndex, phaseIndex) {
    this.setState({
      groupEditModal: {
        editModalOpen: false
      }
    })
  }

  updateDhGroups(groupList, vpnIndex, tunnelIndex, phaseIndex) {
    let data = this.state.data;
    if (phaseIndex === 1) {
      data[vpnIndex].tunnels[tunnelIndex].p1DhGroups = groupList;
    } else {
      data[vpnIndex].tunnels[tunnelIndex].p2DhGroups = groupList;
    }

    this.setState({
      data: data,
      groupEditModal: {
        editModalOpen: false
      }
    })
  }

  addVPN() {
    let tunnelPrototype = {
      onStartAction: "add",
      ikeVersion: "ikev1",
    }
    let data = this.state.data;
    data.push({
      name: "",
      custGwName: this.state.customerGwList[0],
      custGwId: "",
      gwType: this.state.gatewayOptions[0],
      gwName: "-- Choose GW --",
      gwId: "",
      staticRoutesOnly: "true",
      tunnels: [
        {
          tnlNumber: 1,
          onStartAction: "add",
          ikeVersion: ["ikev2"],
          psk: "",
          dpdTimeout: "40",
          dpdAction: "clear",
          p1Encrypt: ["AES128"],
          p1Integrity: ["SHA1"],
          p1Lifetime: "28800",
          p1DhGroups: ["2"],
          p2DhGroups: ["2"],
          p2Encrypt: ["AES128"],
          p2Integrity: ["SHA1"],
          p2Lifetime: "3600"
        },
        {
          tnlNumber: 2,
          onStartAction: "add",
          ikeVersion: ["ikev2"],
          psk: "",
          dpdTimeout: "40",
          dpdAction: "clear",
          p1Encrypt: ["AES128"],
          p1Integrity: ["SHA1"],
          p1Lifetime: "28800",
          p1DhGroups: ["2"],
          p2DhGroups: ["2"],
          p2Encrypt: ["AES128"],
          p2Integrity: ["SHA1"],
          p2Lifetime: "3600"
        }
      ],
      staticRoutes: []
    })
    this.props.updateVPNs(data, 0, "addVPN");
  }
  deleteVPN(e) {
    let data = this.state.data;
    let rowIndex = e.target.parentElement.parentElement.parentElement.parentElement.parentElement.rowIndex;
    data.splice(rowIndex, 1);
    this.props.updateVPNs(data, rowIndex, "deleteVPN");
  }

  updateVpnName(e) {
    let rowIndex = e.target.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.rowIndex;
    let data = this.state.data;
    data[rowIndex].name = e.target.value;
    this.props.updateVPNs(data, rowIndex, "renameVPN");
  }
  updateCustGwName(e) {
    let rowIndex = e.target.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.rowIndex;
    let data = this.state.data;
    data[rowIndex].custGwName = e.target.value;
    let hasBlackhole = false;
    for (let i = 0; i < data.length; i++) {
      if (data[i].custGwName === "BLACKHOLE") {
        hasBlackhole = true;
      }
    }
    let newCustGwList = this.state.customerGwList;
    if (!hasBlackhole && newCustGwList.includes("BLACKHOLE")) {
      let index = newCustGwList.indexOf("BLACKHOLE")
      newCustGwList.splice(index, 1);
      this.setState({
        customerGwList: newCustGwList
      })
    }
    this.props.updateVPNs(data, rowIndex, "updateCustGw");
  }
  updateCustGwId(e) {
    let rowIndex = e.target.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.rowIndex;
    let data = this.state.data;
    data[rowIndex].custGwId = e.target.value;
    this.props.updateVPNs(data, rowIndex, "updateCustGw");
  }
  updateGwType(e) {
    let rowIndex = e.target.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.rowIndex;
    let data = this.state.data;
    data[rowIndex].gwType = e.target.value;
    data[rowIndex].gwName = "-- Choose GW --";
    data[rowIndex].gwId = "";
    this.props.updateVPNs(data, rowIndex, "updateGw");
  }
  updateGwName(e) {
    let rowIndex = e.target.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.rowIndex;
    let data = this.state.data;
    data[rowIndex].gwName = e.target.value;
    data[rowIndex].gwId = "";

    let hasBlackhole = false;
    for (let i = 0; i < data.length; i++) {
      if (data[i].gwName === "BLACKHOLE" && data[i].gwType === "Transit GW") {
        hasBlackhole = true;
      }
    }
    let newTgwList = this.state.transitGwList;
    if (!hasBlackhole && newTgwList.includes("BLACKHOLE")) {
      let index = newTgwList.indexOf("BLACKHOLE")
      newTgwList.splice(index, 1);
    }

    hasBlackhole = false;
    for (let i = 0; i < data.length; i++) {
      if (data[i].gwName === "BLACKHOLE" && data[i].gwType === "VP GW") {
        hasBlackhole = true;
      }
    }
    let newVpGwList = this.state.vpGwList;
    if (!hasBlackhole && newVpGwList.includes("BLACKHOLE")) {
      let index = newVpGwList.indexOf("BLACKHOLE")
      newVpGwList.splice(index, 1);
    }

    this.setState({
      transitGwList: newTgwList,
      vpGwList: newVpGwList
    })

    this.props.updateVPNs(data, rowIndex, "updateGw");
  }
  updateGwId(e) {
    let rowIndex = e.target.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.rowIndex;
    let data = this.state.data;
    data[rowIndex].gwId = e.target.value;
    this.props.updateVPNs(data, rowIndex, "updateGw");
  }
  updateStaticRoutes(e) {
    let rowIndex = e.target.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.rowIndex;
    let data = this.state.data;
    data[rowIndex].staticRoutesOnly = e.target.value;
    this.props.updateVPNs(data, rowIndex, "updateStaticRoutes");
  }
  updateOnStartAction(e) {
    let rowIndex = e.target.parentElement.parentElement.parentElement.parentElement.rowIndex;
    let tunnelClasses = Array.from(e.target.parentElement.parentElement.parentElement.classList);
    let tunnelIndex;
    if (tunnelClasses.includes('vpn-tunnel-1')) {
      tunnelIndex = 0;
    } else {
      tunnelIndex = 1;
    }
    let data = this.state.data;
    data[rowIndex].tunnels[tunnelIndex].onStartAction = e.target.value;
    this.props.updateVPNs(data, rowIndex, "updateVpnOptions");
  }
  updateIkeVersion(e) {
    let rowIndex = e.target.parentElement.parentElement.parentElement.parentElement.rowIndex;
    let tunnelClasses = Array.from(e.target.parentElement.parentElement.parentElement.classList);
    let tunnelIndex;
    if (tunnelClasses.includes('vpn-tunnel-1')) {
      tunnelIndex = 0;
    } else {
      tunnelIndex = 1;
    }
    let data = this.state.data;
    let currentSet = this.state.data[rowIndex].tunnels[tunnelIndex].ikeVersion;
    let opts = {
      vpnIndex: rowIndex,
      tunnelIndex: tunnelIndex,
      currentSet: currentSet
    }
    this.setState({
      ikeVersionModal: {
        editModalOpen: true,
        opts: opts
      }
    })
  }
  updatePsk(e) {
    let rowIndex = e.target.parentElement.parentElement.parentElement.parentElement.rowIndex;
    let tunnelClasses = Array.from(e.target.parentElement.parentElement.parentElement.classList);
    let tunnelIndex;
    if (tunnelClasses.includes('vpn-tunnel-1')) {
      tunnelIndex = 0;
    } else {
      tunnelIndex = 1;
    }
    let data = this.state.data;
    data[rowIndex].tunnels[tunnelIndex].psk = e.target.value;
    this.props.updateVPNs(data, rowIndex, "updateVpnOptions");
  }
  updateDpdTimeout(e) {
    let rowIndex = e.target.parentElement.parentElement.parentElement.parentElement.rowIndex;
    let tunnelClasses = Array.from(e.target.parentElement.parentElement.parentElement.classList);
    let tunnelIndex;
    if (tunnelClasses.includes('vpn-tunnel-1')) {
      tunnelIndex = 0;
    } else {
      tunnelIndex = 1;
    }
    let data = this.state.data;
    data[rowIndex].tunnels[tunnelIndex].dpdTimeout = e.target.value;
    this.props.updateVPNs(data, rowIndex, "updateVpnOptions");
  }
  updateDpdAction(e) {
    let rowIndex = e.target.parentElement.parentElement.parentElement.parentElement.rowIndex;
    let tunnelClasses = Array.from(e.target.parentElement.parentElement.parentElement.classList);
    let tunnelIndex;
    if (tunnelClasses.includes('vpn-tunnel-1')) {
      tunnelIndex = 0;
    } else {
      tunnelIndex = 1;
    }
    let data = this.state.data;
    data[rowIndex].tunnels[tunnelIndex].dpdAction = e.target.value;
    this.props.updateVPNs(data, rowIndex, "updateVpnOptions");
  }
  updateP1Encrypt(e) {
    let rowIndex = e.target.parentElement.parentElement.parentElement.parentElement.rowIndex;
    let tunnelClasses = Array.from(e.target.parentElement.parentElement.parentElement.classList);
    let tunnelIndex;
    if (tunnelClasses.includes('vpn-tunnel-1')) {
      tunnelIndex = 0;
    } else {
      tunnelIndex = 1;
    }
    let phaseIndex = 1;
    let currentSet = this.state.data[rowIndex].tunnels[tunnelIndex].p1Encrypt;
    let opts = {
      type: "Encryption",
      vpnIndex: rowIndex,
      tunnelIndex: tunnelIndex,
      phaseIndex: phaseIndex,
      currentSet: currentSet
    }
    this.setState({
      algoEditModal: {
        editModalOpen: true,
        opts: opts
      }
    })
  }
  updateP1Integrity(e) {
    let rowIndex = e.target.parentElement.parentElement.parentElement.parentElement.rowIndex;
    let tunnelClasses = Array.from(e.target.parentElement.parentElement.parentElement.classList);
    let tunnelIndex;
    if (tunnelClasses.includes('vpn-tunnel-1')) {
      tunnelIndex = 0;
    } else {
      tunnelIndex = 1;
    }
    let phaseIndex = 1;
    let currentSet = this.state.data[rowIndex].tunnels[tunnelIndex].p1Integrity;
    let opts = {
      type: "Integrity",
      vpnIndex: rowIndex,
      tunnelIndex: tunnelIndex,
      phaseIndex: phaseIndex,
      currentSet: currentSet
    }
    this.setState({
      algoEditModal: {
        editModalOpen: true,
        opts: opts
      }
    })
  }
  updateP1Lifetime(e) {
    let rowIndex = e.target.parentElement.parentElement.parentElement.parentElement.rowIndex;
    let tunnelClasses = Array.from(e.target.parentElement.parentElement.parentElement.classList);
    let tunnelIndex;
    if (tunnelClasses.includes('vpn-tunnel-1')) {
      tunnelIndex = 0;
    } else {
      tunnelIndex = 1;
    }
    let data = this.state.data;
    data[rowIndex].tunnels[tunnelIndex].p1Lifetime = e.target.value;
    this.props.updateVPNs(data, rowIndex, "updateVpnOptions");
  }
  openP1DhGroupEditModal(e) {
    let rowIndex = e.target.parentElement.parentElement.parentElement.parentElement.rowIndex;
    let tunnelClasses = Array.from(e.target.parentElement.parentElement.parentElement.classList);
    let tunnelIndex;
    if (tunnelClasses.includes('vpn-tunnel-1')) {
      tunnelIndex = 0;
    } else {
      tunnelIndex = 1;
    }
    let phaseIndex = 1;
    let data = this.state.data;
    let currentGroups = data[rowIndex].tunnels[tunnelIndex].p1DhGroups
    this.setState({
      groupEditModal: {
        editModalOpen: true,
        dhOptions: {
          vpnIndex: rowIndex,
          tunnelIndex: tunnelIndex,
          phaseIndex: phaseIndex,
          currentGroups: currentGroups
        }
      }
    })
  }

  updateP2Encrypt(e) {
    let rowIndex = e.target.parentElement.parentElement.parentElement.parentElement.rowIndex;
    let tunnelClasses = Array.from(e.target.parentElement.parentElement.parentElement.classList);
    let tunnelIndex;
    if (tunnelClasses.includes('vpn-tunnel-1')) {
      tunnelIndex = 0;
    } else {
      tunnelIndex = 1;
    }
    let phaseIndex = 2;
    let currentSet = this.state.data[rowIndex].tunnels[tunnelIndex].p2Encrypt;
    let opts = {
      type: "Encryption",
      vpnIndex: rowIndex,
      tunnelIndex: tunnelIndex,
      phaseIndex: phaseIndex,
      currentSet: currentSet
    }
    this.setState({
      algoEditModal: {
        editModalOpen: true,
        opts: opts
      }
    })
  }
  updateP2Integrity(e) {
    let rowIndex = e.target.parentElement.parentElement.parentElement.parentElement.rowIndex;
    let tunnelClasses = Array.from(e.target.parentElement.parentElement.parentElement.classList);
    let tunnelIndex;
    if (tunnelClasses.includes('vpn-tunnel-1')) {
      tunnelIndex = 0;
    } else {
      tunnelIndex = 1;
    }
    let phaseIndex = 2;
    let currentSet = this.state.data[rowIndex].tunnels[tunnelIndex].p2Integrity;
    let opts = {
      type: "Integrity",
      vpnIndex: rowIndex,
      tunnelIndex: tunnelIndex,
      phaseIndex: phaseIndex,
      currentSet: currentSet
    }
    this.setState({
      algoEditModal: {
        editModalOpen: true,
        opts: opts
      }
    })
  }
  updateP2Lifetime(e) {
    let rowIndex = e.target.parentElement.parentElement.parentElement.parentElement.rowIndex;
    let tunnelClasses = Array.from(e.target.parentElement.parentElement.parentElement.classList);
    let tunnelIndex;
    if (tunnelClasses.includes('vpn-tunnel-1')) {
      tunnelIndex = 0;
    } else {
      tunnelIndex = 1;
    }
    let data = this.state.data;
    data[rowIndex].tunnels[tunnelIndex].p2Lifetime = e.target.value;
    this.props.updateVPNs(data, rowIndex, "updateVpnOptions");
  }
  openP2DhGroupEditModal(e) {
    let rowIndex = e.target.parentElement.parentElement.parentElement.parentElement.rowIndex;
    let tunnelClasses = Array.from(e.target.parentElement.parentElement.parentElement.classList);
    let tunnelIndex;
    if (tunnelClasses.includes('vpn-tunnel-1')) {
      tunnelIndex = 0;
    } else {
      tunnelIndex = 1;
    }
    let phaseIndex = 2;
    let data = this.state.data;
    let currentGroups = data[rowIndex].tunnels[tunnelIndex].p2DhGroups
    this.setState({
      groupEditModal: {
        editModalOpen: true,
        dhOptions: {
          vpnIndex: rowIndex,
          tunnelIndex: tunnelIndex,
          phaseIndex: phaseIndex,
          currentGroups: currentGroups
        }
      }
    })
  }
  updateAlgorithms(setList, type, vpnIndex, tunnelIndex, phaseIndex) {
    let data = this.state.data;
    if (phaseIndex === 1) {
      if (type === "Encryption") {
        data[vpnIndex].tunnels[tunnelIndex].p1Encrypt = setList;
      } else {
        data[vpnIndex].tunnels[tunnelIndex].p1Integrity = setList;
      }
    } else {
      if (type === "Encryption") {
        data[vpnIndex].tunnels[tunnelIndex].p2Encrypt = setList;
      } else {
        data[vpnIndex].tunnels[tunnelIndex].p2Integrity = setList;
      }
    }

    this.setState({
      data: data,
      algoEditModal: {
        editModalOpen: false
      }
    })
  }
  updateIkeVersionData(setList, type, vpnIndex, tunnelIndex) {
    let data = this.state.data;
    data[vpnIndex].tunnels[tunnelIndex].ikeVersion = setList;

    this.setState({
      data: data,
      ikeVersionModal: {
        editModalOpen: false
      }
    })
  }
  addStaticRoute(e) {
    let vpnIndex = e.target.parentElement.parentElement.rowIndex;
    let data = this.state.data;
    data[vpnIndex].staticRoutes.push({
      name: "",
      cidr: ""
    })
    this.setState({
      data: data
    })
  }
  updateRouteCidr(e) {
    let vpnIndex = e.target.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.rowIndex;
    let routeIndex = e.target.parentElement.parentElement.rowIndex;
    let data = this.state.data;
    data[vpnIndex].staticRoutes[routeIndex].cidr = e.target.value;
    this.setState({
      data: data
    })
  }
  updateRouteName(e) {
    let vpnIndex = e.target.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.rowIndex;
    let routeIndex = e.target.parentElement.parentElement.rowIndex;
    let data = this.state.data;
    data[vpnIndex].staticRoutes[routeIndex].name = e.target.value;
    this.setState({
      data: data
    })
  }
  deleteStaticRoute(e) {
    let vpnIndex = e.target.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.rowIndex;
    let routeIndex = e.target.parentElement.parentElement.rowIndex;
    let data = this.state.data;
    data[vpnIndex].staticRoutes.splice(routeIndex, 1);
    this.setState({
      data: data
    })
  }


  render() {
    return (
      <div className='table-root'>
        <h2 className='section-title'>VPN Connections</h2>
        <table className='vpn-container'>
          {this.state.data.map(i =>
            <tr className='vpn-tr'>
              <div className='vpn-gnrl-container'>
                <h3 className='vpn-gnrl-section-title'>General configuration</h3>
                <table className='table-table'>
                  {this.state.mainTableKeys.map(t => <th classname='vpn-table-header'>{t}</th>)}
                  <tbody>
                    <tr>
                      <td>
                        <input value={i.name} className={i.name !== "" ? 'table-input' : 'table-input blackhole'}
                          onChange={this.updateVpnName}></input>
                      </td>
                      <td>
                        <select className={i.custGwName !== "-- Choose GW --" && i.custGwName !== "BLACKHOLE" ? 'dropDownMenu' : 'dropDownMenu blackhole'}
                          onChange={this.updateCustGwName}>
                          {this.state.customerGwList.map(cgw =>
                            i.custGwName === cgw ?
                              <option value={cgw} selected>{cgw}</option> :
                              <option value={cgw}>{cgw}</option>)}
                        </select>
                        {i.custGwName === "-- Other --" ?
                          <input value={i.custGwId} className={i.custGwId !== "" ? 'table-input' : 'table-input blackhole'}
                            onChange={this.updateCustGwId}></input>
                          : <></>}</td>
                      <td>
                        <select value={i.gwType} onChange={this.updateGwType} className='dropDownMenu'>
                          {this.state.gatewayOptions.map(gwo =>
                            i.gwType === gwo ?
                              <option selected>{gwo}</option> :
                              <option>{gwo}</option>
                          )}
                        </select>
                        {i.gwType === "VPN GW" ?
                          <select value={i.gwName} onChange={this.updateGwName}
                            className={i.gwName !== '-- Choose GW --' && i.gwName !== 'BLACKHOLE' ? 'dropDownMenu' : 'dropDownMenu blackhole'}>
                            {this.state.vpGwList.map(gwn =>
                              i.gwName === gwn ?
                                <option selected>{gwn}</option> :
                                <option>{gwn}</option>
                            )}
                          </select>
                          : <></>}
                        {i.gwType === "Transit GW" ?
                          <select value={i.gwName} onChange={this.updateGwName}
                            className={i.gwName !== '-- Choose GW --' && i.gwName !== 'BLACKHOLE' ? 'dropDownMenu' : 'dropDownMenu blackhole'}>
                            {this.state.transitGwList.map(gwn =>
                              i.gwName === gwn ?
                                <option selected>{gwn}</option> :
                                <option>{gwn}</option>
                            )}
                          </select>
                          : <></>}
                        {i.gwName === "-- Other --" ?
                          <input value={i.gwId} className={i.gwId !== "" ? 'table-input' : 'table-input blackhole'}
                            onChange={this.updateGwId}></input>
                          : <></>}
                      </td>
                      <td>
                        <select value={i.staticRoutesOnly} onChange={this.updateStaticRoutes} className={i.staticRoutesOnly !== '-- Choose GW --' ? 'dropDownMenu' : 'dropDownMenu blackhole'}>
                          {this.state.trueFalseOptions.map(sro =>
                            i.staticRoutesOnly === sro ?
                              <option selected>{sro}</option> :
                              <option>{sro}</option>
                          )}
                        </select>
                      </td>
                      <td>
                        <button className='action-button' onClick={this.deleteVPN}>Delete</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {i.tunnels.map(tnl =>
                <div className={tnl.tnlNumber === 1 ? 'vpn-tunnel-section vpn-tunnel-1' : 'vpn-tunnel-section vpn-tunnel-2'}>
                  <h3 className='vpn-tunnel-title'>{tnl.tnlNumber === 1 ? 'Tunnel 1' : 'Tunnel 2'}</h3>
                  <div className='vpn-phase-container vpn-phase-container-p1'>
                    <h3 className='vpn-phase-title'>Phase 1</h3>
                    <div className='vpn-phase-row'>
                      <label className='vpn-phase-row-label'>On Start</label>
                      <select value={tnl.onStartAction} onChange={this.updateOnStartAction} className='dropDownMenu' >
                        {this.state.onStartOptions.map(oso =>
                          tnl.onStartAction === oso ?
                            <option selected>{oso}</option> :
                            <option>{oso}</option>
                        )}
                      </select>
                    </div>
                    <div className='vpn-phase-row'>
                      <label className='vpn-phase-row-label'>IKE Version</label>
                      <button className='action-button' onClick={this.updateIkeVersion}>Edit</button>
                    </div>
                    <div className='vpn-phase-row'>
                      <label className='vpn-phase-row-label'>PSK</label>
                      <input value={tnl.psk} className='table-input' onChange={this.updatePsk}></input>
                    </div>
                    <div className='vpn-phase-row'>
                      <label className='vpn-phase-row-label'>DPD Timeout</label>
                      <input value={tnl.dpdTimeout} className={tnl.dpdTimeout !== "" ? 'table-input' : 'table-input blackhole'}
                        onChange={this.updateDpdTimeout}></input>
                    </div>
                    <div className='vpn-phase-row'>
                      <label className='vpn-phase-row-label'>DPD Action</label>
                      <select value={tnl.dpdAction} onChange={this.updateDpdAction} className='dropDownMenu' >
                        {this.state.dpdActionOptions.map(dpda =>
                          tnl.dpdAction === dpda ?
                            <option selected>{dpda}</option> :
                            <option>{dpda}</option>
                        )}
                      </select>
                    </div>
                    <div className='vpn-phase-row'>
                      <label className='vpn-phase-row-label'>DH Groups</label>
                      <button className='action-button' onClick={this.openP1DhGroupEditModal}>Edit</button>
                    </div>
                    <div className='vpn-phase-row'>
                      <label className='vpn-phase-row-label'>Encryption Alg</label>
                      <button className='action-button' onClick={this.updateP1Encrypt}>Edit</button>
                    </div>
                    <div className='vpn-phase-row'>
                      <label className='vpn-phase-row-label'>Integrity Alg</label>
                      <button className='action-button' onClick={this.updateP1Integrity}>Edit</button>
                    </div>
                    <div className='vpn-phase-row'>
                      <label className='vpn-phase-row-label'>Lifetime</label>
                      <input value={tnl.p1Lifetime} className={tnl.p1Lifetime !== "" ? 'table-input' : 'table-input blackhole'}
                        onChange={this.updateP1Lifetime}></input>
                    </div>
                  </div>

                  <div className='vpn-phase-container vpn-phase-container-p2'>
                    <h3 className='vpn-phase-title'>Phase 2</h3>
                    <div className='vpn-phase-row'>
                      <label className='vpn-phase-row-label'>Encryption Alg</label>
                      <button className='action-button' onClick={this.updateP2Encrypt}>Edit</button>
                    </div>
                    <div className='vpn-phase-row'>
                      <label className='vpn-phase-row-label'>Integrity Alg</label>
                      <button className='action-button' onClick={this.updateP2Integrity}>Edit</button>
                    </div>
                    <div className='vpn-phase-row'>
                      <label className='vpn-phase-row-label'>DH Groups</label>
                      <button className='action-button' onClick={this.openP2DhGroupEditModal}>Edit</button>
                    </div>
                    <div className='vpn-phase-row'>
                      <label className='vpn-phase-row-label'>Lifetime</label>
                      <input value={tnl.p2Lifetime} className={tnl.p2Lifetime !== "" ? 'table-input' : 'table-input blackhole'}
                        onChange={this.updateP2Lifetime}></input>
                    </div>
                  </div>
                </div>
              )}
              <div className='vpn-route-table-container'>
                <h3 className='vpn-routes-table-title'>Static Routes</h3>
                <table className='table-table'>
                  {this.state.vpnRoutesTableKeys.map(e =>
                    <th>{e}</th>
                  )}
                  <tbody>
                    {i.staticRoutes.map(r =>
                      <tr>
                        <td>
                          <input value={r.name} type="text" className={r.name !== "" ? 'table-input' : 'table-input blackhole'} onChange={this.updateRouteName}></input>
                        </td>
                        <td>
                          <input value={r.cidr} type="text" className={r.cidr !== "" ? 'table-input' : 'table-input blackhole'} onChange={this.updateRouteCidr}></input>
                        </td>
                        <td>
                          <button className='action-button' onClick={this.deleteStaticRoute}>Delete</button>
                        </td>
                      </tr>
                    )}

                  </tbody>
                </table>
                <button className='action-button' onClick={this.addStaticRoute}>Add Route</button>
              </div>
            </tr>

          )}
        </table>
        <button className='action-button vpn-add-row-button' onClick={this.addVPN}>Add VPN</button>
        <Modal open={this.state.groupEditModal.editModalOpen} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
          <Fade in={this.state.groupEditModal.editModalOpen}>
            <Box sx={editOptionsModalStyle}>
              <DhGroupsModal data={this.state.groupEditModal.dhOptions}
                updateGroups={this.updateDhGroups} />
            </Box>
          </Fade>
        </Modal>
        <Modal open={this.state.algoEditModal.editModalOpen} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
          <Fade in={this.state.algoEditModal.editModalOpen}>
            <Box sx={editOptionsModalStyle}>
              <AlgorithmsModal data={this.state.algoEditModal.opts} updateAlgorithms={this.updateAlgorithms} />
            </Box>
          </Fade>
        </Modal>
        <Modal open={this.state.ikeVersionModal.editModalOpen} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
          <Fade in={this.state.ikeVersionModal.editModalOpen}>
            <Box sx={editOptionsModalStyle}>
              <IkeVersionModal data={this.state.ikeVersionModal.opts} updateIkeVersion={this.updateIkeVersionData} />
            </Box>
          </Fade>
        </Modal>

      </div>

    )
  }
}

export default VpnOptions