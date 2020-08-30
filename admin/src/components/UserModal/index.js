import React, { useState, useEffect } from 'react'
import {
    Modal,
    ModalBody,
    ModalFooter,
    ModalForm,
    ModalSection,
    useGlobalContext,
    ModalHeader,
    request
} from 'strapi-helper-plugin';
import { getTrad, getRequestUrl, checkFormValidity } from '../../utils'
import { Card, Descriptions, Row, Col, Table } from 'antd'
import { Button } from '@buffetjs/core';
import qs from 'qs';
import { get } from 'lodash';

const UserModal = ({ ouId, isOpen, onToggle, onSubmit }) => {
    if (!isOpen) {
        return null;
    }
    const columns = [
        {
            title: 'Id',
            dataIndex: 'id',
            sorter: true,
            width: '20%',
        },
        {
            title: 'Username',
            dataIndex: 'username',
            sorter: true,
            width: '40%',
        },
        {
            title: 'Email',
            dataIndex: 'email',
        },
    ];
    const defaultLimit = 10;

    const [pageState, setPageState] = useState({
        data: [],
        pagination: {
            current: 1,
            pageSize: defaultLimit,
        },
    })
    const [loading, setLoading] = useState(true);
    const [currentUserIds, setCurrentUserIds] = useState([]);
    const [isSubmiting, setIsSubmiting] = useState(false);
    const { formatMessage } = useGlobalContext();

    const rowSelection = {
        onChange: (selectedRowKeys, selectedRows) => {
            console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
            var newUserIds = selectedRows.map(p => p.id);
            setCurrentUserIds(newUserIds);
        },
    };
    const addUsers = async (ouId, userIds) => {
        try {
            setIsSubmiting(true);
            await request(getRequestUrl(`organization-units/users/add`), {
                method: 'POST', body: {
                    ouId: ouId,
                    userIds: userIds
                }
            });
            onSubmit();
        } catch (err) {
            console.log(err);
            const message = get(err, ['response', 'payload', 'message'], 'An error occured');
            strapi.notification.error(message);
        } finally {
            setIsSubmiting(false);
        }
    }

    const fetchUser = async (inOu, notInOu, sort, start, limit) => {
        setLoading(true);
        try {
            start = start ?? 0;
            limit = limit ?? defaultLimit
            var queryObj = {
                _start: start,
                _limit: limit,
                _sort: sort ?? "id"
            };
            //TODO seems does not work for ncontains
            var where = {_or:[{ organization_units_null: true },{ organization_units_ncontains: notInOu }]};
            queryObj._where = [where];
            var data = await request(getRequestUrl(`organization-units/users?${qs.stringify(queryObj)}`));
            var count = await request(getRequestUrl(`organization-units/users/count?${qs.stringify({ _where: where })}`));
            setPageState({
                ...pageState,
                data,
                pagination: {
                    current: start / limit + 1,
                    pageSize: limit,
                    total: count
                }
            });
        } catch (err) {
            console.log(err);
            const message = get(err, ['response', 'payload', 'message'], 'An error occured');
            strapi.notification.error(message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchUser(null, ouId);
    }, [ouId])

    const handleTableChange = (pagination, filters, sorter) => {
        console.log(sorter);
        console.log(filters);
        console.log(pagination)
        fetchUser(null, ouId, null, (pagination.current - 1) * pagination.pageSize, pagination.pageSize);
    };

    const { data, pagination } = pageState;
    return (
        <Modal withoverflow="true" isOpen={isOpen} onToggle={onToggle} closeButtonColor="#fff">
            <ModalHeader
                headerBreadcrumbs={[
                    getTrad("ou.adduser")
                ]}
            />

            <Table
                rowSelection={{
                    type: 'checkbox',
                    ...rowSelection,
                }}
                columns={columns}
                rowKey={record => record.id}
                dataSource={data}
                pagination={{
                    ...pagination,
                    showSizeChanger: true
                }}
                loading={loading}
                onChange={handleTableChange}
            />

            <ModalFooter>
                <section>
                    <Button type="button" color="cancel" onClick={onToggle}>
                        {formatMessage({ id: 'app.components.Button.cancel' })}
                    </Button>
                    <Button type="button" color="success" isLoading={isSubmiting} label={formatMessage({ id: getTrad("ou.adduser") })} onClick={() => {
                        addUsers(ouId, currentUserIds);
                    }}></Button>
                </section>
            </ModalFooter>
        </Modal>
    )

}

export default UserModal