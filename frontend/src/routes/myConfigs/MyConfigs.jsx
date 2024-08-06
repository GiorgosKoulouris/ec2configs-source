import React, { Component } from 'react';

import Navbar from '../../staticComponents/Navbar';
import Footer from '../../staticComponents/Footer';
import AwsCreateConfig from '../aws/AWSCreateConfig';
import AzCreateConfig from '../az/AzCreateConfig';
import UpdateShareModal from './UpdateShareModal';
import PlanLogModal from './PlanLogModal';

import { getUserName, getUserEmail, isUserAdmin, getMsalToken } from '../../helperFunctions/adFunctions';

import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';

import ReactLoading from "react-loading";

import {
  editModalStyle, errorModalStyle, loadingModalStyle,
  editOptionsModalStyle, planLogModalStyle
} from '../../modalStyles';

import axios from 'axios';

import './myConfigs.css';
import '../../global.css';
import { redirect } from 'react-router-dom';

const backendURL = process.env.REACT_APP_BACKEND_URL;

export class MyConfigs extends Component {
  constructor(props) {
    super(props);

    let userInfo = {
      name: getUserName(),
      email: getUserEmail(),
      isAdmin: isUserAdmin()
    }
    this.state = {
      errorModal: {
        errorModalOpen: false,
        errorTitle: "",
        errorMessage: ""
      },
      loadingModal: {
        loadingModalOpen: false,
        title: "",
        message: ""
      },
      planLogModal: {
        planLogModalOpen: false,
        planLogText: "",
        canApply: false,
      },
      updateShareModalOpen: false,
      planLogModalOpen: false,
      selectedConfigUUID: "",
      userInfo: userInfo,
      tableKeys: ['Configuration Name', 'Provider', 'Account', 'Region', 'Owner', 'Created at', 'Modified by', 'Modified at', 'Status', 'Actions', 'Options'],
      data: [],
      sharedOptions: ['true', 'false'],
      editModalOpen: false,
      modalData: [],
      permList: ["Read", "Edit", "Apply", "Full"]
    }

    this.getConfigs = this.getConfigs.bind(this);
    this.editConfig = this.editConfig.bind(this);
    this.modifyConfig = this.modifyConfig.bind(this);
    this.closeEditModal = this.closeEditModal.bind(this);
    this.openUpdateShareModal = this.openUpdateShareModal.bind(this);
    this.closeErrorModal = this.closeErrorModal.bind(this);
    this.closeUpdateShareModal = this.closeUpdateShareModal.bind(this);
    this.closePlanLogModal = this.closePlanLogModal.bind(this);

    this.getConfigs();
  }

  closeErrorModal() {
    this.setState({
      errorModal: {
        errorModalOpen: false
      }
    })
  }

  closePlanLogModal() {
    this.setState({
      planLogModal: {
        planLogModalOpen: false
      }
    })
  }

  closeUpdateShareModal() {
    this.setState({
      updateShareModalOpen: false
    })
  }
  openUpdateShareModal(e) {
    let configIndex = e.target.parentElement.parentElement.rowIndex;
    let configUUID = this.state.data[configIndex].config_uuid;
    let ownerEmail = this.state.data[configIndex].owner_email;
    let permissions = this.state.data[configIndex].permissions;

    let canPerform = false;
    if (this.state.userInfo.isAdmin || ownerEmail === this.state.userInfo.email || permissions === "Full") {
      canPerform = true;
    }

    if (canPerform) {
      this.setState({
        selectedConfigUUID: configUUID,
        updateShareModalOpen: true
      })
    } else {
      let errorModal = {
        errorModalOpen: true,
        errorTitle: "Not enough permissions",
        errorMessage: "Please contact an app administrator or the config owner.",
      }
      this.setState({
        errorModal: errorModal,
        loadingModal: {
          loadingModalOpen: false
        }
      })
    }
  }

  closeEditModal() {
    this.state.editModalOpen = false;
    this.getConfigs();
  }
  getConfigs = async () => {
    const url = `${backendURL}/config-list/`;
    let msalToken = getMsalToken();
    axios.defaults.headers.common = {
      'Authorization': `Bearer ${msalToken}`
    };
    await axios.get(url)
      .then((res) => {
        let tempData = [];
        let resData = res.data.data.configs;

        for (let i = 0; i < resData.length; i++) {
          tempData.push(resData[i])
        }
        this.setState({
          data: tempData
        })
      })
      .catch((err) => {
        if (err.code === "ERR_NETWORK") {
          let errorModal = {
            errorModalOpen: true,
            errorTitle: "Backend server error",
            errorMessage: "Failed to connect to backend. If the issue persists, contact your administrator.",
          }
          this.setState({
            errorModal: errorModal,
            loadingModal: {
              loadingModalOpen: false
            }
          })
        } else if (err.request.status === 401) {
          redirect('/login')
        } else {
          let errorModal = {
            errorModalOpen: true,
            errorTitle: err.response.data.error.title,
            errorMessage: err.response.data.error.message,
            errorID: err.response.data.error.errorID
          }
          this.setState({
            errorModal: errorModal
          })
        }
      })
  }

