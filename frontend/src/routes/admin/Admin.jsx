import React, { Component } from 'react';
import { Navigate } from 'react-router-dom';
import Navbar from '../../staticComponents/Navbar';
import Footer from '../../staticComponents/Footer';
import { isUserAdmin } from '../../helperFunctions/adFunctions';

import AdminTabs from './AdminTabs';
import Users from './Users';
import Groups from './Groups';

import '../../global.css';
import './admin.css';

export class Admin extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isUserAdmin: isUserAdmin(),
            activeTab: "Users"
        }

        this.notAuthPage = this.notAuthPage.bind(this);
        this.navToConfigs = this.navToConfigs.bind(this);
        this.updateActiveTab = this.updateActiveTab.bind(this);
    }

    navToConfigs() {
        this.setState({
            shouldNavigate: true
        })
    }

    notAuthPage() {
        return (
            <div className='body-root'>
                <div className='admin-top-container'>
                    <h3>Not authorized</h3>
                    <p>
                        You are not an admin of this application instance. Contact your administrator for details.
                    </p>
                    <button className='action-button admin-no-auth-button'
                        onClick={this.navToConfigs}
                    >
                        Back to my Configs
                    </button>
                </div>
            </div>
        )
    }

    updateActiveTab(tab) {
        this.setState({
            activeTab: tab
        })
    }

    render() {
        if (this.state.shouldNavigate) {
            return (
                <Navigate to='/configs' />
            )
        } else return (
            <>
                <Navbar />
                {this.state.isUserAdmin ?
                    <div className='body-root'>
                        <div className='admin-top-container'>
                            <AdminTabs updateActiveTab={this.updateActiveTab} />
                            {this.state.activeTab === "Users" ? <Users /> : <></>}
                            {this.state.activeTab === "User Groups" ? <Groups /> : <></>}
                        </div>
                    </div>
                    : this.notAuthPage()}
                <Footer />
            </>
        )
    }
}
