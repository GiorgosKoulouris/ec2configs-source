import React, { Component } from 'react';
import { Navigate } from 'react-router-dom';
import Navbar from '../staticComponents/Navbar';
import Footer from '../staticComponents/Footer';

import './pageNotFound.css'

export class PageNotFound extends Component {
  constructor(props) {
    super(props);
    this.state = {
      shouldNavigate: false
    }

    this.navToConfigs = this.navToConfigs.bind(this);
  }

  navToConfigs() {
    this.setState({
      shouldNavigate: true
    })
  }

  render() {
    if (this.state.shouldNavigate) {
      return (
        <Navigate to='/configs' />
      )
    } else {
      return (
        <>
          <Navbar />
          <div className='not-found-top-container'>
            <h3>Page not found</h3>
            <p>Seems like the content you are looking for is not available</p>
            <button className='action-button not-found-button' onClick={this.navToConfigs}>
              Back to my Configs
            </button>
          </div>
          <Footer />
        </>
      )
    }
  }
}
