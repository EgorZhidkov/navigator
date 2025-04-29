import { Button, withYMaps } from '@pbe/react-yandex-maps'
import { ComponentProps, useEffect, useMemo } from 'react'
import { observer } from 'mobx-react'
import { useYandexMap } from '@/shared/hooks'

interface IProps extends ComponentProps<typeof Button> {
  id: string
  onClick?: () => void
  template?: string
  overrides?: Record<string, any>
}

export const YMapCustomButton: React.FC<IProps> = observer(
  ({ id, onClick, template, overrides, yandexMetricsTarget, ...other }) => {
    const map = useYandexMap()
    const CustomButtonComponent = useMemo(() => {
      return ({ ymaps }: { ymaps?: any }) => {
        if (!map || !ymaps) {
          console.log('YMapCustomButton->map or ymaps not initialized')
          return null
        }

        let prevButton: any = undefined
        map.controls.each((control: any) => {
          if (!prevButton && control.data._data.id === id) {
            prevButton = control
          }
        })

        if (!prevButton) {
          try {
            const customLayout = template
              ? ymaps.templateLayoutFactory.createClass(template, overrides)
              : undefined

            const button = new ymaps.control.Button({
              ...other,
              data: { ...other.data, id },
              options: {
                layout: customLayout,
                ...other.options,
              },
            })

            if (onClick) {
              button.events.add('click', () => {
                onClick()
              })
            }

            map.controls.add(button)
            console.log('YMapCustomButton->button added')
          } catch (e) {
            console.error('YMapCustomButton->error creating button', e)
          }
        } else {
          try {
            Object.keys(other.options || []).forEach((option) => {
              const optionValue = other.options
                ? other.options[option as keyof typeof other.options]
                : undefined
              if (optionValue) {
                prevButton.options.set(option, optionValue)
              }
            })
            console.log('YMapCustomButton->button updated')
          } catch (e) {
            console.error('YMapCustomButton->error updating button', e)
          }
        }
        return null
      }
    }, [id, map, onClick, other, overrides, template, yandexMetricsTarget])

    useEffect(
      () => () => {
        if (!map) return

        let prevButton: any = undefined
        map.controls.each((control: any) => {
          if (!prevButton && control.data._data.id === id) {
            prevButton = control
          }
        })
        if (prevButton) {
          map.controls.remove(prevButton)
          console.log('YMapCustomButton->button removed')
        }
      },
      [id, map],
    )

    const CustomButtonElement = useMemo(() => {
      return withYMaps(CustomButtonComponent, true, [
        'templateLayoutFactory',
        'control.Button',
        'util.bind',
        'util.bounds',
      ])
    }, [CustomButtonComponent])

    return <CustomButtonElement />
  },
)
