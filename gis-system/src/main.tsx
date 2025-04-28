import 'antd/dist/reset.css' // Стили Ant Design
import './index.css' // Стили Tailwind
import 'ol/ol.css'

import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import ReactDOM from 'react-dom/client'

import App from '@/app'

dayjs.extend(utc)
dayjs.extend(timezone)

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(<App />)
