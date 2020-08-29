/** organization unit
 */
import React, { Component, useState, useEffect, useReducer } from 'react'
import { FormattedMessage } from 'react-intl';
import { Tree, Card, Skeleton, Descriptions, Row, Col, Menu, Alert } from 'antd';
import { getRequestUrl, getTrad } from '../../utils'
import { LoadingIndicatorPage, useGlobalContext, request } from 'strapi-helper-plugin';
import { Button } from '@buffetjs/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import { PopUpWarning } from 'strapi-helper-plugin';
import { AddOuModal, EditOuModal } from '../OuModal';
import useOuContext from '../../hooks/useOuContext';
import PropTypes from 'prop-types';
import reducer, { initialState } from './reducer';
import { get } from 'lodash';
import {
    DownOutlined
} from '@ant-design/icons';
import styles from './index.css';

const OuList = () => {


    const [expandedKeys, setExpandedKeys] = useState([]);
    const [showModalDelete, setShowModalDelete] = useState(false);
    const [showModelAdd, setShowModalAdd] = useState(false);
    const [showModelMove, setShowModalMove] = useState(false);
    const [showModelEdit, setShowModalEdit] = useState(false);

    const [rightClickItem, setRightClickItem] = useState(null);

    const [currentOu, setCurrentOu] = useOuContext();

    const [movePair, setMovePair] = useState({ node: null, newParent: null });

    const { formatMessage } = useGlobalContext();


    const [{ ous, isLoading }, dispatch] = useReducer(reducer, initialState, () => { return { ...initialState, isLoading: true } });


    const fetchOuList = async () => {
        //remove items
        setCurrentOu(null);


        /**
         * server ou data list to tree structure
         * @param {Array} ouData 
         */
        const constructTree = (ouData) => {
            var ret = ouData.map((p) => {
                var ou = { ...p };
                ou.key = ou.id;
                ou.title = ou.displayName;
                ou.parentId = ou.parent?.id;
                ou.children = [];
                ou.icon = <FontAwesomeIcon icon="sitemap" />
                //ou.children = constructTree(ou.children);
                return ou;
            });
            for (const data of ret) {
                if (data.parentId != null) {
                    ret.find(p => p.id == data.parentId).children.push(data);
                }
            }
            return ret.filter(p => p.parentId == null);
        }

        try {
            dispatch({
                type: 'GET_DATA',
            });
            var ouServerDataList = await request(getRequestUrl('organization-units'), { method: 'GET' });
            var data = constructTree(ouServerDataList);
            dispatch({
                type: 'GET_DATA_SUCCEEDED',
                data
            });
        } catch (err) {
            const message = get(err, ['response', 'payload', 'message'], 'An error occured');

            dispatch({
                type: 'GET_DATA_ERROR',
            });

            if (message !== 'Forbidden') {
                strapi.notification.error(message);
            }
        }
    };

    const deleteSelectedTreeNode = async () => {
        if (rightClickItem?.node == null) {
            return;
        }
        try {
            await request(getRequestUrl(`organization-units/${rightClickItem.node.id}`), { method: 'DELETE' });
            fetchOuList();
        } catch (err) {
            console.log(err);
            const message = get(err, ['response', 'payload', 'message'], 'An error occured');
            strapi.notification.error(message);
        }

    }

    const moveNode = async () => {
        try {
            const { node, newParent } = movePair;
            await request(getRequestUrl(`organization-units/move`), { method: 'PUT', body: { id: node.id, parent: newParent == null ? null : newParent.id } });
            fetchOuList();
        } catch (err) {
            console.log(err);
            const message = get(err, ['response', 'payload', 'message'], 'An error occured');
            strapi.notification.error(message);
        }
    }



    useEffect(() => {
        fetchOuList();
    }, []);


    const onSubmit = () => {
        fetchOuList();
        setShowModalAdd(false);
        setShowModalEdit(false);
    }

    const onDragEnter = info => {
        // console.log(info);
        // setExpandedKeys(info.expandedKeys);
    };

    const onRightClick = ({event,node}) => {
        console.log(event.currentTarget)
        var x = event.currentTarget.offsetLeft + event.currentTarget.clientWidth;
        var y = event.currentTarget.offsetTop;
        setRightClickItem({
            display: true,
            pageX: x,
            pageY: y,
            id: node.id,
            node: node
        });

        console.log({
            display: true,
            pageX: x,
            pageY: y,
            id: node.id,
            node: node
        })
    }
    const hideRight = e => {
        console.log("hide right");
        setRightClickItem({
            ...rightClickItem,
            display: false
        })
    };

    const handleMenuClick = e => {
        switch (e.key) {
            case 'add':
                setShowModalAdd(true)
                break;
            case 'edit':
                setShowModalEdit(true)
                break;
            case 'delete':
                setShowModalDelete(true)
                break;
        }
    }
    const getNodeTreeRightClickMenu = () => {
        if (!rightClickItem?.display) {
            return null;
        }
        const { pageX, pageY, id, node } = { ...rightClickItem };
        const tmpStyle = {
            position: "absolute",
            left: `${pageX+10}px`,
            top: `${pageY}px`
        };
        const menu = (
            <Menu
                onClick={handleMenuClick}
                style={tmpStyle}
                //TODO
                // className={styles.pop}
            >
                <Menu.Item key='add'><FontAwesomeIcon icon={faPlus} /><FormattedMessage id={getTrad("ou.addchild")} /> </Menu.Item>
                <Menu.Item key='edit'><FontAwesomeIcon icon={faPencilAlt} /> <FormattedMessage id={getTrad("ou.edit")} /></Menu.Item>
                <Menu.Item key='delete'><FontAwesomeIcon icon={faTrash} /><FormattedMessage id={getTrad("ou.delete")} /></Menu.Item>
            </Menu>
            // <div style={tmpStyle} className="self-right-menu" onMouseLeave={hideRight}>
            //     <a onClick={() => setShowModalAdd(true)}></a>
            //     <a onClick={() => setShowModalEdit(true)}> </a>
            //     <a onClick={() => setShowModalDelete(true)}></a>
            // </div>
        );
        return menu;
    }

    const onDrop = info => {
        console.log(info);
        const dropKey = info.node.props.eventKey;
        const dragKey = info.dragNode.props.eventKey;
        const dropPos = info.node.props.pos.split('-');
        const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);
        var newParent = info.dropToGap ? null : info.node;
        if ((info.dragNode.parent?.id ?? info.dragNode.parent) == newParent?.id) {
            return;
        }
        setMovePair({
            node: info.dragNode,
            newParent: newParent
        });

        setShowModalMove(true);
    };

    const hasData = ous.length > 0;

    const editToggle = () => setShowModalEdit(prev => !prev);
    const addToggle = () => setShowModalAdd(prev => !prev);

    return (
        <Card loading={isLoading} style={{ marginTop: 16, marginLeft: 8 }} title={<FormattedMessage id={getTrad("ou.title")}  onClick={()=>hideRight()} />}
            extra={<div>
                <Row gutter={16}>
                    <Col><Button color="primary" icon={<FontAwesomeIcon icon={faPlus} />} label={formatMessage({ id: getTrad("ou.addroot") })} onClick={() => {
                        setRightClickItem(null);
                        setShowModalAdd(true);
                    }} /> </Col>
                </Row>
            </div>}>
            <Alert type="info" message={formatMessage({ id: getTrad("ou.alert") })} type="info" />
            {!hasData ?
                <Descriptions title={<FormattedMessage id={getTrad("ou.empty")} />}></Descriptions> :
                <Tree
                    showIcon
                    className="draggable-tree"
                    defaultExpandedKeys={expandedKeys}
                    draggable
                    blockNode
                    onDragEnter={onDragEnter}
                    onDrop={onDrop}
                    onSelect={(selectedKeys, info) => {
                        setCurrentOu(info.selected ? info.node : null);
                    }}
                    treeData={ous}
                    onRightClick={onRightClick}
                    //selectedKeys={selectedKeys}
                    defaultExpandAll={true}
                    //expandedKeys={expandedKeys}
                    switcherIcon={<DownOutlined />}
                />
            }
            <AddOuModal parentOu={rightClickItem?.node} isOpen={showModelAdd} onToggle={addToggle} onSubmit={onSubmit} />
            <EditOuModal ou={rightClickItem?.node} isOpen={showModelEdit} onToggle={editToggle} onSubmit={onSubmit} />
            {getNodeTreeRightClickMenu()}
            <PopUpWarning
                content={{
                    message: getTrad("ou.deletewarning"),
                    title: getTrad("ou.deletetitle"),
                    confirm: getTrad("ou.delete"),
                }}
                isOpen={showModalDelete}
                onConfirm={async () => {
                    await deleteSelectedTreeNode();
                    setShowModalDelete(false);
                }}
                toggleModal={() => setShowModalDelete(false)}
                popUpWarningType="warning"
            />
            <PopUpWarning
                content={{
                    message: `${formatMessage({ id: getTrad("ou.movewarning") })} ${movePair?.node?.displayName ?? ''} ${formatMessage({ id: getTrad("ou.moveto") })} ${movePair?.newParent?.displayName ?? formatMessage({ id: getTrad("ou.root") })}`,
                    title: getTrad("ou.movetitle"),
                    confirm: getTrad("ou.moveconfirm"),
                }}
                isOpen={showModelMove}
                onConfirm={async () => {
                    await moveNode();
                    setShowModalMove(false);
                }}
                toggleModal={() => setShowModalMove(false)}
                popUpWarningType="info"
            />
        </Card>

    );

}

OuList.propTypes = {

}
OuList.defaultProps = {

}
export default OuList;