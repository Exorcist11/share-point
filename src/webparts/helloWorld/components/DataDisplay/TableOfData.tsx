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
import { ContextualMenu, IContextualMenuProps, IContextualMenuItem, ContextualMenuItemType } from '@fluentui/react/lib/ContextualMenu';

interface IListItem {
    Id: string;
    title: string;
    [key: string]: any;
}

interface TableDataFLProps {
    title: string;
}

const deleteIcon: IIconProps = { iconName: 'Delete' };
const editIcon: IIconProps = { iconName: 'Edit' };
const stackTokens = { childrenGap: 10 };

const TableDataFL: React.FC<TableDataFLProps> = ({ title }) => {
    const [detailList, setDetailList] = React.useState([])
    const [temp, setTemp] = React.useState<IListItem[]>([]);
    const [isEdit, { setTrue: openEdit, setFalse: dismissEdit }] = useBoolean(false);
    const [idItem, setIdItem] = React.useState<string>('');

    const [status, setStatus] = React.useState([])
    const [isOpen, { setTrue: openPanel, setFalse: dismissPanel }] = useBoolean(false);
    const [selectedStatuses, setSelectedStatuses] = React.useState<string[]>([]);
    const [menuTarget, setMenuTarget] = React.useState<HTMLElement | undefined>(undefined);
    const [menuProps, setMenuProps] = React.useState<IContextualMenuProps | undefined>(undefined);
    const [genres, setGenres] = React.useState<string[]>([])
    const [columns, setColumns] = React.useState([])
    const [pickColumn, setPickColumn] = React.useState('')



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
                await pnp.sp.web.lists.getByTitle(title).items.getById(parseInt(id)).delete();
                const updatedItems = detailList.filter(item => item.Id !== id);
                setDetailList(updatedItems);
            }
        } catch (error) {
            console.error(`Error deleting ticket with ID ${id}:`, error);
        }
    };



    const fetchTickets = async () => {
        try {
            const response = await pnp.sp.web.lists.getByTitle(title).items.get();
            setDetailList(response)
            setTemp(response)
        } catch (error) {
            console.error('Error fetching tickets:', error);
        }
    };

    const fetchColumns = async () => {
        try {
            const response = await pnp.sp.web.lists.getByTitle(title).fields.filter('CanBeDeleted eq true').get();
            setColumns(response)
        } catch (error) {
            console.error('Error fetching columns: ', error)
        }
    }

    const onChangeText = (ev: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const filterText = ev.target.value.toLowerCase();

        const filteredTickets = temp.filter(item =>
            item.Title.toLowerCase().includes(filterText)
        );

        setDetailList(filteredTickets);
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

    const handleColumnClick = (columnName: string, ev: React.MouseEvent<HTMLElement>) => {
        setMenuProps({
            items: menuItems(columnName),
            target: ev.currentTarget as HTMLElement,
            directionalHint: 12,
            onDismiss: () => setMenuProps(undefined),
        });
        setMenuTarget(ev.currentTarget as HTMLElement);
        return;
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
            fieldName: 'Title',
            minWidth: 100,
            maxWidth: 200,
            isResizable: true,
            isSortedDescending: false,
            sortAscendingAriaLabel: 'Sorted A to Z',
            sortDescendingAriaLabel: 'Sorted Z to A',
            onColumnClick: (ev: React.MouseEvent<HTMLElement>, column: IColumn) => {
                handleColumnClick('Title', ev);
            },
            isPadded: true,
            onRenderHeader: (props, defaultRender) => (
                <div>
                    {defaultRender(props)}
                </div>
            ),
        }
    ];

    for (let i = 0; i < columns.length; i++) {
        const itemNeed: IColumn = {
            key: `column${i + 2}`,
            name: columns[i].Title,
            fieldName: columns[i].EntityPropertyName,
            minWidth: 100,
            maxWidth: 200,
            isResizable: true,
            isSortedDescending: false,
            sortAscendingAriaLabel: 'Sorted A to Z',
            sortDescendingAriaLabel: 'Sorted Z to A',
            onColumnClick: (ev: React.MouseEvent<HTMLElement>, column: IColumn) => {
                handleColumnClick(columns[i].EntityPropertyName, ev);
            },
            isPadded: true,
            onRenderHeader: (props, defaultRender) => (
                <div>
                    {defaultRender(props)}
                </div>
            ),
        }
        _columns.push(itemNeed)
    }

    const handleFind = async (columnName: string) => {
        // const uniqueTickets = Array.from(new Set(detailList.map((item) => item[columnName])));
        // setGenres(uniqueTickets);
        // setPickColumn(columnName)
        if (selectedStatuses.length === 0) {
            setDetailList(temp);
        } else {
            const filteredItems = temp.filter(item => selectedStatuses.includes(item[columnName]));
            setDetailList(filteredItems);
            setStatus(genres)
        }
        dismissPanel();
    };

    const handleFilterAndOpenPanel = async (columnName: any) => {
        const uniqueTickets = Array.from(new Set(detailList.map((item) => item[columnName])));
        setGenres(uniqueTickets);
        setPickColumn(columnName)
        openPanel();

    };

    const handleSort = (columnName: string, isSortedDescending: boolean) => {
        const sortedItems = [...detailList].sort((a, b) => {
            if (a[columnName] < b[columnName]) {
                return isSortedDescending ? 1 : -1;
            }
            if (a[columnName] > b[columnName]) {
                return isSortedDescending ? -1 : 1;
            }
            return 0;
        });

        setDetailList(sortedItems);
    }


    const menuItems = (columnName: string): IContextualMenuItem[] => [
        {
            key: 'atoz',
            text: 'A to Z',
            onClick: () => handleSort(columnName, false),
        },
        {
            key: 'ztoa',
            text: 'Z to A',
            onClick: () => handleSort(columnName, true),
        },
        {
            key: 'divider_1',
            itemType: ContextualMenuItemType.Divider,
        },
        {
            key: 'filter',
            text: 'Filter',
            onClick: () => handleFilterAndOpenPanel(columnName),
        },
    ];

    React.useEffect(() => {
        fetchTickets().catch((error) => {
            console.error('Error in fetchTickets useEffect:', error);
        });
        fetchColumns().catch((error) => {
            console.error('Error in fetchColumns useEffect:', error);
        });
    }, [title]);


    return (
        <div style={{ marginTop: '30px' }}>
            <Stack horizontal style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <ButtonCommandBarExample />
                <TextField placeholder="Search by title..." onChange={onChangeText} />
            </Stack>
            {
                status.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} >
                        <p>Status: </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {selectedStatuses.map((status) => (
                                <div key={status} style={{ border: '1px solid', borderRadius: '12px', height: 'fit-content', padding: '4px 16px', margin: '0', display: 'flex', alignItems: 'end', gap: '8px' }}>
                                    <div>{status}</div>
                                    <FontIcon aria-label="CalculatorMultiply" iconName="CalculatorMultiply" style={{ cursor: 'pointer' }} />
                                </div>
                            ))}
                        </div>
                    </div>
                )
            }
            <DetailsList
                items={detailList}
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
                headerText={`Filter by ${pickColumn}`}
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
                        <PrimaryButton text='Find' onClick={() => handleFind(pickColumn)} />
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
