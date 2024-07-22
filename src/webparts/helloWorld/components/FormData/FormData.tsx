import * as React from "react";
import { TextField, ITextFieldStyles } from '@fluentui/react/lib/TextField';
import { Stack } from '@fluentui/react/lib/Stack';
import { DefaultButton } from '@fluentui/react/lib/Button';
import { IIconProps } from '@fluentui/react';
import * as pnp from 'sp-pnp-js';
import { Dropdown, IDropdownOption, IDropdownStyles } from '@fluentui/react/lib/Dropdown';

const textFieldStyles: Partial<ITextFieldStyles> = { fieldGroup: {} };

const stackTokens = { childrenGap: 15 };

const addIcon: IIconProps = { iconName: 'Add' };

export interface IGroup {
    Id: number;
    Title: string;
}

export interface IFormData {
    name: string;
}

interface InputProps {
    name: string;
    type: string;
    value: string | number;
    onChange: (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement | HTMLDivElement>, newValue?: string) => void;
}

export const FormInsert: React.FC<IFormData> = ({ name }) => {
    // const [ticket, setTicket] = React.useState({
    //     title: '',
    //     description: '',
    //     category: '',
    //     status: 'Draft',
    //     currentID: '',
    //     AssigneeId: '',
    //     AssigneeId_2: '',
    //     AssigneeId_3: '',
    //     ManagerId: ''
    // });
    const [group, setGroup] = React.useState<IGroup[]>([]);
    const [columnName, setColumnName] = React.useState<any[]>([]);

    const fetchGroup = async () => {
        try {
            const getUser = await pnp.sp.web.siteGroups.getById(92).users.get();
            const formattedGroups: IGroup[] = getUser.map((item: any) => ({
                Id: item.Id,
                Title: item.Title
            }));
            setGroup(formattedGroups);
        } catch (error) {
            console.error(error);
        }
    };

    // const fetchTickets = async () => {
    //     try {
    //         const logUser = await pnp.sp.web.currentUser.get();
    //         setTicket({ ...ticket, currentID: logUser.Id || '' });
    //     } catch (error) {
    //         console.error('Error fetching tickets:', error);
    //     }
    // };

    const [v, setV] = React.useState([])

    const handleDropdownChange = (event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption, index?: number) => {
        const name = event.currentTarget.getAttribute('data-name') || '';
        if (name in v) {
            setV(prevTicket => ({
                ...prevTicket,
                [name]: option?.key as string
            }));
        }
    };

    const dropdownStyles: Partial<IDropdownStyles> = {
        dropdown: { width: 300 },
    };

    const optionsManager: IDropdownOption[] = [
        ...group.map(item => ({
            key: item.Id,
            text: item.Title
        }))
    ];

    const _handleSubmit = async () => {
        try {
            // await pnp.sp.web.lists.getByTitle('Information').items.add({
            //     Title: ticket.title,
            //     Description: ticket.description,
            //     CategoryV2: ticket.category,
            //     Status: ticket.status,
            //     RequestorId: ticket.currentID,
            //     AssigneeId: ticket.AssigneeId,
            //     Assignee_2Id: ticket.AssigneeId_2,
            //     Assignee_3Id: ticket.AssigneeId_3,
            //     ManagerId: ticket.ManagerId,
            // });
            window.location.reload();
        } catch (error) {
            console.error('Đã xảy ra lỗi khi gửi dữ liệu:', error);
        }
    };

    const options: IDropdownOption[] = [
        { key: 'apple', text: 'Apple' },
        { key: 'banana', text: 'Banana' },
        { key: 'orange', text: 'Orange', disabled: true },
        { key: 'grape', text: 'Grape' },
        { key: 'broccoli', text: 'Broccoli' },
        { key: 'carrot', text: 'Carrot' },
        { key: 'lettuce', text: 'Lettuce' },
    ];

    const createInputElement = (name: string, type: string, value: string | number) => {
        const stringValue = String(value);

        switch (type) {
            case "Multiple lines of text":
                return <TextField label={name} placeholder={name} multiline name={name} value={stringValue} styles={textFieldStyles} />;

            case "Single line of text":
                return <TextField label={name} placeholder={name} name={name} value={stringValue} styles={textFieldStyles} />;

            case 'Number':
                return <input type="number" name={name} placeholder={name} value={value} />;

            case 'Choice':
                return (
                    <Dropdown
                        placeholder="Select an option"
                        label={name}
                        options={options}
                        styles={dropdownStyles}
                        onChange={handleDropdownChange}
                        data-name={name} // Use data attribute to pass field name
                    />
                );

            default:
                return <TextField label={name} name={name} value={stringValue} />;
        }
    };

    const fetchColumns = async () => {
        try {
            const response = await pnp.sp.web.lists.getByTitle(name).fields.filter('CanBeDeleted eq true').get();
            setColumnName(response);
        } catch (error) {
            console.error('Error fetching columns: ', error);
        }
    };

    React.useEffect(() => {
        // fetchTickets().catch((error) => {
        //     console.error('Error in fetchTickets useEffect:', error);
        // });
        fetchGroup().catch(e => {
            console.error('Error in fetchGroup: ' + e);
        });
        fetchColumns().catch(e => {
            console.error('Error in fetchColumns: ' + e);
        });
    }, []);

    return (
        <Stack tokens={stackTokens}>
            {columnName.map((item, index) => (
                <div key={index}>
                    <label>
                        {createInputElement(item.Title, item.TypeDisplayName, v[item.Title] || '')}
                    </label>
                    <br />
                </div>
            ))}
            <DefaultButton
                text="Create"
                iconProps={addIcon}
                style={{ width: 'fit-content' }}
                onClick={_handleSubmit}
                allowDisabledFocus
            />
        </Stack>
    );
};
