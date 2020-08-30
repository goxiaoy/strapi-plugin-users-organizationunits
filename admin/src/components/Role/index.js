import React from 'react'
import { List } from 'antd';
import useOuContext from '../../hooks/useOuContext';

const Roles = ()=>{

    const [currentOu, setCurrentOu] = useOuContext();

    const data = currentOu?.roles.map(p=>p.name)??[];

    return (
        <List
      bordered
      dataSource={data}
      renderItem={item => (
        <List.Item>
          {item}
        </List.Item>
      )}
    />
    )
}

export default Roles;