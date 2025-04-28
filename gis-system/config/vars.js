import path from 'path'

// eslint-disable-next-line no-undef
export const ROOT_PATH = process.cwd()
export const SRC_PATH = path.resolve(ROOT_PATH, 'src/')
export const BUILD_PATH = path.resolve(ROOT_PATH, 'build')
export const SRC_CONFIG_PATH = path.resolve(ROOT_PATH, 'src/app/config')
export const VITE_PORT = 8000
