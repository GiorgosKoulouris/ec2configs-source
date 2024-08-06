import React, { Component } from 'react';
import { Navigate } from 'react-router-dom';
import { getUserName, getUserEmail, getMsalToken } from '../../helperFunctions/adFunctions';

import Tabs from './components/Tabs';
import Sidebar from './components/Sidebar';
import RgOptions from './components/RgOptions';
import VpcOptions from './components/VpcOptions';
import SubnetOptions from './components/SubnetOptions';
import PublicIpOptions from './components/PublicIpOptions';

import Navbar from '../../staticComponents/Navbar';
import Footer from '../../staticComponents/Footer';

import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';

import ReactLoading from "react-loading";

import { errorModalStyle, loadingModalStyle } from '../../modalStyles';

import axios from 'axios';

import './azCreateConfig.css';


const backendURL = process.env.REACT_APP_BACKEND_URL;

export default class AzCreateConfig extends Component {
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
        userInfo: userInfo,
        az: {
          azSubscription: '',
          azRegion: '',
          azSubscriptionList: []
        },
        config: {
          configExists: false,
          configUUID: '',
          configName: '',
        },
        rgs: [],
        rgList: [],
        vpcs: [],
        vpcList: [],
        subnets: [],
        subnetList: [],
        publicIPs: [],
        publicIpList: []
      }
    } else {
      this.state = props.data
    }
    this.updateActiveTab = this.updateActiveTab.bind(this);

    this.updateAccountInfo = this.updateAccountInfo.bind(this);
    this.updateConfigInfo = this.updateConfigInfo.bind(this);
    this.updateRGs = this.updateRGs.bind(this);
    this.updateVPCs = this.updateVPCs.bind(this);
    this.updateSubnets = this.updateSubnets.bind(this);
    this.updatePIPs = this.updatePIPs.bind(this);
    this.postConfig = this.postConfig.bind(this);

    this.closeErrorModal = this.closeErrorModal.bind(this);

  }
  updateActiveTab(tab) {
    this.setState({
      activeTab: tab
    })
  }

  updateAccountInfo(azSubscription, azRegion, azSubscriptionList) {
    this.setState({
      az: {
        azSubscription: azSubscription,
        azRegion: azRegion,
        azSubscriptionList: azSubscriptionList
      }
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

  updateRGs(data, row, action) {
    let newRgList = []
    for (let i = 0; i < data.length; i++) {
      newRgList.push(data[i].name)
    }
    this.childVPCs.updateRgList(newRgList, row, action);
    this.subnetChild.updateRgList(newRgList, row, action);
    this.pipChild.updateRgList(newRgList, row, action);
    this.setState({
      rgs: data,
      rgList: newRgList
    })
  }

  updateVPCs(data, row, action) {
    let newVpcList = []
    for (let i = 0; i < data.length; i++) {
      newVpcList.push(data[i].name);
    }
    this.setState({
      vpcs: data,
      vpcList: newVpcList
    })

    this.subnetChild.updateVpcList(newVpcList, row, action)
  }

  updateSubnets(data, row, action) {
    let newSubnetList = []
    for (let i = 0; i < data.length; i++) {
      newSubnetList.push(data[i].name);
    }
    this.setState({
      subnets: data,
      subnetList: newSubnetList
    })
  }

  updatePIPs(data, row, action) {
    let newPipList = []
    for (let i = 0; i < data.length; i++) {
      newPipList.push(data[i].name);
    }
    this.setState({
      publicIPs: data,
      publicIpList: newPipList
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
              az: this.state.az,
              rgs: this.state.rgs,
              vpcs: this.state.vpcs,
              subnets: this.state.subnets,
              publicIPs: this.state.publicIPs
            }
            const url = `${backendURL}/az/post-config/`
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

  closeErrorModal() {
    this.setState({
      errorModal: {
        errorModalOpen: false,
        errorID: ""
      }
    })
  }

  render() {
    return (
      <div className='body-root'>
        {this.state.shouldNavigate ? <Navigate replace to="/configs" /> : <></>}
        {!this.state.isModal ? <Navbar userInfo={this.state.userInfo} /> : <></>}
        <div className='body'>
          <Sidebar az={this.state.az}
            isModal={this.state.isModal}
            configName={this.state.config.configName}
            postConfig={this.postConfig}
            updateAccountInfo={this.updateAccountInfo}
            updateConfigInfo={this.updateConfigInfo}
            initConfig={this.initConfig} />
          <Tabs updateActiveTab={this.updateActiveTab} />
          {this.state.activeTab == 'main' ?
            <>
              <RgOptions
                data={this.state.rgs}
                updateRGs={this.updateRGs} />
              <VpcOptions
                data={this.state.vpcs}
                rgList={this.state.rgList}
                updateVPCs={this.updateVPCs}
                ref={(cd) => this.childVPCs = cd} />
              <SubnetOptions
                data={this.state.subnets}
                vpcList={this.state.vpcList}
                rgList={this.state.rgList}
                updateSubnets={this.updateSubnets}
                ref={(cs) => this.subnetChild = cs} />
              <PublicIpOptions
                data={this.state.publicIPs}
                rgList={this.state.rgList}
                updatePIPs={this.updatePIPs}
                ref={(cs) => this.pipChild = cs} />

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
