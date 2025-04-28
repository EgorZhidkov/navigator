//  В целом потом можно написать типизацию
type Color = string

export type TargetProbabilityColors = {
  lowScore: Color
  midScore: Color
  highScore: Color
}

export type RadarsColors = {
  byStatus: {
    ENABLE: Color
    DISABLE: Color
  }
  text: Color
  disableText: Color
  icon: Color
  disabledIcon: Color
  baseOpacity: number
  shadowOpacity: number
}

export type CameraColors = {
  main: Color
  icon: Color
}

export type MapThemeTypes = 'default' | 'dark'

export interface MapTheme {
  name: string
  targetProbabilityColors: TargetProbabilityColors
  radarColors: RadarsColors
  cameraColors: CameraColors
  textColor: Color
}
