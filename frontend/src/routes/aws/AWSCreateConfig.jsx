import React, { Component } from 'react';
import { Navigate } from 'react-router-dom';
import { getUserName, getUserEmail, getMsalToken } from '../../helperFunctions/adFunctions';

import ReactLoading from "react-loading";

import Navbar from '../../staticComponents/Navbar';
import Footer from '../../staticComponents/Footer';
import VpcOptions from './components/VpcOptions';
import TransitGatewayOptions from './components/TransitGatewayOptions';
import EgressGwOptions from './components/EgressGwOptions';
import CustGatewayOptions from './components/CustGatewayOptions';
import VirtPrivateGwOptions from './components/VirtPrivateGwOptions';
import NatGatewayOptions from './components/NatGatewayOptions';
import PeeringOptions from './components/PeeringOptions';
import SubnetOptions from './components/SubnetOptions';
import VpnOptions from './components/VpnOptions';
import RouteTables from './components/RouteTables';
import RtAssociationOptions from './components/RtAssociationOptions';
import TgwAttachOptions from './components/TgwAttachOptions';

import Sidebar from './components/Sidebar';
import Tabs from './components/Tabs';

import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';

import { errorModalStyle, loadingModalStyle } from '../../modalStyles';

import axios from 'axios';

import './awsCreateConfig.css';
import './components/sidebar.css';
import '../../componentHelper.css';


const backendURL = process.env.REACT_APP_BACKEND_URL;

export class AWSCreateConfig extends Component {
  constructor(props) {
    super(props);

    let userInfo = {
      name: getUserName(),
      email: getUserEmail()
    }

    if (props.data === "init") {
      this.state = {
        isModal: false,
        canSave: true,
        activeTab: 'main',
        loadingModal: {
          loadingModalOpen: false,
          title: "",
          message: ""
        },
        errorModal: {
          errorModalOpen: false,
          errorTitle: "",
          errorMessage: "",
          errorID: ""
        },
        userInfo: userInfo,
        aws: {
          awsAccount: '',
          awsRegion: '',
          accountList: []
        },
        config: {
          configExists: false,
          configUUID: '',
          configName: '',
        },
        azList: [],
        vpcs: [],
        vpcList: [],
        subnets: [],
        subnetList: [],
        natGateways: [],
        natGatewayList: [],
        transitGWs: [],
        transitGwList: [],
        peerings: [],
        peeringList: [],
        egressGWs: [],
        egressGwList: [],
        customerGWs: [],
        customerGwList: [],
        vpGWs: [],
        vpGwList: [],
        vpnConnections: [],
        vpnList: [],
        routeTables: [],
        routeTableList: [],
        rtAssociations: [],
        tgwAttachments: []
      }
    } else {
      this.state = props.data
    }

    this.updateVPCs = this.updateVPCs.bind(this);
    this.updateSubnets = this.updateSubnets.bind(this);
    this.updatePeerings = this.updatePeerings.bind(this);
    this.postConfig = this.postConfig.bind(this);
    this.updateAccountInfo = this.updateAccountInfo.bind(this);
    this.updateActiveTab = this.updateActiveTab.bind(this);
    this.updateConfigInfo = this.updateConfigInfo.bind(this);
    this.updateNatGateways = this.updateNatGateways.bind(this);
    this.updateEgressGWs = this.updateEgressGWs.bind(this);
    this.updateCustGWs = this.updateCustGWs.bind(this);
    this.updateVPGWs = this.updateVPGWs.bind(this);
    this.updateTGWs = this.updateTGWs.bind(this);
    this.updateVPNs = this.updateVPNs.bind(this);
    this.updateRouteTables = this.updateRouteTables.bind(this);
    this.updateRtAssociations = this.updateRtAssociations.bind(this);
    this.updateTgwAttachments = this.updateTgwAttachments.bind(this);
    this.closeErrorModal = this.closeErrorModal.bind(this);
  }

