import React, { useState, useReducer } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import produce from 'immer';
import { set } from 'lodash';
import * as yup from 'yup';
import { translatedErrors } from 'strapi-helper-plugin';
import { Padded, Text, Button } from '@buffetjs/core';
import Input from '../SizedInput';
import { FormattedMessage } from 'react-intl';
import { get } from 'lodash';
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
import Wrapper from './wrapper'
import SelectRoles from '../SelectRoles'
import { Col, Row } from 'reactstrap';

const reducer = (state, action) =>
  produce(state, draftState => {
    switch (action.type) {
      case 'ON_CHANGE': {
        set(draftState.modifiedData, action.keys.split('.'), action.value);
        break;
      }
      case 'SET_ERRORS': {
        draftState.formErrors = action.errors;
        break;
      }
      default:
        return draftState;
    }
  });


const init = initialState => {
  return initialState;
};
const schema = yup.object().shape({
  displayName: yup.string().required(translatedErrors.required),
});

const OuModal = ({ ou, parentOu, isOpen, onToggle, onSubmit }) => {
  if (!isOpen) {
    return null;
  }
  const isAdd = ou == null;

  const [isSubmiting, setIsSubmiting] = useState(false);
  const { formatMessage } = useGlobalContext();
  const initialState = {
    formErrors: {},
    modifiedData: {
      displayName: ou?.displayName ?? '',
      roles: ou?.roles ?? [],
    },
  }
  const [reducerState, dispatch] = useReducer(reducer, initialState, init);

  const { formErrors, modifiedData } = reducerState;

  const handleChange = ({ target: { name, value } }) => {
    dispatch({
      type: 'ON_CHANGE',
      keys: name,
      value,
    });
  };

  const handleSubmit = async e => {
    e.persist();
    e.preventDefault();
    const errors = await checkFormValidity(modifiedData, schema);

    if (!errors) {
      try {
        // Prevent user interactions until the request is completed
        strapi.lockAppWithOverlay();
        setIsSubmiting(true);


        const cleanedRoles = modifiedData.roles.map(role => role.id);
        if (isAdd) {
          const requestURL = getRequestUrl('organization-units');
          const { data } = await request(requestURL, {
            method: 'POST',
            body: { ...modifiedData, roles: cleanedRoles, parent: parentOu == null ? null : parentOu.id },
          });
          onSubmit(e, data);
        } else {
          const requestURL = getRequestUrl(`organization-units/${ou.id}`);
          const { data } = await request(requestURL, {
            method: 'PUT',
            body: { ...modifiedData, roles: cleanedRoles },
          });
          onSubmit(e, data);
        }

      } catch (err) {
        const message = get(err, ['response', 'payload', 'message'], 'An error occured');
        console.log(err);
        strapi.notification.error(message);
      } finally {
        strapi.unlockApp();
        setIsSubmiting(false);
      }
    }

    dispatch({
      type: 'SET_ERRORS',
      errors: errors || {},
    });
  };

  var headerBreadcrumbs = [];
  if (isAdd) {
    headerBreadcrumbs.push(parentOu == null ? getTrad("ou.addroot") : getTrad("ou.addchild"));
  } else {
    headerBreadcrumbs.push(formatMessage({ id: getTrad("ou.edit") }) + " " + ou.displayName)
  }

  return (
    <Modal withoverflow="true" isOpen={isOpen} onToggle={onToggle} closeButtonColor="#fff">
      <ModalHeader
        headerBreadcrumbs={headerBreadcrumbs}
      />
      <form onSubmit={handleSubmit}>
        <ModalBody>
          <ModalForm>
            <ModalSection>
              <Wrapper>
                <Padded top size="20px">
                  {parentOu != null && <Row>
                    <Input
                      key="parent"
                      label={getTrad("ou.parent")}
                      autoFocus={false}
                      disabled={true}
                      error={formErrors['parent']}
                      name="parent"
                      type='text'
                      onChange={handleChange}
                      value={parentOu?.displayName ?? ""}
                    />
                  </Row>}

                  <Row>
                    <Input
                      key="displayName"
                      label={getTrad("ou.displayName")}
                      autoFocus={true}
                      disabled={false}
                      error={formErrors["displayName"]}
                      name={"displayName"}
                      onChange={handleChange}
                      value={modifiedData["displayName"]}
                      type='text'
                      validations={{
                        required: true,
                      }}
                    />
                  </Row>
                </Padded>
              </Wrapper>
            </ModalSection>
            <ModalSection>
              <Padded top size="3px">
                <Text fontSize="xs" color="grey" fontWeight="bold" textTransform="uppercase">
                  <FormattedMessage id={getTrad("ou.roles")}>
                    {txt => txt}
                  </FormattedMessage>
                </Text>
              </Padded>
            </ModalSection>
            <ModalSection>
              <Wrapper>
                <Padded top size="12px">
                  <Row>
                    <Col xs="6">
                      <SelectRoles
                        isDisabled={false}
                        name="roles"
                        onChange={handleChange}
                        value={modifiedData.roles}
                        error={formErrors.roles}
                      />
                    </Col>
                  </Row>
                </Padded>
              </Wrapper>
            </ModalSection>

          </ModalForm>
          <ModalFooter>
            <Button color="success" type="submit" isLoading={isSubmiting} label={isAdd ? formatMessage({ id: getTrad("ou.create") }) : formatMessage({ id: getTrad("ou.edit") })}></Button>
          </ModalFooter>
        </ModalBody>
      </form>

    </Modal >
  )

}




export const AddOuModal = ({ parentOu, isOpen, onToggle, onSubmit }) => {
  return OuModal({ ou: null, parentOu, isOpen, onToggle, onSubmit });
}

AddOuModal.propTypes = {
  parentOu: PropTypes.object,
  isOpen: PropTypes.bool,
  onToggle: PropTypes.fun
}
AddOuModal.defaultProp = {
  parentOu: null,
  isOpen: false,
  onToggle: () => { }
}


export const EditOuModal = ({ ou, isOpen, onToggle, onSubmit }) => {
  return OuModal({ ou: ou, parentOu: ou?.parent, isOpen, onToggle, onSubmit });
}

EditOuModal.propTypes = {
  ou: PropTypes.object,
  isOpen: PropTypes.bool,
  onToggle: PropTypes.fun
}
EditOuModal.defaultProp = {
  ou: null,
  isOpen: false,
  onToggle: () => { }
}
