// more info about antd theme tokens here https://ant.design/docs/react/customize-theme

import type { ThemeConfig } from 'antd/es/config-provider/context'
import { theme } from 'antd'

// import { colors } from './variables'

const { darkAlgorithm } = theme

// const {
//   color_primary,
//   color_bg_base,
//   color_error,
//   color_text_placeholder,
//   color_info,
//   color_info_hover,
//   color_link,
//   uav_color_white,
// } = colors

const antdTheme: ThemeConfig = {
  algorithm: darkAlgorithm,
}

export default antdTheme