  updateAccountInfo(awsAccount, awsRegion, azList, accountList) {
    let newAccountList = [];
    for (let i = 0; i < accountList.length; i++) {
      newAccountList.push(accountList[i]);
    }
    if (this.state.activeTab === 'main') {
      this.subnetChild.updateAzList(azList, this.state.isModal);
      this.childPeering.updateAccountList(newAccountList, awsAccount);
    } else {
      this.childVPGs.updateAzList(azList, this.state.isModal);
    }
    this.setState({
      aws: {
        awsAccount: awsAccount,
        awsRegion: awsRegion,
        accountList: accountList
      },
      azList: azList
    })
  }
  updateActiveTab(tab) {
    this.setState({
      activeTab: tab
    })
  }
  updateConfigInfo(configName) {
    this.setState({
      config: {
        configExists: this.state.config.configExists,
        configUUID: this.state.config.configUUID,
        configName: configName
      }
    })
  }

  updateVPCs(data, updatedIndex, action) {
    let vpcList = [];
    for (let i = 0; i < data.length; i++) {
      vpcList.push(data[i].name);
    }
    this.subnetChild.updateVpcList(data, updatedIndex, action);
    this.childPeering.updateVpcList(data, updatedIndex, action);

    let newEgressGWs = this.state.egressGWs;
    let newVpGWs = this.state.vpGWs;
    let newRouteTables = this.state.routeTables;
    let newTgwAttachments = this.state.tgwAttachments;
    let currentVpcList = this.state.vpcList;
    let vpcToUpdate = currentVpcList[updatedIndex];
    if (action === "renameVPC") {
      let newVpcName = data[updatedIndex].name;
      for (let i = 0; i < newEgressGWs.length; i++) {
        if (newEgressGWs[i].attachedVpcName === vpcToUpdate) {
          newEgressGWs[i].attachedVpcName = newVpcName;
        }
      }
      for (let i = 0; i < newVpGWs.length; i++) {
        if (newVpGWs[i].attachedVpcName === vpcToUpdate) {
          newVpGWs[i].attachedVpcName = newVpcName;
        }
      }
      for (let i = 0; i < newRouteTables.length; i++) {
        if (newRouteTables[i].attachedVpcName === vpcToUpdate) {
          newRouteTables[i].attachedVpcName = newVpcName;
        }
      }
      for (let i = 0; i < newTgwAttachments.length; i++) {
        if (newTgwAttachments[i].vpcName === vpcToUpdate) {
          newTgwAttachments[i].vpcName = newVpcName;
        }
      }
    } else if (action === "deleteVPC") {
      for (let i = 0; i < newEgressGWs.length; i++) {
        if (newEgressGWs[i].attachedVpcName === vpcToUpdate) {
          document.getElementById('aws-tab-gws').className += ' blackhole'
        }
      }
      for (let i = 0; i < newVpGWs.length; i++) {
        if (newVpGWs[i].attachedVpcName === vpcToUpdate) {
          document.getElementById('aws-tab-gws').className += ' blackhole'
        }
      }
      for (let i = 0; i < newRouteTables.length; i++) {
        if (newRouteTables[i].attachedVpcName === vpcToUpdate) {
          newRouteTables[i].attachedVpcName = "-- Other --";
          newRouteTables[i].attachedVpcId = "";
          document.getElementById('aws-tab-rts').className += ' blackhole'
        }
      }
      for (let i = 0; i < newTgwAttachments.length; i++) {
        if (newTgwAttachments[i].vpcName === vpcToUpdate) {
          newTgwAttachments[i].vpcName = "-- Choose VPC --";
          newTgwAttachments[i].vpcId = "";
          newTgwAttachments[i].subnetName = "-- Choose Subnet --";
          newTgwAttachments[i].subnetId = "";
          document.getElementById('aws-tab-rts').className += ' blackhole'
        }
      }
    }
    this.setState({
      vpcs: data,
      vpcList: vpcList,
      egressGWs: newEgressGWs,
      vpGWs: newVpGWs,
      routeTables: newRouteTables,
      tgwAttachments: newTgwAttachments
    })
  }