  editConfig = async (e) => {
    let saveMethod = "Edit"

    let rowIndex = e.target.parentElement.parentElement.rowIndex;
    let configName = this.state.data[rowIndex].config_name;
    let region = this.state.data[rowIndex].region;
    let accountName = this.state.data[rowIndex].account;
    let configUUID = this.state.data[rowIndex].config_uuid;
    let provider = e.target.parentElement.parentElement.getElementsByTagName('td')[1].innerText;
    let isAdmin = this.state.userInfo.isAdmin;
    let permissions = this.state.data[rowIndex].permissions;
    let ownerEmail = this.state.data[rowIndex].owner_email;
    let canSave = false;
    if (isAdmin || permissions !== "Read" || this.state.userInfo.email === ownerEmail) {
      canSave = true;
    }
    let params = {
      saveMethod: saveMethod,
      configUUID: configUUID,
      provider: provider,
    }

    let msalToken = getMsalToken();
    axios.defaults.headers.common = {
      'Authorization': `Bearer ${msalToken}`
    };
    const urlEdit = `${backendURL}/describe-config/`;
    await axios.get(urlEdit, { params })
      .then((res) => {
        let tempData = res.data.data;

        if (provider === "AWS") {
          let vpcList = [];
          for (let i = 0; i < tempData.vpcs.length; i++) {
            vpcList.push(tempData.vpcs[i].name);
          }
          let subnetList = [];
          for (let i = 0; i < tempData.subnets.length; i++) {
            subnetList.push(tempData.subnets[i].name);
          }
          let natGatewayList = [];
          for (let i = 0; i < tempData.natGWs.length; i++) {
            natGatewayList.push(tempData.natGWs[i].name);
          }
          let transitGwList = [];
          for (let i = 0; i < tempData.transitGWs.length; i++) {
            transitGwList.push(tempData.transitGWs[i].name);
          }
          let eggressGwList = [];
          for (let i = 0; i < tempData.egressGWs.length; i++) {
            eggressGwList.push(tempData.egressGWs[i].name);
          }
          let customerGwList = [];
          for (let i = 0; i < tempData.customerGWs.length; i++) {
            customerGwList.push(tempData.customerGWs[i].name);
          }
          let vpGwList = [];
          for (let i = 0; i < tempData.vpGWs.length; i++) {
            vpGwList.push(tempData.vpGWs[i].name);
          }
          let vpnList = [];
          for (let i = 0; i < tempData.vpnConnections.length; i++) {
            vpnList.push(tempData.vpnConnections[i].name);
          }
          let routeTableList = [];
          for (let i = 0; i < tempData.routeTables.tables.length; i++) {
            routeTableList.push(tempData.routeTables.tables[i].name);
          }
          let peeringList = [];
          for (let i = 0; i < tempData.peerings.length; i++) {
            peeringList.push(tempData.peerings[i].name);
          }

          let modalData = {
            isModal: true,
            canSave: canSave,
            activeTab: 'main',
            loadingModal: {
              loadingModalOpen: false,
              title: "",
              message: ""
            },
            errorModal: {
              errorModalopen: false,
              errorTitle: "",
              errorMessage: "",
              errorID: ""
            },
            userInfo: this.state.userInfo,
            aws: {
              awsAccount: accountName,
              awsRegion: region,
              accountList: []
            },
            config: {
              configExists: true,
              configUUID: configUUID,
              configName: configName,
            },
            azList: [],
            vpcs: tempData.vpcs,
            vpcList: vpcList,
            subnets: tempData.subnets,
            subnetList: subnetList,
            natGateways: tempData.natGWs,
            natGatewayList: natGatewayList,
            transitGWs: tempData.transitGWs,
            transitGwList: transitGwList,
            egressGWs: tempData.egressGWs,
            egressGwList: eggressGwList,
            peerings: tempData.peerings,
            peeringList: peeringList,
            customerGWs: tempData.customerGWs,
            customerGwList: customerGwList,
            vpGWs: tempData.vpGWs,
            vpGwList: vpGwList,
            vpnConnections: tempData.vpnConnections,
            vpnList: vpnList,
            routeTables: tempData.routeTables.tables,
            routeTableList: routeTableList,
            rtAssociations: tempData.routeTables.assocs,
            tgwAttachments: tempData.routeTables.tgwAttachments,
          }

          this.setState({
            editModalProvider: "AWS",
            modalData: modalData,
            editModalOpen: true
          })

        } else if (provider === "Azure") {
          let rgList = [];
          for (let i = 0; i < tempData.rgs.length; i++) {
            rgList.push(tempData.rgs[i].name);
          }
          let vpcList = [];
          for (let i = 0; i < tempData.vpcs.length; i++) {
            vpcList.push(tempData.vpcs[i].name);
          }
          let subnetList = [];
          for (let i = 0; i < tempData.subnets.length; i++) {
            subnetList.push(tempData.subnets[i].name);
          }
          let publicIpList = [];
          for (let i = 0; i < tempData.publicIPs.length; i++) {
            publicIpList.push(tempData.publicIPs[i].name);
          }

          let modalData = {
            isModal: true,
            canSave: canSave,
            loadingModal: {
              loadingModalOpen: false,
              title: "",
              message: ""
            },
            activeTab: 'main',
            errorModal: {
              errorModalOpen: false,
              errorTitle: "",
              errorMessage: "",
              errorID: ""
            },
            userInfo: this.state.userInfo,
            az: {
              azSubscription: accountName,
              azRegion: region,
              azSubscriptionList: []
            },
            config: {
              configExists: true,
              configUUID: configUUID,
              configName: configName
            },
            rgs: tempData.rgs,
            rgList: rgList,
            vpcs: tempData.vpcs,
            vpcList: vpcList,
            subnets: tempData.subnets,
            subnetList: subnetList,
            publicIPs: tempData.publicIPs,
            publicIpList: publicIpList
          }

          this.setState({
            editModalProvider: "Azure",
            modalData: modalData,
            editModalOpen: true
          })

        }
      })
      .catch((err) => {
        if (err.code === "ERR_NETWORK") {
          let errorModal = {
            errorModalOpen: true,
            errorTitle: "Backend server error",
            errorMessage: "Failed to connect to backend. If the issue persists, contact the administrator of the app.",
          }
          this.setState({
            errorModal: errorModal,
            loadingModal: {
              loadingModalOpen: false
            }
          })
        } else {
          let errorModal = {
            errorModalOpen: true,
            errorTitle: err.response.data.error.title,
            errorMessage: err.response.data.error.message,
            errorID: err.response.data.error.errorID
          }
          this.setState({
            errorModal: errorModal
          })
        }
      })
  }

