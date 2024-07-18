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

export const FormInsert: React.FC = () => {
    const [ticket, setTicket] = React.useState({
        title: '',
        description: '',
        category: '',
        status: 'Draft',
        currentID: '',
        AssigneeId: '',
        AssigneeId_2: '',
        AssigneeId_3: '',
        ManagerId: ''
    })
    const [group, setGroup] = React.useState<IGroup[]>([])
    const fetchGroup = async () => {
        try {
            const getUser = await pnp.sp.web.siteGroups.getById(92).users.get()
            const formattedGroups: IGroup[] = getUser.map((item: any) => ({
                Id: item.Id,
                Title: item.Title
            }))
            setGroup(formattedGroups)
        } catch (error) {
            console.error(error)
        }
    }
    const fetchTickets = async () => {
        try {
            const logUser = await pnp.sp.web.currentUser.get();
            setTicket({ ...ticket, currentID: logUser.Id || '' })
        } catch (error) {
            console.error('Error fetching tickets:', error);
        }
    };

    const onChangeTitle = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
        setTicket({ ...ticket, title: newValue || '' });
    };

    const onChangeCategory = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
        setTicket({ ...ticket, category: newValue || '' });
    };

    const onChangeDescription = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
        setTicket({ ...ticket, description: newValue || '' });
    };

    const onChangeAssignee = (event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption, index?: number) => {
        setTicket({ ...ticket, AssigneeId: option?.key as string })
    }

    const onChangeAssignee_2 = (event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption, index?: number) => {
        setTicket({ ...ticket, AssigneeId_2: option?.key as string })
    }

    const onChangeAssignee_3 = (event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption, index?: number) => {
        setTicket({ ...ticket, AssigneeId_3: option?.key as string })
    }

    const onChangeManager = (event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption, index?: number) => {
        setTicket({ ...ticket, ManagerId: option?.key as string })
    }

    const dropdownStyles: Partial<IDropdownStyles> = {
        dropdown: { width: 300 },
    };

    const optionsManager: IDropdownOption[] = [
        ...group.map(item => ({
            key: item.Id,
            text: item.Title
        }))
    ]

    const _handleSubmit = async () => {
        try {
            await pnp.sp.web.lists.getByTitle('Information').items.add({
                Title: ticket.title,
                Description: ticket.description,
                CategoryV2: ticket.category,
                Status: ticket.status,
                RequestorId: ticket.currentID,
                AssigneeId: ticket.AssigneeId,
                Assignee_2Id: ticket.AssigneeId_2,
                Assignee_3Id: ticket.AssigneeId_3,
                ManagerId: ticket.ManagerId,
            });
            window.location.reload()
        } catch (error) {
            console.error('Đã xảy ra lỗi khi gửi dữ liệu:', error);
        }
    }

    React.useEffect(() => {
        fetchTickets().catch((error) => {
            console.error('Error in fetchTickets useEffect:', error);
        });
        fetchGroup().catch(e => {
            console.error('Error in fetchGroup: ' + e);
        })
    }, []);

    return (
        <Stack tokens={stackTokens}>
            <DefaultButton
                text="Create"
                iconProps={addIcon}
                style={{ width: 'fit-content' }}
                onClick={_handleSubmit}
                allowDisabledFocus
            // disabled={disabled}
            // checked={checked}
            />

            <TextField
                label="Title"
                value={ticket.title}
                onChange={onChangeTitle}
                styles={textFieldStyles}
                required
            />

            <TextField
                label="Category"
                value={ticket.category}
                onChange={onChangeCategory}
                styles={textFieldStyles}
                required
            />

            <TextField
                label="Description"
                multiline
                value={ticket.description}
                onChange={onChangeDescription}
                styles={textFieldStyles}
            />

            <Stack horizontal style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Dropdown
                    defaultSelectedKey={ticket.AssigneeId}
                    label="Assignee"
                    options={optionsManager}
                    onChange={onChangeAssignee}
                    styles={dropdownStyles}
                    placeholder="Select assignee"
                    required
                />

                <Dropdown
                    defaultSelectedKey={ticket.ManagerId}
                    label="Manager"
                    options={optionsManager}
                    onChange={onChangeManager}
                    styles={dropdownStyles}
                    placeholder="Select manager"
                    required
                />
            </Stack>

            <Stack horizontal style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Dropdown
                    defaultSelectedKey={ticket.AssigneeId_2}
                    label="Assignee 2"
                    options={optionsManager}
                    onChange={onChangeAssignee_2}
                    styles={dropdownStyles}
                    placeholder="Select assignee"
                    required
                />

                <Dropdown
                    defaultSelectedKey={ticket.AssigneeId_3}
                    label="Assignee 3"
                    options={optionsManager}
                    onChange={onChangeAssignee_3}
                    styles={dropdownStyles}
                    placeholder="Select manager"
                    required
                />
            </Stack>


        </Stack>
    )
}
