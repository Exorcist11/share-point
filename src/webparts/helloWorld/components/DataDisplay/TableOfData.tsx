import * as React from 'react';
import { DetailsList, IColumn } from '@fluentui/react/lib/DetailsList';
import { Panel, PanelType } from '@fluentui/react/lib/Panel';
import * as pnp from 'sp-pnp-js';
import { useBoolean } from '@fluentui/react-hooks';
import { IIconProps, Stack, SelectionMode, Checkbox } from '@fluentui/react';
import { CommandBarButton, DefaultButton, PrimaryButton } from '@fluentui/react/lib/Button';
import { FormEdit } from '../FormData/EditForm';
import { TextField } from '@fluentui/react/lib/TextField';
import { ButtonCommandBarExample } from '../Button/ButtonBar';
import { FontIcon } from '@fluentui/react/lib/Icon';

interface IDetailsListBasicExampleItem {
    Id: string;
    title: string;
    category: string;
    description: string;
    status: string;
    requester: string;
    [key: string]: any;
}

const deleteIcon: IIconProps = { iconName: 'Delete' };
const editIcon: IIconProps = { iconName: 'Edit' };
const stackTokens = { childrenGap: 10 };

const TableDataFL: React.FC = () => {
    const [items, setItems] = React.useState<IDetailsListBasicExampleItem[]>([]);
    const [temp, setTemp] = React.useState<IDetailsListBasicExampleItem[]>([]);
    const [isEdit, { setTrue: openEdit, setFalse: dismissEdit }] = useBoolean(false);
    const [idItem, setIdItem] = React.useState<string>('');
    const [sortedColumn, setSortedColumn] = React.useState<string | undefined>(undefined);
    const [isSortedDescending, setIsSortedDescending] = React.useState<boolean>(false);
    const [isOpen, { setTrue: openPanel, setFalse: dismissPanel }] = useBoolean(false);
    const [selectedStatuses, setSelectedStatuses] = React.useState<string[]>([]);

    const renderColumn5 = (item: IDetailsListBasicExampleItem, index: number, column: IColumn) => {
        return (
            <Stack horizontal verticalAlign='center' style={{ textAlign: 'center' }}>
                <CommandBarButton
                    iconProps={editIcon}
                    onClick={() => {
                        handleUpdate(item.Id);
                        openEdit();
                    }}
                />
                <CommandBarButton
                    iconProps={deleteIcon}
                    onClick={() => handleDelete(item.Id)}
                />
            </Stack>
        );
    };

    const handleUpdate = (id: string) => {
        setIdItem(id);
    };

    const handleDelete = async (id: string) => {
        try {
            if (id) {
                await pnp.sp.web.lists.getByTitle('Information').items.getById(parseInt(id)).delete();
                const updatedItems = items.filter(item => item.Id !== id);
                setItems(updatedItems);
            }
        } catch (error) {
            console.error(`Error deleting ticket with ID ${id}:`, error);
        }
    };

    const handleColumnClick = (columnName: string) => {
        const isSortedDescendingNew = sortedColumn === columnName ? !isSortedDescending : false;
        setIsSortedDescending(isSortedDescendingNew);
        setSortedColumn(columnName);

        const sortedItems = [...items].sort((a, b) => {
            const firstValue = a[columnName];
            const secondValue = b[columnName];

            if (isSortedDescendingNew) {
                return firstValue > secondValue ? -1 : 1;
            } else {
                return firstValue > secondValue ? 1 : -1;
            }
        });

        setItems(sortedItems);
    };

    const fetchTickets = async () => {
        try {
            const response = await pnp.sp.web.lists.getByTitle('Information').items.get();
            const formattedTickets: IDetailsListBasicExampleItem[] = response.map((item: any) => ({
                Id: item.ID.toString(),
                title: item.Title,
                category: item.CategoryV2,
                description: item.Description,
                status: item.Status,
                requester: item.RequestorId,
            }));
            setItems(formattedTickets);
            setTemp(formattedTickets);
        } catch (error) {
            console.error('Error fetching tickets:', error);
        }
    };

    const onChangeText = (ev: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const filterText = ev.target.value.toLowerCase();

        const filteredTickets = temp.filter(item =>
            item.title.toLowerCase().includes(filterText)
        );

        setItems(filteredTickets);
    };

    const getSortIcon = (columnName: string) => {
        if (sortedColumn === columnName) {
            return (
                <FontIcon
                    iconName={isSortedDescending ? 'SortDown' : 'SortUp'}
                    style={{ paddingLeft: 8 }}
                />
            );
        }
        return null;
    };

    const _onChange = (status: string, isChecked?: boolean) => {
        setSelectedStatuses(prevStatuses => {
            if (isChecked) {
                return [...prevStatuses, status];
            } else {
                return prevStatuses.filter(s => s !== status);
            }
        });
    };

    const handleFind = () => {
        const filteredItems = temp.filter(item => selectedStatuses.includes(item.status));
        setItems(filteredItems);
        dismissPanel();
    };

    const _columns: IColumn[] = [
        {
            key: 'column1',
            name: 'Action',
            fieldName: 'action',
            minWidth: 100,
            maxWidth: 200,
            isResizable: true,
            onRender: renderColumn5,
        },
        {
            key: 'column2',
            name: 'Title',
            fieldName: 'title',
            minWidth: 100,
            maxWidth: 200,
            isResizable: true,
            isSortedDescending: false,
            sortAscendingAriaLabel: 'Sorted A to Z',
            sortDescendingAriaLabel: 'Sorted Z to A',
            onColumnClick: (ev: React.MouseEvent<HTMLElement>, column: IColumn) => {
                handleColumnClick('title');
            },
            isPadded: true,
            onRenderHeader: (props, defaultRender) => (
                <div>
                    {defaultRender(props)}
                    {getSortIcon('title')}
                </div>
            ),
        },
        {
            key: 'column3',
            name: 'Category',
            fieldName: 'category',
            minWidth: 100,
            maxWidth: 200,
            isResizable: true,
            onColumnClick: (ev: React.MouseEvent<HTMLElement>, column: IColumn) => {
                handleColumnClick('category');
            },
            onRenderHeader: (props, defaultRender) => (
                <div>
                    {defaultRender(props)}
                    {getSortIcon('category')}
                </div>
            ),
        },
        {
            key: 'column4',
            name: 'Description',
            fieldName: 'description',
            minWidth: 100,
            maxWidth: 200,
            isResizable: true,
            onColumnClick: (ev: React.MouseEvent<HTMLElement>, column: IColumn) => {
                handleColumnClick('description');
            },
            onRenderHeader: (props, defaultRender) => (
                <div>
                    {defaultRender(props)}
                    {getSortIcon('description')}
                </div>
            ),
        },
        {
            key: 'column5',
            name: 'Status',
            fieldName: 'status',
            minWidth: 100,
            maxWidth: 200,
            isResizable: true,
            onColumnClick: openPanel,
        },
    ];

    React.useEffect(() => {
        fetchTickets().catch((error) => {
            console.error('Error in fetchTickets useEffect:', error);
        });
    }, []);

    return (
        <div>
            <TextField label="Search by title:" onChange={onChangeText} />
            <ButtonCommandBarExample />
            <DetailsList
                items={items}
                columns={_columns}
                setKey="set"
                selectionMode={SelectionMode.none}
                selectionPreservedOnEmptyClick={true}
                ariaLabelForSelectionColumn="Toggle selection"
                ariaLabelForSelectAllCheckbox="Toggle selection for all items"
                checkButtonAriaLabel="select row"
            />
            <Panel
                headerText="Edit Item"
                isOpen={isEdit}
                type={PanelType.medium}
                onDismiss={dismissEdit}
                closeButtonAriaLabel="Close"
            >
                <FormEdit id={idItem} />
            </Panel>
            <Panel
                headerText="Select Status"
                isOpen={isOpen}
                onDismiss={dismissPanel}
                closeButtonAriaLabel="Close"
            >
                <Stack tokens={stackTokens}>
                    {['Draft', 'On Going', 'Completed', 'Approved', 'Reject'].map(
                        (status) => (
                            <Checkbox label={status} key={status} onChange={(e, isChecked) => _onChange(status, isChecked)} />
                        )
                    )}
                    <Stack horizontal tokens={stackTokens}>
                        <PrimaryButton text='Find' onClick={handleFind} />
                        <DefaultButton text='Cancel' onClick={dismissPanel} />
                    </Stack>
                </Stack>
            </Panel>
        </div>
    );
};

export default TableDataFL;
