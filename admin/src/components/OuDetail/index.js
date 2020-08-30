import { Tabs,Card,Descriptions } from 'antd';
import React, { Component, useState, useReducer, useEffect } from 'react'
import { useGlobalContext, request } from 'strapi-helper-plugin';
import { getTrad, getRequestUrl } from '../../utils'
import User from '../User';
import useOuContext from '../../hooks/useOuContext';
import Role from '../Role';

const { TabPane } = Tabs;

const Detail = () => {

    const [currentOu, setCurrentOu] = useOuContext();
    const { formatMessage } = useGlobalContext();

    return (
        <Card style={{ marginTop: 16, marginRight: 8 }} title={currentOu?.displayName ?? ''} >
            {currentOu == null ?
                <Descriptions title={formatMessage({ id: getTrad("ou.pleaseselect") })}></Descriptions> :
                <Tabs defaultActiveKey="users" >
                    <TabPane tab={formatMessage({ id: getTrad("ou.userslist") })} key="users">
                        <User></User>
                    </TabPane>
                    <TabPane tab={formatMessage({ id: getTrad("ou.roleslist") })} key="roles">
                        <Role></Role>
            </TabPane>
                </Tabs>
            }

        </Card>
    );
}

export default Detail;
