import * as React from 'react';
import { DetailsList, IColumn } from '@fluentui/react/lib/DetailsList';
import { MarqueeSelection } from '@fluentui/react/lib/MarqueeSelection';
import * as pnp from 'sp-pnp-js';
import { ButtonCommandBarExample } from '../Button/ButtonBar';
import { IIconProps, Stack, SelectionMode, Selection } from '@fluentui/react';
import { CommandBarButton } from '@fluentui/react/lib/Button';

interface IDetailsListBasicExampleItem {
    Id: string;
    title: string;
    category: string;
    description: string;
    status: string;
    requester: string;
}

const deleteIcon: IIconProps = { iconName: 'Delete' };
const editIcon: IIconProps = { iconName: 'Edit' };

const TableDataFL: React.FC = () => {
    const [items, setItems] = React.useState<IDetailsListBasicExampleItem[]>([]);
    // const [idUser, setIdUser] = React.useState<string>('');

    const renderColumn5 = (item: IDetailsListBasicExampleItem, index: number, column: IColumn) => {
        return <Stack horizontal verticalAlign='center' style={{ textAlign: 'center' }}>
            <CommandBarButton
                iconProps={editIcon}
                onClick={() => handleUpdate(item.Id)}
            />

            <CommandBarButton
                iconProps={deleteIcon}
                onClick={() => handleDelete(item.Id)}
            />
        </Stack>
    }

    const handleUpdate = (id: string) => {
        console.log(id)
    }

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
    }

    const _columns: IColumn[] = [
        { key: 'column1', name: 'Action', fieldName: 'action', minWidth: 100, maxWidth: 200, isResizable: true, onRender: renderColumn5 },
        { key: 'column2', name: 'Title', fieldName: 'title', minWidth: 100, maxWidth: 200, isResizable: true },
        { key: 'column3', name: 'Category', fieldName: 'category', minWidth: 100, maxWidth: 200, isResizable: true },
        { key: 'column4', name: 'Description', fieldName: 'description', minWidth: 100, maxWidth: 200, isResizable: true },
        { key: 'column5', name: 'Status', fieldName: 'status', minWidth: 100, maxWidth: 200, isResizable: true },
    ];

    const fetchTickets = async () => {
        try {
            const response = await pnp.sp.web.lists.getByTitle('Information').items.get();
            const formattedTickets: IDetailsListBasicExampleItem[] = response.map((item: any) => ({
                Id: item.ID.toString(),
                title: item.Title,
                category: item.CategoryV2,
                description: item.Description,
                status: item.Status,
                requester: item.RequestorId
            }));
            setItems(formattedTickets);
        } catch (error) {
            console.error('Error fetching tickets:', error);
        }
    };
    React.useEffect(() => {
        fetchTickets().catch((error) => {
            console.error('Error in fetchTickets useEffect:', error);
        });
    }, []);

    return (
        <div>
            {/* <ButtonCommandBarExample idTicket={idUser} /> */}
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

        </div>
    );
};

export default TableDataFL;
