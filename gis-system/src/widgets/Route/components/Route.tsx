// import React, { useState } from 'react'
// import { Button, Select, Space } from 'antd'
// import axios from 'axios'

// import type { IRoute } from '@/features'
// import type { IPlace } from '@/entities'

// const { Option } = Select

// const initialRoutes: IRoute[] = []

// export const RouteWidget: React.FC = () => {
//   const [selectedPlaces, setSelectedPlaces] = useState<IPlace[]>([])
//   const [routes, setRoutes] = useState<IRoute[]>(initialRoutes)

//   const handleAddRoute = async () => {
//     if (selectedPlaces.length > 1) {
//       const coordinates = selectedPlaces.map((place) => place.coordinates)

//       const response = await axios.get(
//         `https://api.routing.yandex.net/v2/IRoute?apikey=YOUR_YANDEX_API_KEY&waypoints=${coordinates.map(toLonLat).join(';')}&lang=ru_RU&mode=driving`,
//       )

//       const duration = response.data.IRoute.sections[0].time.text

//       const newRoute: IRoute = {
//         id: Date.now().toString(),
//         name: `IRoute ${routes.length + 1}`,
//         coordinates,
//         duration,
//       }
//       setRoutes([...routes, newRoute])
//       setSelectedPlaces([])
//     }
//   }

//   return (
//     <>
//       <Space direction="vertical" style={{ width: '100%' }}>
//         <Select
//           mode="multiple"
//           placeholder="Select places for IRoute"
//           value={selectedPlaces}
//           onChange={(values) =>
//             setSelectedPlaces(
//               values.map((id) => places.find((place) => place.id === id)!),
//             )
//           }
//           style={{ width: '100%' }}
//         >
//           {places.map((place) => (
//             <Option key={place.id} value={place.id}>
//               {place.name}
//             </Option>
//           ))}
//         </Select>
//         <Button type="primary" onClick={handleAddRoute}>
//           Add IRoute
//         </Button>
//       </Space>
//       <MapWidget routes={routes} />
//     </>
//   )
// }
