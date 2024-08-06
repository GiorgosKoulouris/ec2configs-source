import React, { Component } from 'react'

import './adminTabs.css';

export default class AdminTabs extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeTab: 'Users'
        }
        this.changeActiveTab = this.changeActiveTab.bind(this);
    }

    changeActiveTab(e) {
        let newTab = e.target.innerText;
        this.setState({
            activeTab: newTab
        })
        this.props.updateActiveTab(newTab);
    }

    render() {
        return (
            <div className='admin-tabs-root'>
                <ul className="admin-tabs-nav">
                    <li id='admin-tab-users' onClick={this.changeActiveTab}
                        className={this.state.activeTab === 'Users' ? 'admin-tabs-item active' : 'tabs-item'}>
                        Users
                    </li>
                    <li id='admin-tab-groups' onClick={this.changeActiveTab}
                        className={this.state.activeTab === 'User Groups' ? 'admin-tabs-item active' : 'tabs-item'}>
                        User Groups
                    </li>
                </ul>

            </div >
        )
    }
}