  modifyConfig = async (e) => {
    let saveMethod = e.target.innerText;
    let rowIndex = e.target.parentElement.parentElement.rowIndex;
    let configUUID = this.state.data[rowIndex].config_uuid;
    let provider = e.target.parentElement.parentElement.getElementsByTagName('td')[1].innerText;
    let permissions = this.state.data[rowIndex].permissions;
    let ownerEmail = this.state.data[rowIndex].owner_email;
    let canPerform = false;
    if (this.state.userInfo.isAdmin) {
      canPerform = true;
    } else {
      if (saveMethod === "Plan" || saveMethod === "Destroy") {
        if (ownerEmail === this.state.userInfo.email || permissions === "Full" || permissions === "Apply" || permissions === "Edit") {
          canPerform = true;
        }
      } else if (saveMethod === "Delete") {
        if (ownerEmail === this.state.userInfo.email || permissions === "Full") {
          canPerform = true;
        }
      }
    }
    canPerform = true;
    if (canPerform) {
      let params = {
        saveMethod: saveMethod,
        configUUID: configUUID,
        provider: provider,
      }

      let title = "";
      if (saveMethod === "Plan") {
        title = "Planning configuration"
      } else if (saveMethod === "Destroy") {
        title = "Destroying configuration"
      } else if (saveMethod === "Delete") {
        title = "Deleting configuration"
      }
      let loadingModal = {
        title: title,
        loadingModalOpen: true
      }
      this.setState({
        loadingModal: loadingModal
      })
      let msalToken = getMsalToken();
      axios.defaults.headers.common = {
        'Authorization': `Bearer ${msalToken}`
      };
      const urlDelete = `${backendURL}/modify-config/`
      await axios.post(urlDelete, params, { timeout: 90000 })
        .then((res) => {
          if (saveMethod === "Plan") {
            let canApply = false;
            if (ownerEmail === this.state.userInfo.email || permissions === "Full" || permissions === "Apply") {
              canApply = true;
            }
            this.setState({
              loadingModal: {
                loadingModalOpen: false
              },
              planLogModal: {
                planLogModalOpen: true,
                planLogText: res.data.data,
                canApply: canApply,
                configUUID: configUUID,
                provider: provider
              }
            })
          } else {
            this.setState({
              loadingModal: {
                loadingModalOpen: false
              }
            })
            this.getConfigs();
          }
        })
        .catch((err) => {
          if (err.code === "ECONNABORTED") {
            let errorModal = {
              errorModalOpen: true,
              errorTitle: 'Action still pending',
              errorMessage: 'Action may take some time. Please wait until the config is not in a "Pending" state.'
            }
            this.setState({
              errorModal: errorModal,
              loadingModal: {
                loadingModalOpen: false
              }
            })
          } else if (err.code === "ERR_NETWORK") {
            let errorModal = {
              errorModalOpen: true,
              errorTitle: "Backend server error",
              errorMessage: "Failed to connect to backend. If the issue persists, contact the administrator of the app.",
            }
            this.setState({
              errorModal: errorModal,
              loadingModal: {
                loadingModalOpen: false
              }
            })
          } else {
            let errorModal = {
              errorModalOpen: true,
              errorTitle: err.response.data.error.title,
              errorMessage: err.response.data.error.message,
              errorID: err.response.data.error.errorID
            }
            this.setState({
              errorModal: errorModal,
              loadingModal: {
                loadingModalOpen: false
              }
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
        errorModal: errorModal,
        loadingModal: {
          loadingModalOpen: false
        }
      })
    }
  }

  render() {
    return (
      <div className='body-root'>
        <Navbar />
        <div className='config-section-root'>

          <div className='table-root'>
            <h2 className='section-title'>Saved Configurations</h2>
            <table className='table-table'>
              {this.state.tableKeys.map(i => <th>{i}</th>)}
              <tbody>
                {this.state.data.map(i =>
                  <tr>
                    <td>{i.config_name}</td>
                    <td>{i.cloud_provider}</td>
                    <td>{i.account}</td>
                    <td>{i.region}</td>
                    <td>{i.owner_email}</td>
                    <td>{i.created_at}</td>
                    <td>{i.modified_by}</td>
                    <td>{i.modified_at}</td>
                    <td>{i.status}</td>
                    <td>
                      <button className='action-button' onClick={this.editConfig}>
                        {this.state.permList.indexOf(i.permissions) > 0 || this.state.userInfo.isAdmin || i.owner_email === this.state.userInfo.email ? "Edit" : "View"}
                      </button>
                      {this.state.permList.indexOf(i.permissions) >= 1 || this.state.userInfo.isAdmin || i.owner_email === this.state.userInfo.email ?
                        <button className='action-button' onClick={this.modifyConfig}>Plan</button> :
                        <></>}
                      {this.state.permList.indexOf(i.permissions) >= 2 || this.state.userInfo.isAdmin || i.owner_email === this.state.userInfo.email ?
                        <button className='action-button' onClick={this.modifyConfig}>Destroy</button> :
                        <></>}
                      {this.state.permList.indexOf(i.permissions) >= 3 || this.state.userInfo.isAdmin || i.owner_email === this.state.userInfo.email ?
                        <button className='action-button' onClick={this.modifyConfig}>Delete</button> :
                        <></>}
                    </td>
                    <td>
                      <button className='action-button' onClick={this.openUpdateShareModal}>Share</button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <button className='action-button config-refresh-button' onClick={this.getConfigs}>Refresh</button>
        </div>
        <Footer />
        <Modal open={this.state.editModalOpen} onClose={this.closeEditModal} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
          <Fade in={this.state.editModalOpen}>
            <Box sx={editModalStyle}>
              {this.state.editModalProvider === "AWS" ?
                <AwsCreateConfig data={this.state.modalData} closeEditModal={this.closeEditModal} />
                :
                <AzCreateConfig data={this.state.modalData} closeEditModal={this.closeEditModal} />
              }
            </Box>
          </Fade>
        </Modal>
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
        <Modal open={this.state.updateShareModalOpen} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
          <Fade in={this.state.updateShareModalOpen}>
            <Box sx={editOptionsModalStyle}>
              <UpdateShareModal
                configUUID={this.state.selectedConfigUUID}
                closeModal={this.closeUpdateShareModal} />
            </Box>
          </Fade>
        </Modal>
        <Modal open={this.state.planLogModal.planLogModalOpen} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
          <Fade in={this.state.planLogModal.planLogModalOpen}>
            <Box sx={planLogModalStyle}>
              <PlanLogModal
                planLogModal={this.state.planLogModal}
                closePlanLogModal={this.closePlanLogModal}
                reloadConfigs={this.getConfigs} />
            </Box>
          </Fade>
        </Modal>
      </div>
    )
  }
}

export default MyConfigs