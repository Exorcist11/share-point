import * as React from 'react';
import { IIconProps, Stack, IStackStyles } from '@fluentui/react';
import { CommandBarButton } from '@fluentui/react/lib/Button';
import { Panel, PanelType } from '@fluentui/react/lib/Panel';
import { useBoolean } from '@fluentui/react-hooks';
import { FormInsert } from '../FormData/FormData';
import { FormEdit } from '../FormData/EditForm';
import * as pnp from 'sp-pnp-js';

export interface IButtonExampleProps {
    disabled?: boolean;
    checked?: boolean;
    idTicket?: string;
}

const addIcon: IIconProps = { iconName: 'Add' };
const deleteIcon: IIconProps = { iconName: 'Delete' };
const editIcon: IIconProps = { iconName: 'Edit' };

const stackStyles: Partial<IStackStyles> = { root: { height: 44 } };

export const ButtonCommandBarExample: React.FunctionComponent<IButtonExampleProps> = props => {
    const { disabled, checked, idTicket } = props;
    const [isOpen, { setTrue: openPanel, setFalse: dismissPanel }] = useBoolean(false);
    const [isEdit, { setTrue: openEdit, setFalse: dismissEdit }] = useBoolean(false);
    const deleteTicket = async () => {
        try {
            if (idTicket) {
                await pnp.sp.web.lists.getByTitle('Information').items.getById(parseInt(idTicket)).delete();
                window.location.reload()
            }
        } catch (error) {
            console.error(`Error deleting ticket with ID ${idTicket}:`, error);
        }
    };

    return (
        <Stack horizontal styles={stackStyles}>
            <CommandBarButton
                iconProps={addIcon}
                text="New item"
                // split={true}
                disabled={disabled}
                checked={checked}
                onClick={openPanel}
            />

            <Panel
                headerText="New item"
                isOpen={isOpen}
                type={PanelType.medium}
                onDismiss={dismissPanel}
                closeButtonAriaLabel="Close"
            >
                <FormInsert />
            </Panel>

            {idTicket && (
                <CommandBarButton
                    iconProps={deleteIcon}
                    text="Delete"
                    disabled={disabled}
                    checked={checked}
                    onClick={deleteTicket}
                />
            )}

            {idTicket && (
                <CommandBarButton
                    iconProps={editIcon}
                    text="Edit"
                    disabled={disabled}
                    checked={checked}
                    onClick={openEdit}
                />
            )}
            <Panel
                headerText="Edit Item"
                isOpen={isEdit}
                type={PanelType.medium}
                onDismiss={dismissEdit}
                closeButtonAriaLabel="Close"
            >
                <FormEdit id={idTicket} />
            </Panel>
        </Stack>
    );
};
