import React, { Component } from 'react'

import './tabs.css';

export default class Tabs extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeTab: 'main'
        }
        this.updateActiveTab = this.updateActiveTab.bind(this);
    }

    updateActiveTab(e) {
        let innerText = e.target.innerText;
        let newTab;
        switch (innerText) {
            case 'Main Components':
                newTab = 'main';
                break;
            case 'Gateways':
                newTab = 'gws';
                break;
            case 'VPNs':
                newTab = 'vpn';
                break;
            case 'Route Tables':
                newTab = 'rts';
                break;
            default:
                break;
        }

        if (newTab !== this.state.activeTab) {
            let tables = document.getElementsByClassName('table-root');
            let tableLength = Array.from(document.getElementsByClassName('table-root')).length;
            let hasErrors = false;
            for (let i = 0; i < tableLength; i++) {
                let erroredElements = Array.from(tables[i].getElementsByClassName('blackhole'));
                if (erroredElements.length > 0) {
                    hasErrors = true;
                }
            }
            switch (this.state.activeTab) {
                case 'main':
                    this.setState({
                        activeTab: newTab,
                        mainHasErrors: hasErrors
                    })
                    break;
                case 'gws':
                    this.setState({
                        activeTab: newTab,
                        gwsHasErrors: hasErrors
                    })
                    break;
                case 'vpn':
                    this.setState({
                        activeTab: newTab,
                        vpnHasErrors: hasErrors
                    })
                    break;
                case 'rts':
                    this.setState({
                        activeTab: newTab,
                        rtsHasErrors: hasErrors
                    })
                    break;

                default:
                    break;
            }
            this.props.updateActiveTab(newTab);
        }
    }

    render() {
        return (
            <div className='tabs-root'>
                <ul className="tabs-nav">
                    <li id='aws-tab-main' onClick={this.updateActiveTab}
                        className={this.state.activeTab === 'main' ? 'tabs-item active' :
                            this.state.mainHasErrors ? 'tabs-item blackhole' : 'tabs-item'
                        }
                    >
                        Main Components
                    </li>
                    <li id='aws-tab-gws' onClick={this.updateActiveTab}
                        className={this.state.activeTab === 'gws' ? 'tabs-item active' :
                            this.state.gwsHasErrors ? 'tabs-item blackhole' : 'tabs-item'
                        }
                    >
                        Gateways
                    </li>
                    <li id='aws-tab-vpn' onClick={this.updateActiveTab}
                        className={this.state.activeTab === 'vpn' ? 'tabs-item active' :
                            this.state.vpnHasErrors ? 'tabs-item blackhole' : 'tabs-item'
                        }
                    >
                        VPNs
                    </li>
                    <li id='aws-tab-rts' onClick={this.updateActiveTab}
                        className={this.state.activeTab === 'rts' ? 'tabs-item active' :
                            this.state.rtsHasErrors ? 'tabs-item blackhole' : 'tabs-item'
                        }
                    >
                        Route Tables
                    </li>
                </ul>

            </div >
        )
    }
}
