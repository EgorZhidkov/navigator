import type React from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'

const useDynamicSvgImport = (iconName: string) => {
  const importedIconRef = useRef<React.FC<React.SVGProps<SVGElement>>>()
  const [loading, setLoading] = useState(false)
  const [ico, setIco] = useState<string | undefined>()
  const importSvgIcon = useCallback(async (): Promise<void> => {
    try {
      if (!iconName) {
        // eslint-disable-next-line no-param-reassign
        iconName = 'no-icon'
      }
      const iconNameSplit = iconName.split('/')
      let icon
      switch (iconNameSplit.length) {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        case 4:
          icon = await import(
            `../assets/images/${iconNameSplit[0]}/${iconNameSplit[1]}/${iconNameSplit[2]}/${iconNameSplit[3]}.svg`
          )
          break
        case 3:
          icon = await import(
            `../assets/images/${iconNameSplit[0]}/${iconNameSplit[1]}/${iconNameSplit[2]}.svg`
          )
          break
        case 2:
          icon = await import(
            `../assets/images/${iconNameSplit[0]}/${iconNameSplit[1]}.svg`
          )
          break
        default:
          icon = await import(`../assets/images/${iconNameSplit[0]}.svg`)
      }

      importedIconRef.current = icon.ReactComponent
      setIco(importedIconRef.current?.name)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [iconName])

  useEffect(() => {
    setLoading(true)

    importSvgIcon()
      .then((icon) => icon)
      .catch((e) => console.log(e))
  }, [importSvgIcon])

  return [importedIconRef.current, loading, ico]
}
export { useDynamicSvgImport }
