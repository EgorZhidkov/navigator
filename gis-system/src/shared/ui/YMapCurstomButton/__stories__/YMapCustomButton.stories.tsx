import { Map, YMaps } from '@pbe/react-yandex-maps';
import { Story } from '@storybook/react';
import { ComponentProps, useRef } from 'react';
import { Map as MapClass } from 'yandex-maps';

import { YMapCustomButton } from '../index';

export default {
  title: 'Components/YMapCustomButton',
  component: YMapCustomButton,
};

type TemplateType = Story<ComponentProps<typeof YMapCustomButton>>;

const Template: TemplateType = (
  args: ComponentProps<typeof YMapCustomButton>,
) => {
  const mapRef = useRef<MapClass | undefined>(undefined);
  return (
    <YMaps query={{ apikey: window._env_?.REACT_APP_YMAPS_API_KEY }}>
      <Map
        defaultState={{
          center: [55.684758, 37.738521],
          zoom: 10,
        }}
        width="300px"
        height="300px"
        instanceRef={mapRef}
      >
        <YMapCustomButton
          {...args}
          map={(mapRef as React.MutableRefObject<MapClass | null>).current}
        />
      </Map>
    </YMaps>
  );
};

export const YMapCustomButtonStory: TemplateType = Template.bind({});
YMapCustomButtonStory.storyName = 'YMapCustomButton';
YMapCustomButtonStory.args = {
  defaultOptions: { position: { top: 10, right: 10 }, selectOnClick: false },
  template:
    '<div style="border-radius:10px;height:20px;background-color:white;border:1px solid blue;cursor:pointer;padding:5px">My button</div>',
  onClick: () => {
    console.log('Custom button clicked!');
  },
};