  updateSubnets(data, updatedIndex, action) {
    let subnetList = [];
    for (let i = 0; i < data.length; i++) {
      subnetList.push(data[i].name);
    }

    let newNatGWs = this.state.natGateways;
    let newRtAssociations = this.state.rtAssociations;
    let newTgwAttachments = this.state.tgwAttachments;
    let currentSubnetList = this.state.subnetList;
    let subnetToUpdate = currentSubnetList[updatedIndex];
    if (action === "renameSubnet") {
      let newSubnetName = data[updatedIndex].name;
      for (let i = 0; i < newNatGWs.length; i++) {
        if (newNatGWs[i].subnet === subnetToUpdate) {
          newNatGWs[i].subnet = newSubnetName;
        }
      }
      for (let i = 0; i < newRtAssociations.length; i++) {
        if (newRtAssociations[i].subnetName === subnetToUpdate) {
          newRtAssociations[i].subnetName = newSubnetName;
        }
      }
      for (let i = 0; i < newTgwAttachments.length; i++) {
        if (newTgwAttachments[i].subnetName === subnetToUpdate && this.state.subnets[updatedIndex].parentVPC === newTgwAttachments[i].vpcName) {
          newTgwAttachments[i].subnetName = newSubnetName;
        }
      }
    } else if (action === "deleteSubnet") {
      for (let i = 0; i < newNatGWs.length; i++) {
        if (newNatGWs[i].subnet === subnetToUpdate) {
          newNatGWs[i].subnet = 'BLACKHOLE';
          document.getElementById('aws-tab-gws').className += ' blackhole'
        }
      }
      for (let i = 0; i < newRtAssociations.length; i++) {
        if (newRtAssociations[i].subnetName === subnetToUpdate) {
          newRtAssociations.splice(i, 1);
        }
      }
      for (let i = 0; i < newTgwAttachments.length; i++) {
        if (newTgwAttachments[i].subnetName === subnetToUpdate && this.state.subnets[updatedIndex].parentVPC === newTgwAttachments[i].vpcName) {
          newTgwAttachments[i].subnetName = '-- Choose Subnet --';
          newTgwAttachments[i].subnetId = '';
          document.getElementById('aws-tab-rts').className += ' blackhole'
        }
      }
    }

    this.setState({
      subnets: data,
      subnetList: subnetList,
      natGateways: newNatGWs,
      rtAssociations: newRtAssociations,
      tgwAttachments: newTgwAttachments
    })
  }
  updatePeerings(data, updatedIndex, action) {
    let peeringList = [];
    for (let i = 0; i < data.length; i++) {
      peeringList.push(data[i].name);
    }

    let currentList = this.state.peeringList;
    let itemToUpdate = currentList[updatedIndex];
    let newRouteTables = this.state.routeTables;
    if (action === "renamePeering") {
      let newItemName = data[updatedIndex].name;
      for (let i = 0; i < newRouteTables.length; i++) {
        let routes = newRouteTables[i].routes;
        for (let r = 0; r < routes.length; r++) {
          if (routes[r].targetName === itemToUpdate && routes[r].targetType === "Peering connection") {
            routes[r].targetName = newItemName;
          }
        }
      }
    } else if (action === "deletePeering") {
      let tabHasBlackhole = false;
      for (let i = 0; i < newRouteTables.length; i++) {
        let routes = newRouteTables[i].routes;
        let tableHasBlackhole = false;
        for (let r = 0; r < routes.length; r++) {
          if (routes[r].targetName === itemToUpdate && routes[r].targetType === "Peering connection") {
            routes[r].targetType = '-- Choose Type --';
            routes[r].targetName = '-- Other --';
            routes[r].targetId = "";
            tableHasBlackhole = true;
            tabHasBlackhole = true;
          }
        }
        newRouteTables[i].hasBlackhole = tableHasBlackhole ? true : false;
      }
      if (tabHasBlackhole) {
        document.getElementById('aws-tab-rts').className += ' blackhole'
      }
    }
    this.setState({
      peerings: data,
      peeringList: peeringList,
      routeTables: newRouteTables
    })
  }
  updateNatGateways(data, updatedIndex, action) {
    let natGatewayList = [];
    for (let i = 0; i < data.length; i++) {
      natGatewayList.push(data[i].name);
    }

    let currentList = this.state.natGatewayList;
    let itemToUpdate = currentList[updatedIndex];
    let newRouteTables = this.state.routeTables;
    if (action === "renameGW") {
      let newItemName = data[updatedIndex].name;
      for (let i = 0; i < newRouteTables.length; i++) {
        let routes = newRouteTables[i].routes;
        for (let r = 0; r < routes.length; r++) {
          if (routes[r].targetName === itemToUpdate && routes[r].targetType === "NAT GW") {
            routes[r].targetName = newItemName;
          }
        }
      }
    } else if (action === "deleteGW") {
      let tabHasBlackhole = false;
      for (let i = 0; i < newRouteTables.length; i++) {
        let routes = newRouteTables[i].routes;
        let tableHasBlackhole = false;
        for (let r = 0; r < routes.length; r++) {
          if (routes[r].targetName === itemToUpdate && routes[r].targetType === "NAT GW") {
            routes[r].targetType = '-- Choose Type --';
            routes[r].targetName = '-- Other --';
            routes[r].targetId = "";
            tableHasBlackhole = true;
            tabHasBlackhole = true;
          }
        }
        newRouteTables[i].hasBlackhole = tableHasBlackhole ? true : false;
      }
      if (tabHasBlackhole) {
        document.getElementById('aws-tab-rts').className += ' blackhole'
      }
    }

    this.setState({
      natGateways: data,
      natGatewayList: natGatewayList,
      routeTables: newRouteTables
    })
  }

