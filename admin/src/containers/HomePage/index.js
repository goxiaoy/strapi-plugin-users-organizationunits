/*
 *
 * HomePage
 *
 */

import React, { memo } from 'react';
// import PropTypes from 'prop-types';
import pluginId from '../../pluginId';
import { Row, Col } from 'antd';
import OrganizationUnit from '../../components/OuList';
import Detail from '../../components/OuDetail';
import { useState } from 'react'
import OuContext from '../../contexts/ouContext'
const HomePage = () => {

  return (
    <OuContext.Provider value={useState(null)}>
      <Row type="flex" justify="center" gutter={16}>
        <Col span={12}>
          <OrganizationUnit>
          </OrganizationUnit>
        </Col>
        <Col span={12}>
          <Detail />
        </Col>
      </Row>
    </OuContext.Provider>
  );
};

export default memo(HomePage);
