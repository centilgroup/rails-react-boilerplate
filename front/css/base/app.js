/**
 * @file App main entry point.
 */

import '@babel/polyfill';

import React from 'react';
import ReactDom from 'react-dom';
import BrowserRouter from 'react-router-dom'

// Include the main scss file for webpack processing.
import '../css/app.scss';

import App from '../../js/components/App/App';
import getLogger from '../../js/utils/logger';

const log = getLogger('App');

const router = (
  <BrowserRouter>
    <App/>
  </BrowserRouter>
)

const init = () => {
  log.info('init() :: App starts booting...');

  ReactDom.render(router, document.getElementById('app'));
};

// init app
init();
