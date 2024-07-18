import * as React from 'react';
import { IIconProps, Stack, IStackStyles } from '@fluentui/react';
import { DefaultButton } from '@fluentui/react/lib/Button';
import { Panel, PanelType } from '@fluentui/react/lib/Panel';
import { useBoolean } from '@fluentui/react-hooks';
import { FormInsert } from '../FormData/FormData';

export interface IButtonExampleProps {
    disabled?: boolean;
    checked?: boolean;
    idTicket?: string;
}

const addIcon: IIconProps = { iconName: 'Add' };

const stackStyles: Partial<IStackStyles> = { root: { height: 44 } };

export const ButtonCommandBarExample: React.FunctionComponent<IButtonExampleProps> = props => {
    const { disabled, checked } = props;
    const [isOpen, { setTrue: openPanel, setFalse: dismissPanel }] = useBoolean(false);

    return (
        <Stack>
            <DefaultButton
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

        </Stack>
    );
};
