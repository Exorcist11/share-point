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

export const FormEdit: React.FC<IFormEditProps> = ({ id, name }) => {
    const [dropdownOptions, setDropdownOptions] = React.useState<{ [key: string]: IDropdownOption[] }>({});
    const [requiredCol, setRequiredCol] = React.useState([]);
    const [group, setGroup] = React.useState<IGroup[]>([]);
    const [columnName, setColumnName] = React.useState([]);
    const [formValues, setFormValues] = React.useState<{ [key: string]: string | number }>({});
    const [errors, setErrors] = React.useState<{ [key: string]: string }>({});

    const dropdownStyles: Partial<IDropdownStyles> = {
        dropdown: { width: 300 },
    };

    const optionsManager: IDropdownOption[] = [
        ...group.map(item => ({
            key: item.Id,
            text: item.Title
        }))
    ]

    const createInputElement = (name: string, epName: string, type: string, value: string | number) => {
        switch (type) {
            case "Multiple lines of text":
                return <TextField
                    label={name}
                    placeholder={name}
                    multiline
                    value={String(formValues[epName] || '')}
                    styles={textFieldStyles}
                    onChange={handleTextFieldChange}
                    name={epName}
                    required={requiredCol.includes(name)}
                    errorMessage={errors[name]}
                />;

            case "Single line of text":
                return <TextField
                    label={name}
                    placeholder={name}
                    value={String(formValues[epName] || '')}
                    styles={textFieldStyles}
                    onChange={handleTextFieldChange}
                    name={epName}
                    required={requiredCol.includes(name)}
                    errorMessage={errors[name]}
                />;

            case 'Number':
                return <TextField
                    type="number"
                    label={name}
                    name={name}
                    placeholder={name}
                    styles={textFieldStyles}
                    value={String(formValues[name] || '')}
                    onChange={handleTextFieldChange}
                    required={requiredCol.includes(name)}
                    errorMessage={errors[name]}
                />;

            case 'Choice':
                return (
                    <Dropdown
                        placeholder="Select an option"
                        label={name}
                        options={dropdownOptions[name] || []}
                        styles={dropdownStyles}
                        onChange={(option, index) => handleDropdownChange(option, index, name)}
                        data-name={name}
                        selectedKey={formValues[name]}
                        errorMessage={errors[name]}
                    />
                );

            case 'Person or Group':
                return (
                    <Dropdown
                        placeholder="Select an option"
                        label={name}
                        options={optionsManager}
                        styles={dropdownStyles}
                        onChange={(option, index) => handleDropdownChange(option, index, name)}
                        data-name={name}
                        selectedKey={formValues[name + 'Id'] || undefined}
                        errorMessage={errors[name]}
                    />
                );

            default:
                return <TextField
                    label={name}
                    value={String(formValues[epName] || '')}
                    onChange={handleTextFieldChange}
                    name={epName}
                    required={requiredCol.includes(name)}
                    errorMessage={errors[name]}
                />;
        }
    };

    const validateForm = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        if (!formValues['Title']) {
            newErrors['Title'] = `Please enter Title`
        }

        requiredCol.forEach(code => {
            if (!formValues[code]) {
                newErrors[code] = `Please enter ${code}`
            }
        })
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0;
    }

    const handleDropdownChange = (event?: React.FormEvent<HTMLDivElement>, option?: IDropdownOption, dropdownName?: string) => {
        setFormValues(prevValues => ({
            ...prevValues,
            [dropdownName]: option ? option.key as string : ''
        }));
    }

    const handleTextFieldChange = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
        const { name } = event.currentTarget;
        setFormValues(prevValues => ({
            ...prevValues,
            [name]: newValue || '',
        }));
    };

    const _handleUpdate = async () => {
        try {
            if (id && validateForm()) {
                await pnp.sp.web.lists.getByTitle(name).items.getById(id).update({ ...formValues });
                alert('Success')
            }

        } catch (error) {
            console.error('Error update')
        }
    };

    const _handleDelete = async () => {
        try {
            if (id) {
                await pnp.sp.web.lists.getByTitle(name).items.getById(parseInt(id)).delete();
                window.location.reload()
            }

        } catch (error) {
            console.error(`Error deleting ticket with ID ${id}:`, error);
        }
    }

    const fetchChoices = async (column: string) => {
        try {
            const fields = await pnp.sp.web.lists.getByTitle(name).fields.getByInternalNameOrTitle(column).get();
            const choices = fields.Choices;
            const dropdownOptions = choices.map((choice: string) => ({
                key: choice,
                text: choice
            }))
            setDropdownOptions(prevState => ({
                ...prevState,
                [column]: dropdownOptions
            }));

        } catch (error) {
            console.error(`Error getting choices for field "Status":`, error);
        }
    }

    const fetchTickets = async () => {
        try {
            const getUser = await pnp.sp.web.lists.getByTitle(name).items.getById(id).get();
            const response = await pnp.sp.web.lists.getByTitle(name).fields.filter('CanBeDeleted eq true').get();
            setFormValues(getUser)
            setColumnName(response)

            response.forEach(async (item: any) => {
                if (item.FieldTypeKind === 6) {
                    await fetchChoices(item.Title);
                }
            });
        } catch (error) {
            console.error('Error fetching tickets:', error);
        }
    };

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

    const fetchRequireColumns = async () => {
        try {
            const fields = await pnp.sp.web.lists.getByTitle(name).fields.filter('Required eq true').get();
            const fieldTitle = fields.map((field: any) => field.Title)
            setRequiredCol(fieldTitle)
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
        });
        fetchRequireColumns().catch((error) => {
            console.error('Error in fetchRequireColumns: ', error)
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
                />
                <DefaultButton
                    text="Delete"
                    iconProps={deleteIcon}
                    style={{ width: 'fit-content' }}
                    onClick={_handleDelete}
                    allowDisabledFocus
                />
            </Stack>

            <TextField label={'Title'} placeholder={'Title'} name="Title" value={String(formValues['Title'])} styles={textFieldStyles} onChange={handleTextFieldChange} disabled required />

            {columnName.map((item, index) => (
                <div key={index}>
                    <label>
                        {createInputElement(item.Title, item.EntityPropertyName, item.TypeDisplayName, formValues[item.Title])}
                    </label>
                    <br />
                </div>
            ))}


        </Stack>
    )
}
