import { colors } from './variables'

const {
  color_transparent,
  color_primary,
  color_link,

  color_violet_400,
  color_violet_500,
  color_violet_600,
  color_violet_800,
  color_violet_900,

  color_blue_200,
  color_blue_400,
  color_blue_500,
  color_blue_600,
  color_blue_700,
  color_blue_900,
  color_blue_800,

  color_gray_100,
  color_gray_200,
  color_gray_300,
  color_gray_400,
  color_gray_500,
  color_gray_600,
  color_gray_700,
  color_gray_800,

  color_red_600,

  color_indigo_200,
  color_neutral_400,
  color_neutral_500,

  color_orange_100,
  color_orange_500,
  color_yellow_200,
  color_yellow_400,
  color_green_100,
  color_green_400,
  color_tag,
  color_error,
  color_info,
  uav_color_primary,
  uav_color_main_bg,
  uav_color_text,
  uav_color_dark,
  uav_color_light,
  uav_color_link,
  uav_color_success,
  uav_color_danger,
  uav_color_warning,
  uav_color_white,
  uav_color_primary_alfa_05,
  uav_color_primary_alfa_10,
  uav_color_primary_alfa_30,
  uav_color_light_alfa_50,
} = colors

const tailwindConfig = {
  content: ['./src/index.html', './src/**/*.{js,ts,jsx,tsx}'],
  important: true,
}

// TODO: посмотреть типы
const tailwindTheme: Pick<unknown, never> = {
  theme: {
    extend: {
      colors: {
        'violet-400': color_violet_400,
        'violet-500': color_violet_500,
        'violet-600': color_violet_600,
        'violet-800': color_violet_800,
        'violet-900': color_violet_900,

        'blue-200': color_blue_200,
        'blue-400': color_blue_400,
        'blue-500': color_blue_500,
        'blue-600': color_blue_600,
        'blue-800': color_blue_800,
        'blue-700': color_blue_700,
        'blue-900': color_blue_900,

        'slate-500': color_primary,

        'color-primary': color_primary,
        transparent: color_transparent,
        'color-link': color_link,

        'gray-100': color_gray_100,
        'gray-200': color_gray_200,
        'gray-300': color_gray_300,
        'gray-400': color_gray_400,
        'gray-500': color_gray_500,
        'gray-600': color_gray_600,
        'gray-700': color_gray_700,
        'gray-800': color_gray_800,

        'red-600': color_red_600,

        error: color_error,
        tag: color_tag,
        info: color_info,

        'indigo-200': color_indigo_200,
        'neutral-400': color_neutral_400,
        'neutral-500': color_neutral_500,
        'orange-100': color_orange_100,
        'orange-500': color_orange_500,
        'yellow-200': color_yellow_200,
        'yellow-400': color_yellow_400,
        'green-100': color_green_100,
        'green-400': color_green_400,

        'uav-color-primary': uav_color_primary,
        'uav-color-main-bg': uav_color_main_bg,
        'uav-color-text': uav_color_text,
        'uav-color-dark': uav_color_dark,
        'uav-color-light': uav_color_light,
        'uav-color-white': uav_color_white,
        'uav-color-link': uav_color_link,
        'uav-color-success': uav_color_success,
        'uav-color-danger': uav_color_danger,
        'uav-color-warning': uav_color_warning,
        'uav-color-primary-alfa-05': uav_color_primary_alfa_05,
        'uav-color-primary-alfa-10': uav_color_primary_alfa_10,
        'uav-color-primary-alfa-30': uav_color_primary_alfa_30,
        'uav-color-light-alfa-50': uav_color_light_alfa_50,
      },
    },
  },
}

export { tailwindConfig, tailwindTheme }