  updateTGWs(data, updatedIndex, action) {
    let gwList = [];
    for (let i = 0; i < data.length; i++) {
      gwList.push(data[i].name);
    }
    let newVpns = this.state.vpnConnections
    let currentList = this.state.transitGwList;
    let itemToUpdate = currentList[updatedIndex];
    let newRouteTables = this.state.routeTables;
    let newTgwAttachments = this.state.tgwAttachments;
    switch (action) {
      case "renameTGW":
        let newItemName = data[updatedIndex].name;
        for (let i = 0; i < newVpns.length; i++) {
          if (newVpns[i].gwName === itemToUpdate && newVpns[i].gwType === "Transit GW") {
            newVpns[i].gwName = newItemName;
          }
        }

        for (let i = 0; i < newRouteTables.length; i++) {
          let routes = newRouteTables[i].routes;
          for (let r = 0; r < routes.length; r++) {
            if (routes[r].targetName === itemToUpdate && routes[r].targetType === "Transit GW") {
              routes[r].targetName = newItemName;
            }
          }
        }

        for (let i = 0; i < newTgwAttachments.length; i++) {
          if (newTgwAttachments[i].tgwName === itemToUpdate) {
            newTgwAttachments[i].tgwName = newItemName;
          }
        }
        break;
      case "deleteTGW":
        let hasBlackhole = false;
        for (let i = 0; i < newVpns.length; i++) {
          if (newVpns[i].gwName === itemToUpdate && newVpns[i].gwType === "Transit GW") {
            newVpns[i].gwName = "BLACKHOLE";
            hasBlackhole = true;
          }
        }
        if (hasBlackhole) {
          document.getElementById('aws-tab-vpn').className += ' blackhole'
        }

        let tabHasBlackhole = false;
        for (let i = 0; i < newRouteTables.length; i++) {
          let routes = newRouteTables[i].routes;
          let tableHasBlackhole = false;
          for (let r = 0; r < routes.length; r++) {
            if (routes[r].targetName === itemToUpdate && routes[r].targetType === "Transit GW") {
              routes[r].targetType = '-- Choose Type --';
              routes[r].targetName = '-- Other --';
              routes[r].targetId = "";
              tableHasBlackhole = true;
              tabHasBlackhole = true;
            }
          }
          newRouteTables[i].hasBlackhole = tableHasBlackhole ? true : false;
        }
        if (tabHasBlackhole) {
          document.getElementById('aws-tab-rts').className += ' blackhole'
        }

        tabHasBlackhole = false;
        for (let i = 0; i < newTgwAttachments.length; i++) {
          if (newTgwAttachments[i].tgwName === itemToUpdate) {
            newTgwAttachments[i].tgwName = "-- Choose TGW --";
            tabHasBlackhole = true;
          }
        }
        if (tabHasBlackhole) {
          document.getElementById('aws-tab-rts').className += ' blackhole'
        }

        break;

      default:
        break;
    }

    let transitGwList = [];
    for (let i = 0; i < data.length; i++) {
      transitGwList.push(data[i].name);
    }
    this.setState({
      transitGWs: data,
      transitGwList: transitGwList,
      vpnConnections: newVpns,
      routeTables: newRouteTables,
      tgwAttachments: newTgwAttachments
    })
  }
  updateEgressGWs(data, updatedIndex, action) {
    let egressGwList = [];
    for (let i = 0; i < data.length; i++) {
      egressGwList.push(data[i].name);
    }

    let currentList = this.state.egressGwList;
    let itemToUpdate = currentList[updatedIndex];
    let newRouteTables = this.state.routeTables;
    if (action === "renameGW") {
      let newItemName = data[updatedIndex].name;
      for (let i = 0; i < newRouteTables.length; i++) {
        let routes = newRouteTables[i].routes;
        for (let r = 0; r < routes.length; r++) {
          if (routes[r].targetName === itemToUpdate && routes[r].targetType === "Egress GW") {
            routes[r].targetName = newItemName;
          }
        }
      }
    } else if (action === "deleteGW") {
      let tabHasBlackhole = false;
      for (let i = 0; i < newRouteTables.length; i++) {
        let routes = newRouteTables[i].routes;
        let tableHasBlackhole = false;
        for (let r = 0; r < routes.length; r++) {
          if (routes[r].targetName === itemToUpdate && routes[r].targetType === "Egress GW") {
            routes[r].targetType = '-- Choose Type --';
            routes[r].targetName = '-- Other --';
            routes[r].targetId = "";
            tableHasBlackhole = true;
            tabHasBlackhole = true;
          }
        }
        newRouteTables[i].hasBlackhole = tableHasBlackhole ? true : false;
      }
      if (tabHasBlackhole) {
        document.getElementById('aws-tab-rts').className += ' blackhole'
      }
    }

    this.setState({
      egressGWs: data,
      egressGwList: egressGwList,
      routeTables: newRouteTables
    })
  }

