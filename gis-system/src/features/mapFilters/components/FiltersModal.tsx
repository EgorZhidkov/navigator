import { Button, Checkbox, Radio, Slider, Space } from 'antd'
import { observer } from 'mobx-react-lite'
import type { FC } from 'react'

import { mapFiltersStore, type IMapFilter } from '@/entities/mapFilters'
import { Modal } from '@/shared/ui'

export const FiltersModal: FC = observer(() => {
  const {
    filters,
    selectedFilters,
    updateFilter,
    resetFilters,
    toggleFiltersWindow,
  } = mapFiltersStore

  const renderFilter = (filter: IMapFilter) => {
    switch (filter.type) {
      case 'checkbox':
        return (
          <Checkbox.Group
            options={filter.options}
            value={selectedFilters[filter.id] as string[]}
            onChange={(values) => updateFilter(filter.id, values)}
            className="w-full"
          />
        )
      case 'radio':
        return (
          <Radio.Group
            options={filter.options}
            value={selectedFilters[filter.id] as string}
            onChange={(e) => updateFilter(filter.id, e.target.value)}
            className="w-full [&_.ant-radio-wrapper]:mb-2 [&_.ant-radio-wrapper:last-child]:mb-0"
          />
        )
      case 'range':
        return (
          <Slider
            range
            min={filter.range?.min}
            max={filter.range?.max}
            step={filter.range?.step}
            value={selectedFilters[filter.id] as [number, number]}
            onChange={(value) =>
              updateFilter(filter.id, value as [number, number])
            }
            className="w-full"
          />
        )
      default:
        return null
    }
  }

  const handleApply = () => {
    toggleFiltersWindow()
  }

  const handleReset = () => {
    resetFilters()
  }

  return (
    <Modal
      title="Фильтры"
      open={mapFiltersStore.isFiltersWindowOpen}
      onCancel={() => toggleFiltersWindow()}
      footer={[
        <Button key="reset" onClick={handleReset}>
          Сбросить
        </Button>,
        <Button key="apply" type="primary" onClick={handleApply}>
          Применить
        </Button>,
      ]}
      width={600}
    >
      <div className="max-h-[60vh] overflow-y-auto pr-4">
        <Space direction="vertical" className="w-full">
          {console.log(filters)}
          {filters.map((filter) => (
            <div key={filter.id} className="w-full mb-6 last:mb-0">
              <div className="font-medium mb-2">{filter.label}</div>
              {renderFilter(filter)}
            </div>
          ))}
        </Space>
      </div>
    </Modal>
  )
})
