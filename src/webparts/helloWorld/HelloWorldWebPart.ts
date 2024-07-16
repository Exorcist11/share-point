import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneDropdown
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import * as strings from 'HelloWorldWebPartStrings';
import HelloWorld from './components/HelloWorld';
import { IHelloWorldProps } from './components/IHelloWorldProps';

export interface IHelloWorldWebPartProps {
  description: string;
  status: string;
  category: string;
  role: string;
}

export default class HelloWorldWebPart extends BaseClientSideWebPart<IHelloWorldWebPartProps> {

  public render(): void {
    const element: React.ReactElement<IHelloWorldProps> = React.createElement(
      HelloWorld,
      {
        description: this.properties.description,
        status: this.properties.status,
        category: this.properties.category,
        role: this.properties.role
      }
    );

    ReactDom.render(element, this.domElement);
  }



  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('category', {
                  label: 'Category'
                }),
                PropertyPaneTextField('description', {
                  label: 'Description',
                  multiline: true
                }),
                PropertyPaneDropdown('status', {
                  label: 'Status',
                  options: [
                    { key: 1, text: 'Draft' },
                    { key: 2, text: 'On Going' },
                    { key: 3, text: 'Completed' },
                    { key: 4, text: 'Approved' },
                    { key: 5, text: 'Rejected' },
                  ]
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