  updateCustGWs(data, updatedIndex, action) {
    let gwList = [];
    for (let i = 0; i < data.length; i++) {
      gwList.push(data[i].name);
    }
    let newVpns = this.state.vpnConnections
    let currentGwList = this.state.customerGwList;
    let gwToUpdate = currentGwList[updatedIndex];
    switch (action) {
      case "renameGW":
        let newGwName = data[updatedIndex].name;
        for (let i = 0; i < newVpns.length; i++) {
          if (newVpns[i].custGwName === gwToUpdate) {
            newVpns[i].custGwName = newGwName;
          }
        }
        break;
      case "deleteGW":
        let hasBlackhole = false;
        for (let i = 0; i < newVpns.length; i++) {
          if (newVpns[i].custGwName === gwToUpdate) {
            newVpns[i].custGwName = "BLACKHOLE";
            hasBlackhole = true;
          }
        }
        if (hasBlackhole) {
          document.getElementById('aws-tab-vpn').className += ' blackhole'
        }
        break;

      default:
        break;
    }

    let newGwList = [];
    for (let i = 0; i < data.length; i++) {
      newGwList.push(data[i].name);
    }
    this.setState({
      customerGWs: data,
      customerGwList: newGwList,
      vpnConnections: newVpns
    })
  }

  updateVPGWs(data, updatedIndex, action) {
    let gwList = [];
    for (let i = 0; i < data.length; i++) {
      gwList.push(data[i].name);
    }
    let newVpns = this.state.vpnConnections
    let currentGwList = this.state.vpGwList;
    let itemToUpdate = currentGwList[updatedIndex];
    let newRouteTables = this.state.routeTables;
    switch (action) {
      case "renameGW":
        let newGwName = data[updatedIndex].name;
        for (let i = 0; i < newVpns.length; i++) {
          if (newVpns[i].gwName === itemToUpdate && newVpns[i].gwType === "VPN GW") {
            newVpns[i].gwName = newGwName;
          }
        }

        for (let i = 0; i < newRouteTables.length; i++) {
          let routes = newRouteTables[i].routes;
          for (let r = 0; r < routes.length; r++) {
            if (routes[r].targetName === itemToUpdate && routes[r].targetType === "VP GW") {
              routes[r].targetName = data[updatedIndex].name;;
            }
          }
        }
        break;
      case "deleteGW":
        let hasBlackhole = false;
        for (let i = 0; i < newVpns.length; i++) {
          if (newVpns[i].gwName === itemToUpdate && newVpns[i].gwType === "VPN GW") {
            newVpns[i].gwName = "BLACKHOLE";
            hasBlackhole = true;
          }
        }
        if (hasBlackhole) {
          document.getElementById('aws-tab-vpn').className += ' blackhole'
        }

        let tabHasBlackhole = false;
        for (let i = 0; i < newRouteTables.length; i++) {
          let routes = newRouteTables[i].routes;
          let tableHasBlackhole = false;
          for (let r = 0; r < routes.length; r++) {
            if (routes[r].targetName === itemToUpdate && routes[r].targetType === "VP GW") {
              routes[r].targetType = '-- Choose Type --';
              routes[r].targetName = '-- Other --';
              routes[r].targetId = "";
              tableHasBlackhole = true;
              tabHasBlackhole = true;
            }
          }
          newRouteTables[i].hasBlackhole = tableHasBlackhole ? true : false;
        }
        if (tabHasBlackhole) {
          document.getElementById('aws-tab-rts').className += ' blackhole'
        }
        break;

      default:
        break;
    }

    let newVpGwList = [];
    for (let i = 0; i < data.length; i++) {
      newVpGwList.push(data[i].name);
    }
    this.setState({
      vpGWs: data,
      vpGwList: newVpGwList,
      vpnConnections: newVpns,
      routeTables: newRouteTables
    })
  }

