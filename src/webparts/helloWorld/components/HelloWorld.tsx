import * as React from 'react';
import { IHelloWorldProps } from './IHelloWorldProps';
import './HelloWorld.module.scss';
import TableDataFL from './DataDisplay/TableOfData';

const HelloWorld: React.FC<IHelloWorldProps> = (props: any) => {
  return (
    <section>
      <h1>List</h1>
      <TableDataFL />
    </section>
  );
};

export default HelloWorld;
