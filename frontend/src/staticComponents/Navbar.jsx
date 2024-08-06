import React, { Component } from 'react';
import { getUserName, getUserEmail, isUserAdmin } from '../helperFunctions/adFunctions';

import {
    Nav,
    NavLink,
    Bars,
    NavMenu
} from './NavbarElements';

import './navbar.css';

export default class Navbar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: getUserName(),
            email: getUserEmail(),
            isAdmin: isUserAdmin()
        }
    };
    render() {
        return (
            <div className='top-section-root'>
                <Nav>
                    <Bars />
                    <NavMenu>
                        <NavLink to='/' activeStyle>
                            Saved Configs
                        </NavLink>
                        <NavLink to='/aws' activeStyle>
                            New AWS
                        </NavLink>
                        <NavLink to='/az' activeStyle>
                            New Azure
                        </NavLink>
                        {this.state.isAdmin ?
                            <NavLink to='/admin' activeStyle>
                                Admin Section
                            </NavLink>
                            : <></>
                        }
                    </NavMenu>
                </Nav>
                <div className='user-info-section'>{this.state.name}</div>
            </div>
        );
    }
}


