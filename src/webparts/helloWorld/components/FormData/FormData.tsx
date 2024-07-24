import * as React from "react";
import { TextField, ITextFieldStyles } from '@fluentui/react/lib/TextField';
import { Stack } from '@fluentui/react/lib/Stack';
import { DefaultButton } from '@fluentui/react/lib/Button';
import { IIconProps } from '@fluentui/react';
import * as pnp from 'sp-pnp-js';
import { Dropdown, IDropdownOption, IDropdownStyles } from '@fluentui/react/lib/Dropdown';

const textFieldStyles: Partial<ITextFieldStyles> = { fieldGroup: {} };

const stackTokens = { childrenGap: 8 };

const addIcon: IIconProps = { iconName: 'Add' };

export interface IGroup {
    Id: number;
    Title: string;
}

export interface IFormData {
    name: string;
}

export const FormInsert: React.FC<IFormData> = ({ name }) => {
    const [group, setGroup] = React.useState<IGroup[]>([]);
    const [columnName, setColumnName] = React.useState<any[]>([]);
    const [formValues, setFormValues] = React.useState<{ [key: string]: string | number }>({});
    const [dropdownOptions, setDropdownOptions] = React.useState<{ [key: string]: IDropdownOption[] }>({});
    const [errors, setErrors] = React.useState<{ [key: string]: string }>({});
    const [requiredCol, setRequiredCol] = React.useState([]);
    const [uniqueCol, setUniqueCol] = React.useState([]);

    const handleDropdownChange = (event?: React.FormEvent<HTMLDivElement>, option?: IDropdownOption, dropdownName?: string) => {
        setFormValues(prevValues => ({
            ...prevValues,
            [dropdownName]: option ? option.key as string : ''
        }));
    };

    const handleTextFieldChange = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
        const { name } = event.currentTarget;
        setFormValues(prevValues => ({
            ...prevValues,
            [name]: newValue || '',
        }));
    };

    const _handleSubmit = async () => {
        try {
            if (await validateForm() === true) {
                const dataToSend = { ...formValues };
                await pnp.sp.web.lists.getByTitle(name).items.add(dataToSend);
                alert(`${name} added successfully!`)
            }
        } catch (error) {
            console.error('Đã xảy ra lỗi khi gửi dữ liệu:', error);
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

    const createInputElement = (name: string, type: string, value: string | number) => {
        switch (type) {
            case "Multiple lines of text":
                return <TextField
                    label={name}
                    placeholder={name}
                    multiline
                    value={String(formValues[name] || '')}
                    styles={textFieldStyles}
                    onChange={handleTextFieldChange}
                    name={name}
                    required={requiredCol.includes(name)}
                    errorMessage={errors[name]}
                />;

            case "Single line of text":
                return <TextField
                    label={name}
                    placeholder={name}
                    value={String(formValues[name] || '')}
                    styles={textFieldStyles}
                    onChange={handleTextFieldChange}
                    name={name}
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
                        selectedKey={formValues[name] || undefined}
                        required={requiredCol.includes(name)}
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
                        selectedKey={formValues[name] || undefined}
                        required={requiredCol.includes(name)}
                    />
                );

            default:
                return <TextField
                    label={name}
                    value={String(formValues[name] || '')}
                    onChange={handleTextFieldChange}
                    name={name}
                    required={requiredCol.includes(name)}
                    errorMessage={errors[name]}
                />;
        }
    };

    const validateForm = async (): Promise<boolean> => {
        const newErrors: { [key: string]: string } = {};

        if (!formValues['Title']) {
            newErrors['Title'] = `Please enter Title`
        }

        requiredCol.forEach(code => {
            if (!formValues[code]) {
                newErrors[code] = `Please enter ${code}`
            }
        })

        for (const code of uniqueCol) {
            if (formValues[code]) {
                const items = await pnp.sp.web.lists.getByTitle(name).items.filter(`${code} eq '${formValues[code]}'`).get();

                if (items.length > 0) {
                    newErrors[code] = `${code} already exists.`;
                }
            }
        }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0;
    }

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

    const fetchColumns = async () => {
        try {
            const response = await pnp.sp.web.lists.getByTitle(name).fields.filter('CanBeDeleted eq true').get();
            setColumnName(response);

            response.forEach(async (item: any) => {
                if (item.FieldTypeKind === 6) {
                    await fetchChoices(item.Title);
                }
            });
        } catch (error) {
            console.error('Error fetching columns: ', error);
        }
    };

    const fetchRequireColumns = async () => {
        try {
            const fields = await pnp.sp.web.lists.getByTitle(name).fields.filter('Required eq true').get();
            const uniq = await pnp.sp.web.lists.getByTitle(name).fields.filter('EnforceUniqueValues eq true').get();
            const colUniq = uniq.map((u: any) => u.Title)
            setUniqueCol(colUniq)
            const fieldTitle = fields.map((field: any) => field.Title)
            setRequiredCol(fieldTitle)
        } catch (error) {
            console.error(error)
        }
    }
    React.useEffect(() => {
        fetchGroup().catch(e => {
            console.error('Error in fetchGroup: ' + e);
        });
        fetchColumns().catch(e => {
            console.error('Error in fetchColumns: ' + e);
        });
        fetchRequireColumns().catch((error) => {
            console.error('Error in fetchRequireColumns: ', error)
        });
    }, []);

    return (
        <Stack tokens={stackTokens}>
            <DefaultButton
                text="Create"
                iconProps={addIcon}
                style={{ width: 'fit-content' }}
                onClick={_handleSubmit}
                allowDisabledFocus
            />

            <TextField
                label={'Title'}
                placeholder={'Title'}
                name="Title"
                styles={textFieldStyles}
                onChange={handleTextFieldChange}
                errorMessage={errors['Title']}
                required
            />

            {columnName.map((item, index) => (
                <div key={index}>
                    <label>
                        {createInputElement(item.Title, item.TypeDisplayName, formValues[item.Title] || '')}
                    </label>
                    <br />
                </div>
            ))}
        </Stack>
    );
};