  updateVPNs(data) {
    let vpnList = [];
    for (let i = 0; i < data.length; i++) {
      vpnList.push(data[i].name)
    }
    this.setState({
      vpnConnections: data,
      vpnList: vpnList
    })
  }
  updateRouteTables(data, updatedIndex, action) {
    let routeTableList = [];
    for (let i = 0; i < data.length; i++) {
      routeTableList.push(data[i].name)
    }

    this.childRtAssociations.updateRouteTableList(data, updatedIndex, action);
    this.setState({
      routeTables: data,
      routeTableList: routeTableList
    })
  }

  updateRtAssociations(data) {
    this.setState({
      rtAssociations: data
    })
  }

  updateTgwAttachments(data) {
    this.setState({
      tgwAttachments: data
    })
  }

  closeErrorModal() {
    this.setState({
      errorModal: {
        errorModalOpen: false,
        errorID: ""
      }
    })
  }

  postConfig = async (e) => {
    let numberOfErrors = Array.from(document.getElementsByClassName("blackhole")).length;
    if (numberOfErrors > 0 && e.target.innerText === "Save Configuration") {
      let errorModal = {
        errorModalOpen: true,
        errorTitle: "Input error",
        errorMessage: "Please fix any errors before you save/apply."
      };
      this.setState({
        errorModal: errorModal
      })
    } else {
      let saveMethod = "";
      if (e.target.innerText === "Save Configuration") {
        saveMethod = "save"
      } else if (e.target.innerText === "Cancel") {
        saveMethod = "cancel"
      }
      let loadingModal = {
        title: "Writing configuration files",
        loadingModalOpen: true
      }
      this.setState({
        loadingModal: loadingModal
      })
      switch (saveMethod) {
        case "save":
          if (this.state.canSave) {
            let params = {
              shouldNavigate: false,
              config: this.state.config,
              saveMethod: saveMethod,
              aws: this.state.aws,
              vpcs: this.state.vpcs,
              subnets: this.state.subnets,
              peerings: this.state.peerings,
              natGateways: this.state.natGateways,
              transitGWs: this.state.transitGWs,
              egressGWs: this.state.egressGWs,
              customerGWs: this.state.customerGWs,
              vpGWs: this.state.vpGWs,
              vpnConnections: this.state.vpnConnections,
              routeTables: {
                tables: this.state.routeTables,
                assocs: this.state.rtAssociations,
                tgwAttachments: this.state.tgwAttachments
              }
            }
            const url = `${backendURL}/aws/post-config/`
            let msalToken = getMsalToken();
            axios.defaults.headers.common = {
              'Authorization': `Bearer ${msalToken}`
            };
            await axios.post(url, params)
              .then((res) => {
                this.setState({
                  loadingModal: {
                    loadingModalOpen: false
                  }
                })
                if (this.state.isModal) {
                  this.props.closeEditModal();
                } else {
                  this.setState({
                    shouldNavigate: true
                  })
                }
              })
              .catch((err) => {
                this.setState({
                  loadingModal: {
                    loadingModalOpen: false
                  }
                })
                if (err.code === "ERR_NETWORK") {
                  let errorModal = {
                    errorModalOpen: true,
                    errorTitle: "Backend server error",
                    errorMessage: "Failed to connect to backend. If the issue persists, contact the administrator of the app.",
                  }
                  this.setState({
                    errorModal: errorModal
                  })
                } else {
                  let errorModal = {
                    errorModalOpen: true,
                    errorTitle: err.response.data.error.title,
                    errorMessage: err.response.data.error.message,
                    errorID: err.response.data.error.errorID,
                  }
                  this.setState({
                    errorModal: errorModal
                  })
                }
              })
          } else {
            let errorModal = {
              errorModalOpen: true,
              errorTitle: "Not enough permissions",
              errorMessage: "Please contact an app administrator or the config owner.",
            }
            this.setState({
              errorModal: errorModal
            })
          }
          break;

        case "cancel":
          this.props.closeEditModal();
          break;
      }
    }
  }

