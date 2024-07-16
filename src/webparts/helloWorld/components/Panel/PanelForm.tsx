import * as React from 'react';
import { DefaultButton } from '@fluentui/react/lib/Button';
import { Panel, PanelType } from '@fluentui/react/lib/Panel';
import { useBoolean } from '@fluentui/react-hooks';

export const PanelBasicExample: React.FunctionComponent = () => {
    const [isOpen, { setTrue: openPanel, setFalse: dismissPanel }] = useBoolean(false);

    return (
        <div>
            <DefaultButton text="Open panel" onClick={openPanel} />
            <Panel
                headerText="New Item"
                isOpen={isOpen}
                onDismiss={dismissPanel}
                type={PanelType.medium}
                // You MUST provide this prop! Otherwise screen readers will just say "button" with no label.
                closeButtonAriaLabel="Close"
            >
                <p>Content goes here.</p>
            </Panel>
        </div>
    );
};
