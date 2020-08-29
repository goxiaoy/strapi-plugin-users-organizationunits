/** organization user list
 */
import React, { Component, useState, useReducer, useEffect } from 'react'
import { Card, Descriptions,Skeleton, Row, Col  } from 'antd'
import { Table } from '@buffetjs/core';
import { sortBy as sort } from 'lodash';
import { Button } from '@buffetjs/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPencilAlt,
    faTrashAlt,
} from '@fortawesome/free-solid-svg-icons';
import useOuContext from '../../hooks/useOuContext';
import { getRequestUrl, getTrad } from '../../utils';
import { useGlobalContext, request } from 'strapi-helper-plugin';

const headers = [
    {
        name: 'Id',
        value: 'id',
        isSortEnabled: true,
    },
    {
        name: 'Username',
        value: 'username',
        isSortEnabled: false,
    },
    {
        name: 'Email',
        value: 'email',
        isSortEnabled: false,
    }
];


const rows = [
    {
        id: 1,
        firstname: 'Pierre',
        lastname: 'Gagnaire',
        recipe: 'Ratatouille',
        restaurant: 'Le Gaya',
    },
    {
        id: 2,
        firstname: 'Georges',
        lastname: 'Blanc',
        recipe: 'Beef bourguignon',
        restaurant: 'Le Georges Blanc',
    },
    {
        id: 3,
        firstname: 'Mars',
        lastname: 'Veyrat',
        recipe: 'Lemon Chicken',
        restaurant: 'La Ferme de mon père',
    },
];

const updateAtIndex = (array, index, value) =>
    array.map((row, i) => {
        if (index === i) {
            row._isChecked = value;
        }
        return row;
    });

const updateRows = (array, shouldSelect) =>
    array.map(row => {
        row._isChecked = shouldSelect;
        return row;
    });

function reducer(state, action) {
    const { nextElement, sortBy, type } = action;

    switch (type) {
        case 'CHANGE_SORT':
            if (state.sortBy === sortBy && state.sortOrder === 'asc') {
                return { ...state, sortOrder: 'desc' };
            }

            if (state.sortBy !== sortBy) {
                return { ...state, sortOrder: 'asc', sortBy };
            }

            if (state.sortBy === sortBy && state.sortOrder === 'desc') {
                return { ...state, sortOrder: 'asc', sortBy: nextElement };
            }

            return state;
        case 'SELECT_ALL':
            return { ...state, rows: updateRows(state.rows, true) };
        case 'SELECT_ROW':
            return {
                ...state,
                rows: updateAtIndex(state.rows, action.index, !action.row._isChecked),
            };
        case 'UNSELECT_ALL':
            return { ...state, rows: updateRows(state.rows, false) };
        default:
            return state;
    }
}

function init(initialState) {
    const updatedRows = initialState.rows.map(row => {
        row._isChecked = false;

        return row;
    });

    return { ...initialState, rows: updatedRows };
}

function User() {

    const [currentOu, setCurrentOu] = useOuContext();
    const { formatMessage } = useGlobalContext();
    const [showEditModal,setShowEditModal] = useState();
    var initial = true;
    const ouFilter = currentOu?.id ?? null;
    console.log("filter " + ouFilter);
    if (ouFilter == null) {
        initial = false;
    }
    const [loading, setLoading] = useState(initial);
    const [state, dispatch] = useReducer(
        reducer,
        {
            headers,
            rows,
            sortBy: 'id',
            sortOrder: 'asc',
        },
        init,
    );

    const fetchUser = async (ouFilter) => {
        setLoading(true);
        try {
            var r = await request(getRequestUrl(`organization-units/${ouFilter}/users`));
            console.log(r);
        } catch (e) {
            console.log(e);
            strapi.notification.error(e);
        } finally {
            setLoading(false);
        }


    }
    useEffect(() => {
        fetchUser(ouFilter);
    }, [ouFilter]);

    const areAllEntriesSelected = state.rows.every(
        row => row._isChecked === true,
    );
    const bulkActionProps = {
        icon: 'trash',
        onConfirm: () => {
            alert('Are you sure you want to delete these entries?');
        },
        translatedNumberOfEntry: 'entry',
        translatedNumberOfEntries: 'entries',
        translatedAction: 'Delete all',
    };
    const sortedRowsBy = sort(state.rows, [state.sortBy]);
    const sortedRows =
        state.sortOrder === 'asc' ? sortedRowsBy : sortedRowsBy.reverse();

    const buildTable = (
        <Table
            headers={state.headers}
            bulkActionProps={bulkActionProps}
            onClickRow={(e, data) => {
                console.log(data);
                alert('You have just clicked');
            }}
            onChangeSort={({
                sortBy,
                firstElementThatCanBeSorted,
                isSortEnabled,
            }) => {
                if (isSortEnabled) {
                    dispatch({
                        type: 'CHANGE_SORT',
                        sortBy,
                        nextElement: firstElementThatCanBeSorted,
                    });
                }
            }}
            onSelect={(row, index) => {
                dispatch({ type: 'SELECT_ROW', row, index });
            }}
            onSelectAll={() => {
                const type = areAllEntriesSelected ? 'UNSELECT_ALL' : 'SELECT_ALL';

                dispatch({ type });
            }}
            rows={sortedRows}
            sortBy={state.sortBy}
            sortOrder={state.sortOrder}
            withBulkAction
            rowLinks={[
                {
                    icon: <FontAwesomeIcon icon={faPencilAlt} />,
                    onClick: data => {
                        console.log(data);
                    },
                },
                {
                    icon: <FontAwesomeIcon icon={faTrashAlt} />,
                    onClick: data => {
                        console.log(data);
                    },
                },
            ]}
        />
    );

    const onSubmit = () => {
        // fetchOuList();
        setShowEditModal(false);
    }

    
    return (<Card style={{ marginTop: 16, marginRight: 8 }} loading={loading} title={currentOu?.displayName ?? ''} >
        {ouFilter == null ?
            <Descriptions title={formatMessage({id:getTrad("ou.pleaseselect")})}></Descriptions> :
            buildTable
        }
      
    </Card>);
}

export default User;