  render() {
    return (
      <div className='body-root'>
        {this.state.shouldNavigate ? <Navigate replace to="/configs" /> : <></>}
        {!this.state.isModal ? <Navbar userInfo={this.state.userInfo} /> : <></>}
        <div className='body'>
          <Sidebar aws={this.state.aws}
            isModal={this.state.isModal}
            configName={this.state.config.configName}
            postConfig={this.postConfig}
            updateAccountInfo={this.updateAccountInfo}
            updateConfigInfo={this.updateConfigInfo}
            initConfig={this.initConfig} />
          <Tabs updateActiveTab={this.updateActiveTab} />
          {this.state.activeTab === 'main' ?
            <>
              <VpcOptions data={this.state.vpcs} updateVPCs={this.updateVPCs} />
              <SubnetOptions data={this.state.subnets} vpcList={this.state.vpcList} azList={this.state.azList} updateSubnets={this.updateSubnets} ref={(cs) => this.subnetChild = cs} />
              <PeeringOptions data={this.state.peerings} vpcList={this.state.vpcList} aws={this.state.aws} updatePeerings={this.updatePeerings} ref={(cp) => this.childPeering = cp} />
            </>
            : <></>}
          {this.state.activeTab === 'gws' ?
            <>
              <TransitGatewayOptions data={this.state.transitGWs} updateTGWs={this.updateTGWs} />
              <CustGatewayOptions data={this.state.customerGWs} updateCustGWs={this.updateCustGWs} />
              <VirtPrivateGwOptions data={this.state.vpGWs}
                azList={this.state.azList} vpcList={this.state.vpcList}
                updateVPGWs={this.updateVPGWs}
                ref={(vpg) => this.childVPGs = vpg} />
              <EgressGwOptions data={this.state.egressGWs} vpcList={this.state.vpcList} updateEgressGWs={this.updateEgressGWs} />
              <NatGatewayOptions data={this.state.natGateways} subnetList={this.state.subnetList} updateNatGWs={this.updateNatGateways} ref={(cd) => this.childNatGWs = cd} />
            </>
            : <></>}
          {this.state.activeTab === 'vpn' ?
            <>
              <VpnOptions data={this.state.vpnConnections}
                updateVPNs={this.updateVPNs}
                gateways={{
                  customerGwList: this.state.customerGwList,
                  transitGwList: this.state.transitGwList,
                  vpGwList: this.state.vpGwList
                }} />
            </>
            : <></>}
          {this.state.activeTab === 'rts' ?
            <>
              <RouteTables data={this.state.routeTables}
                vpcList={this.state.vpcList}
                targetList={
                  {
                    transitGwList: this.state.transitGwList,
                    vpGwList: this.state.vpGwList,
                    peeringList: this.state.peeringList,
                    egressGwList: this.state.egressGwList,
                    natGatewayList: this.state.natGatewayList
                  }
                }
                updateRouteTables={this.updateRouteTables} />
              <RtAssociationOptions data={this.state.rtAssociations}
                routeTableList={this.state.routeTableList}
                subnetList={this.state.subnetList}
                ref={(rta) => this.childRtAssociations = rta}
                updateRtAssociations={this.updateRtAssociations}
              />
              <TgwAttachOptions data={this.state.tgwAttachments}
                tgwList={this.state.transitGwList}
                vpcList={this.state.vpcList}
                subnets={this.state.subnets}
                updateTgwAttachments={this.updateTgwAttachments}
              />
            </>
            : <></>}
        </div>
        {!this.state.isModal ? <Footer /> : <></>}
        <Modal open={this.state.errorModal.errorModalOpen} onClose={this.closeErrorModal} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
          <Fade in={this.state.errorModal.errorModalOpen}>
            <Box sx={errorModalStyle}>
              <h2 className='error-modal-title'>{this.state.errorModal.errorTitle}</h2>
              <p className='error-modal-text'>{this.state.errorModal.errorMessage}</p>
              <p className='error-modal-text'>{"Error ID: " + this.state.errorModal.errorID}</p>
            </Box>
          </Fade>
        </Modal>
        <Modal open={this.state.loadingModal.loadingModalOpen} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
          <Fade in={this.state.loadingModal.loadingModalOpen}>
            <Box sx={loadingModalStyle}>
              <>
                <h2 className='error-modal-title'>{this.state.loadingModal.title}</h2>
                <ReactLoading type="bubbles" color="#3fbcf28b"
                  height={100} width={65} />
              </>
            </Box>
          </Fade>
        </Modal>
      </div>
    )
  }
}

export default AWSCreateConfig