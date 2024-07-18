import * as React from 'react';
import { DetailsList, IColumn } from '@fluentui/react/lib/DetailsList';
import { Panel, PanelType } from '@fluentui/react/lib/Panel';
import * as pnp from 'sp-pnp-js';
import { useBoolean, useConst } from '@fluentui/react-hooks';
import { IIconProps, Stack, SelectionMode, Checkbox } from '@fluentui/react';
import { CommandBarButton, DefaultButton, PrimaryButton } from '@fluentui/react/lib/Button';
import { FormEdit } from '../FormData/EditForm';
import { TextField } from '@fluentui/react/lib/TextField';
import { ButtonCommandBarExample } from '../Button/ButtonBar';
import { FontIcon } from '@fluentui/react/lib/Icon';
import { ContextualMenu, IContextualMenuProps, IContextualMenuItem, ContextualMenuItemType } from '@fluentui/react/lib/ContextualMenu';

interface IListItem {
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
    const [items, setItems] = React.useState<IListItem[]>([]);
    const [temp, setTemp] = React.useState<IListItem[]>([]);
    const [isEdit, { setTrue: openEdit, setFalse: dismissEdit }] = useBoolean(false);
    const [idItem, setIdItem] = React.useState<string>('');
    const [sortedColumn, setSortedColumn] = React.useState<string | undefined>(undefined);
    const [isSortedDescending, setIsSortedDescending] = React.useState<boolean>(false);
    const [isOpen, { setTrue: openPanel, setFalse: dismissPanel }] = useBoolean(false);
    const [selectedStatuses, setSelectedStatuses] = React.useState<string[]>([]);
    const [menuTarget, setMenuTarget] = React.useState<HTMLElement | undefined>(undefined);
    const [menuProps, setMenuProps] = React.useState<IContextualMenuProps | undefined>(undefined);
    const [genres, setGenres] = React.useState<string[]>([])

    const renderColumn5 = (item: IListItem, index: number, column: IColumn) => {
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

    const handleColumnClick = (columnName: string, ev: React.MouseEvent<HTMLElement>) => {
        const isSortedDescendingNew = sortedColumn === columnName ? !isSortedDescending : false;
        setIsSortedDescending(isSortedDescendingNew);
        setSortedColumn(columnName);

        if (columnName === 'status') {
            setMenuProps({
                items: menuItems,
                target: ev.currentTarget as HTMLElement,
                directionalHint: 12,
                onDismiss: () => setMenuProps(undefined),
            });
            setMenuTarget(ev.currentTarget as HTMLElement);
            return;
        }

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

    const handleSort = (ascending: boolean) => {
        const sortedItems = [...items].sort((a, b) => {
            const firstValue = a[sortedColumn as keyof IListItem];
            const secondValue = b[sortedColumn as keyof IListItem];

            if (ascending) {
                return firstValue > secondValue ? 1 : -1;
            } else {
                return firstValue > secondValue ? -1 : 1;
            }
        });

        setItems(sortedItems);
        setIsSortedDescending(!ascending);
    };

    const fetchTickets = async () => {
        try {
            const response = await pnp.sp.web.lists.getByTitle('Information').items.get();
            const formattedTickets: IListItem[] = response.map((item: any) => ({
                Id: item.ID.toString(),
                title: item.Title,
                category: item.CategoryV2,
                description: item.Description,
                status: item.Status,
                requester: item.RequestorId,
            }));
            setItems(formattedTickets);
            setTemp(formattedTickets);
            const uniqueStatuses = Array.from(new Set(formattedTickets.map(ticket => ticket.status)));
            setGenres(uniqueStatuses);

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
        if (selectedStatuses.length === 0) {
            setItems(temp);
        } else {
            const filteredItems = temp.filter(item => selectedStatuses.includes(item.status));
            setItems(filteredItems);
        }
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
                handleColumnClick('title', ev);
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
                handleColumnClick('category', ev);
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
                handleColumnClick('description', ev);
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
            onColumnClick: (ev: React.MouseEvent<HTMLElement>, column: IColumn) => {
                handleColumnClick('status', ev);
            },
            onRenderHeader: (props, defaultRender) => (
                <div>
                    {defaultRender(props)}
                    {getSortIcon('status')}
                </div>
            ),
        },
    ];
    const handleFilterAndOpenPanel = () => {
        openPanel();


    };
    const menuItems: IContextualMenuItem[] = [
        {
            key: 'atoz',
            text: 'A to Z',
            onClick: () => handleSort(true),
        },
        {
            key: 'ztoa',
            text: 'Z to A',
            onClick: () => handleSort(false),
        },
        {
            key: 'divider_1',
            itemType: ContextualMenuItemType.Divider,
        },
        {
            key: 'filter',
            text: 'Filter',
            onClick: handleFilterAndOpenPanel,
        },
    ];

    React.useEffect(() => {
        fetchTickets().catch((error) => {
            console.error('Error in fetchTickets useEffect:', error);
        });
    }, []);

    return (
        <div>
            <Stack horizontal style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <ButtonCommandBarExample />
                <TextField placeholder="Search by title..." onChange={onChangeText} />
            </Stack>
            {
                selectedStatuses.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} >
                        <p>Status: </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {selectedStatuses.map((status) => (
                                <div key={status} style={{ border: '1px solid', borderRadius: '12px', height: 'fit-content', padding: '4px 16px', margin: '0' }}>
                                    {status}
                                </div>
                            ))}
                        </div>
                    </div>
                )
            }
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
                    {genres.map(
                        (status) => (
                            <Checkbox
                                label={status}
                                key={status}
                                checked={selectedStatuses.includes(status)}
                                onChange={(e, isChecked) => _onChange(status, isChecked)}
                            />
                        )
                    )}
                    <Stack horizontal tokens={stackTokens}>
                        <PrimaryButton text='Find' onClick={handleFind} />
                        <DefaultButton text='Cancel' onClick={dismissPanel} />
                    </Stack>
                </Stack>
            </Panel>

            {menuProps && <ContextualMenu
                items={menuProps.items}
                target={menuTarget}
                onDismiss={menuProps.onDismiss}
                shouldFocusOnMount={true}
            />}
        </div>
    );
};

export default TableDataFL;
