import { ConfigProvider } from 'antd'
import RU from 'antd/es/locale/ru_RU'
import * as dayjs from 'dayjs'

import { antdTheme } from '../config/theme'

dayjs.locale('ru')

const withAntAppConfig = (component: () => React.ReactNode) =>
  function withAntConfigProvider() {
    return (
      <ConfigProvider locale={RU} theme={{ ...antdTheme }}>
        {component()}
      </ConfigProvider>
    )
  }

export default withAntAppConfig
