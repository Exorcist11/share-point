import * as React from "react";
import { TextField, ITextFieldStyles } from '@fluentui/react/lib/TextField';
import { Stack } from '@fluentui/react/lib/Stack';
import { DefaultButton, PrimaryButton } from '@fluentui/react/lib/Button';
import { Dropdown, IDropdownOption, IDropdownStyles } from '@fluentui/react/lib/Dropdown';
import { IIconProps } from '@fluentui/react';
// import { Web } from 'sp-pnp-js';
import * as pnp from 'sp-pnp-js';
// import { Dropdown, IDropdownOption, IDropdownStyles } from '@fluentui/react/lib/Dropdown';


const textFieldStyles: Partial<ITextFieldStyles> = { fieldGroup: {} };

const stackTokens = { childrenGap: 15 };

const deleteIcon: IIconProps = { iconName: 'Delete' };
const editIcon: IIconProps = { iconName: 'Edit' };

interface IFormEditProps {
    id: any;
    name: any;
}

export interface IGroup {
    Id: number;
    Title: string;
}
interface InputProps {
    name: string;
    type: string;
}

export const FormEdit: React.FC<IFormEditProps> = ({ id, name }) => {
    const [ticket, setTicket] = React.useState({
        title: '',
        description: '',
        category: '',
        status: 'Draft',
        currentID: '',
        requesterID: '',
        assigneeID: '',
        assigneeID_2: '',
        assigneeID_3: '',
        managerID: '',
        record_1: '',
        record_2: '',
        record_3: '',
    })
    const [columnName, setColumnName] = React.useState([]);
    const [typeOfColumn, setTypeOfColumn] = React.useState([])

    const dropdownStyles: Partial<IDropdownStyles> = {
        dropdown: { width: 300 },
    };
    const [group, setGroup] = React.useState<IGroup[]>([])

    const optionsManager: IDropdownOption[] = [
        ...group.map(item => ({
            key: item.Id,
            text: item.Title
        }))
    ]
    const options: IDropdownOption[] = [

        { key: 'apple', text: 'Apple' },
        { key: 'banana', text: 'Banana' },
        { key: 'orange', text: 'Orange', disabled: true },
        { key: 'grape', text: 'Grape' },
        { key: 'broccoli', text: 'Broccoli' },
        { key: 'carrot', text: 'Carrot' },
        { key: 'lettuce', text: 'Lettuce' },
    ];

    const createInputElement = (name: string, type: string) => {
        switch (type) {
            case "Multiple lines of text":
                return <TextField label={name} placeholder={name} multiline />;
            case "Single line of text":
                return <TextField label={name} placeholder={name} />;
            case 'Number':
                return <input type="number" name={name} placeholder={name} />;
            case 'Choice':
                return (
                    <Dropdown
                        placeholder="Select an option"
                        label="Basic uncontrolled example"
                        options={options}
                        styles={dropdownStyles}
                    />
                );
            default:
                return <TextField label={name} />;
        }
    };
    const InputElement: React.FC<InputProps> = ({ name, type }) => {
        return createInputElement(name, type);
    };
    const fetchTickets = async () => {
        try {
            const getUser = await pnp.sp.web.lists.getByTitle(name).items.getById(id).get();
            const response = await pnp.sp.web.lists.getByTitle(name).fields.filter('CanBeDeleted eq true').get();
            setColumnName(response)
            const logUser = await pnp.sp.web.currentUser.get();
            setTicket({
                title: getUser.Title,
                description: getUser.Description,
                category: getUser.CategoryV2,
                status: getUser.Status,
                currentID: logUser.Id || null,
                requesterID: getUser.RequestorId,
                assigneeID: getUser.AssigneeId,
                assigneeID_2: getUser.Assignee_2Id,
                assigneeID_3: getUser.Assignee_3Id,
                managerID: getUser.ManagerId,
                record_1: getUser.Record_1,
                record_2: getUser.Record_2,
                record_3: getUser.Record_3
            })
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
        setTicket({ ...ticket, assigneeID: option?.key as string })
    }

    const onChangeManager = (event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption, index?: number) => {
        setTicket({ ...ticket, managerID: option?.key as string })
    }

    const _handleUpdate = async () => {
        try {
            if (ticket.currentID === ticket.requesterID) {
                await pnp.sp.web.lists.getByTitle('Information').items.getById(id).update({
                    Title: ticket.title,
                    Description: ticket.description,
                    CategoryV2: ticket.category,
                });
            } else {
                alert('You dont permision!')
                return;
            }
        } catch (error) {
            console.error('Error update')
        }
    };

    const _handleDelete = async () => {
        try {
            if (id) {
                await pnp.sp.web.lists.getByTitle('Information').items.getById(parseInt(id)).delete();
                window.location.reload()
            }

        } catch (error) {
            console.error(`Error deleting ticket with ID ${id}:`, error);
        }
    }

    const handleByAssignee = async (status: string) => {
        try {
            if (ticket.currentID === ticket.assigneeID && !ticket.record_1) {
                await pnp.sp.web.lists.getByTitle('Information').items.getById(id).update({
                    Record_1: new Date().toISOString()
                });
            } else if (ticket.currentID === ticket.assigneeID_2 && !ticket.record_2) {
                await pnp.sp.web.lists.getByTitle('Information').items.getById(id).update({
                    Record_2: new Date().toISOString()
                });
            } else if (ticket.currentID === ticket.assigneeID_3 && !ticket.record_3) {
                await pnp.sp.web.lists.getByTitle('Information').items.getById(id).update({
                    Record_3: new Date().toISOString()
                });
            } else if (ticket.currentID === ticket.managerID) {
                await pnp.sp.web.lists.getByTitle('Information').items.getById(id).update({
                    Status: status
                });
            } else if (ticket.currentID === ticket.requesterID) {
                await pnp.sp.web.lists.getByTitle('Information').items.getById(id).update({
                    Status: status
                });
            } else {
                alert('You do not have permission.');
                return;
            }

            const updatedItem = await pnp.sp.web.lists.getByTitle('Information').items.getById(id).get();

            if (updatedItem.Record_1 && updatedItem.Record_2 && updatedItem.Record_3 && updatedItem.Status === 'On Going') {
                await pnp.sp.web.lists.getByTitle('Information').items.getById(id).update({
                    Status: status
                });
                console.log('Update successful! Status:', status);
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    }

    const isVisible = () => {
        if (!ticket.record_1 && ticket.currentID === ticket.assigneeID && ticket.status === 'On Going') return true;
        if (!ticket.record_2 && ticket.currentID === ticket.assigneeID_2 && ticket.status === 'On Going') return true;
        if (!ticket.record_3 && ticket.currentID === ticket.assigneeID_3 && ticket.status === 'On Going') return true;
        return false;
    }

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
            <Stack horizontal tokens={stackTokens} style={{ display: 'flex', gap: '10px' }}>
                <DefaultButton
                    text="Edit"
                    iconProps={editIcon}
                    style={{ width: 'fit-content' }}
                    onClick={_handleUpdate}
                    allowDisabledFocus
                // disabled={true}
                // checked={checked}
                />
                <DefaultButton
                    text="Delete"
                    iconProps={deleteIcon}
                    style={{ width: 'fit-content' }}
                    onClick={_handleDelete}
                    allowDisabledFocus
                // disabled={true}
                // checked={checked}
                />
            </Stack>

            {columnName.map((item, index) => (
                <div key={index}>
                    <label>
                        <InputElement name={item.Title} type={item.TypeDisplayName} />
                    </label>
                    <br />
                </div>
            ))}
            {/* <h2>Actions</h2>
            <Stack horizontal tokens={stackTokens} style={{ display: 'flex', gap: '8px' }}>
                {
                    (ticket.status === 'Draft') &&
                    (
                        <DefaultButton
                            text='On Going'
                            style={{ width: 'fit-content', background: '#5DE2E7' }}
                            onClick={() => handleByAssignee('On Going')}
                        />
                    )
                }

                {
                    (
                        isVisible()
                    )
                    &&
                    (
                        <PrimaryButton
                            text="Completed"
                            style={{ width: 'fit-content' }}
                            onClick={() => handleByAssignee('Completed')}

                        />
                    )
                }

                {
                    (ticket.currentID === ticket.managerID && ticket.status === 'Completed') &&
                    (
                        <Stack horizontal style={{ display: 'flex', gap: '8px', color: '#fff' }}>
                            <DefaultButton
                                text="Approved"
                                style={{ width: 'fit-content', background: '#7DDA58' }}
                                onClick={() => handleByAssignee('Approved')}
                            />
                            <DefaultButton
                                text="Rejected"
                                style={{ width: 'fit-content', background: '#E4080A' }}
                                onClick={() => handleByAssignee('Rejected')}
                            />
                        </Stack>
                    )
                }
            </Stack>

            <TextField
                label="Title"
                value={ticket.title}
                onChange={onChangeTitle}
                styles={textFieldStyles}
                readOnly={ticket.currentID == ticket.requesterID ? false : true}
            />

            <TextField
                label="Category"
                value={ticket.category}
                onChange={onChangeCategory}
                styles={textFieldStyles}
                readOnly={ticket.currentID == ticket.requesterID ? false : true}
            />

            <TextField
                label="Description"
                multiline
                value={ticket.description}
                onChange={onChangeDescription}
                styles={textFieldStyles}
                readOnly={ticket.currentID == ticket.requesterID ? false : true}
            />

            <Dropdown
                label="Requester"
                options={optionsManager}
                onChange={onChangeAssignee}
                styles={dropdownStyles}
                defaultSelectedKey={ticket.requesterID || null}
                disabled={true}
            />

            <Dropdown
                label="Assignee 1"
                options={optionsManager}
                onChange={onChangeAssignee}
                styles={dropdownStyles}
                defaultSelectedKey={ticket.assigneeID || null}
                disabled={true}
            />

            <Dropdown
                label="Assignee 2"
                options={optionsManager}
                onChange={onChangeAssignee}
                styles={dropdownStyles}
                defaultSelectedKey={ticket.assigneeID_2 || null}
                disabled={true}
            />

            <Dropdown
                label="Assignee 3"
                options={optionsManager}
                onChange={onChangeAssignee}
                styles={dropdownStyles}
                defaultSelectedKey={ticket.assigneeID_3 || null}
                disabled={true}
            />

            <Dropdown
                label="Manager"
                options={optionsManager}
                onChange={onChangeManager}
                styles={dropdownStyles}
                defaultSelectedKey={ticket.assigneeID}
                disabled={true}
            /> */}

        </Stack>
    )
}
