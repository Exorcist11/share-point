import * as React from 'react';
import { IHelloWorldProps } from './IHelloWorldProps';
import './HelloWorld.module.scss';
import TableDataFL from './DataDisplay/TableOfData';

const HelloWorld: React.FC<IHelloWorldProps> = (props: any) => {
  return (
    <section>
      <h1 style={{ textAlign: 'center' }}>SharePoints tranning</h1>
      <TableDataFL />
    </section>
  );
};

export default HelloWorld;
