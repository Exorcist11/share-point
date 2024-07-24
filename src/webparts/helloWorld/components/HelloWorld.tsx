import * as React from 'react';
import { IHelloWorldProps } from './IHelloWorldProps';
import './HelloWorld.module.scss';
import TableDataFL from './DataDisplay/TableOfData';
import { sp } from 'sp-pnp-js';
import { Dropdown, IDropdownOption } from '@fluentui/react/lib/Dropdown';

const HelloWorld: React.FC<IHelloWorldProps> = (props: any) => {
  const [lists, setLists] = React.useState([]);
  const [selectedList, setSelectedList] = React.useState<string | number>();

  const options: IDropdownOption[] = lists.map(item => ({
    key: item.Title,
    text: item.Title
  }))

  React.useEffect(() => {
    const fetchList = async () => {
      const listData = await sp.web.lists.filter('BaseTemplate eq 100').get();
      setLists(listData)
    }
    fetchList();
  }, [])

  return (
    <section>
      <h1 style={{ textAlign: 'center' }}>SharePoints tranning</h1>

      <Dropdown
        placeholder="Select a list"
        label="Lists"
        options={options}
        onChange={(event, option) => setSelectedList(option.key)}
      />

      {selectedList && <TableDataFL title={String(selectedList)} />}
    </section>
  );
};

export default HelloWorld;
