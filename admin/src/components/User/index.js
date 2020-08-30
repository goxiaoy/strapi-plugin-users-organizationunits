import React, { useState, useEffect } from 'react'
import {
    faTrashAlt,
    faPlus
} from '@fortawesome/free-solid-svg-icons';
import { Card, Descriptions, Row, Col, Table } from 'antd'
import useOuContext from '../../hooks/useOuContext';
import { getRequestUrl, getTrad } from '../../utils';
import { useGlobalContext, request } from 'strapi-helper-plugin';
import { Button } from '@buffetjs/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { PopUpWarning } from 'strapi-helper-plugin';
import qs from 'qs';
import { get } from 'lodash';
import UserModal from '../UserModal'


const User = () => {

    const [currentOu, setCurrentOu] = useOuContext();
    const { formatMessage } = useGlobalContext();
    const [loading, setLoading] = useState(true);

    const [currentUserIds, setCurrentUserIds] = useState([]);
    const ouFilter = currentOu?.id ?? null;
    const [showModalDelete, setShowModalDelete] = useState(false);
    const [showModalAdd, setShowModalAdd] = useState(false);
    const [removeButtonShow, setRemoveButtonShow] = useState(false);
    const notOuFilter = ouFilter;

    const defaultLimit = 10;

    const [pageState, setPageState] = useState({
        data: [],
        pagination: {
            current: 1,
            pageSize: defaultLimit,
        },
    })
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
        {
            title: 'Action',
            dataIndex: '',
            key: 'x',
            render: (_, record) => <a onClick={() => { setCurrentUserIds([record.id]); setShowModalDelete(true); }}><FontAwesomeIcon icon={faTrashAlt} /> </a>
        }
    ];

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
            var where = { organization_units_contains: inOu };
            // var where = []
            // if (inOu != null) {
            //     where.push({ organization_units_contains: [inOu] });
            // }
            // if (notInOu != null) {
            //     where.push({ organization_units_ncontains: [notInOu] });
            // }
            queryObj._where = where;
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

    const removeUsers = async (ouId, userIds) => {
        try {
            await request(getRequestUrl(`organization-units/users/remove`), {
                method: 'POST', body: {
                    ouId: ouId,
                    userIds: userIds
                }
            });
            setRemoveButtonShow(false);
            fetchUser(ouFilter, null);
        } catch (err) {
            console.log(err);
            const message = get(err, ['response', 'payload', 'message'], 'An error occured');
            strapi.notification.error(message);
        }
    }


    useEffect(() => {
        fetchUser(ouFilter, null);
    }, [ouFilter])

    const handleTableChange = (pagination, filters, sorter) => {
        console.log(sorter);
        console.log(filters);
        console.log(pagination)
        fetchUser(ouFilter, null, null, (pagination.current - 1) * pagination.pageSize, pagination.pageSize);
    };
    const rowSelection = {
        onChange: (selectedRowKeys, selectedRows) => {
            console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
            var newUserIds = selectedRows.map(p => p.id);
            setRemoveButtonShow(newUserIds.length > 0);
            setCurrentUserIds(newUserIds);
        },
        // getCheckboxProps: record => ({
        //     disabled: record.name === 'Disabled User',
        //     // Column configuration not to be checked
        //     name: record.name,
        // }),
    };

    const { data, pagination } = pageState;
    return (
        <Card bordered={false} loading={loading} style={{ margin: 0, padding: 0 }} extra={
            <div><Row gutter={8}>
                {removeButtonShow && <Col><Button color="delete" icon={<FontAwesomeIcon icon={faTrashAlt} />} label={formatMessage({ id: getTrad("ou.remove") })} onClick={() => {
                    setShowModalDelete(true)
                }} /> </Col>}
                <Col><Button color="primary" icon={<FontAwesomeIcon icon={faPlus} />} label={formatMessage({ id: getTrad("ou.adduser") })} onClick={() => {
                    setShowModalAdd(true);
                }} /> </Col>
            </Row></div>
        } >
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
                loading={false}
                onChange={handleTableChange}
            />
            <UserModal ouId={ouFilter} isOpen={showModalAdd} onToggle={() => setShowModalAdd(pre => !pre)} onSubmit={() => {
                setShowModalAdd(false);
                fetchUser(ouFilter, null);
            }} ></UserModal>
            <PopUpWarning
                content={{
                    message: formatMessage({ id: getTrad("ou.removeuserwarning") }) + currentOu.displayName,
                    title: getTrad("ou.deletetitle"),
                    confirm: getTrad("ou.delete"),
                }}
                isOpen={showModalDelete}
                onConfirm={async () => {
                    console.log(currentUserIds)
                    await removeUsers(ouFilter, currentUserIds);
                    setShowModalDelete(false);
                }}
                toggleModal={() => setShowModalDelete(false)}
                popUpWarningType="warning"
            />
        </Card>);
}

export default User;