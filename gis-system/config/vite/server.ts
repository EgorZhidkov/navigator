import { HttpProxy, ProxyOptions, ServerOptions } from 'vite'
import { VITE_PORT } from '../vars'

const proxyServer = (proxy: HttpProxy.Server, options: ProxyOptions): void => {
  proxy.on('error', (err, _req, _res) => {
    console.log('proxy error', err)
  })
  proxy.on('proxyReq', (proxyReq, req, _res) => {
    console.log('Sending Request to the TargetsRegistry:', req.method, req.url)
  })
  proxy.on('proxyRes', (proxyRes, req, _res) => {
    console.log(
      'Received Response from the TargetsRegistry:',
      proxyRes.statusCode,
      req.url,
    )
  })
}

const proxyDefaultConfig: Partial<ProxyOptions> = {
  changeOrigin: true,
  autoRewrite: true,
  secure: false,
  configure: proxyServer,
}

export const serverOptions: ServerOptions = {
  port: VITE_PORT,
  proxy: {
    '/map': {
      target: 'http://localhost:8001',
      ...proxyDefaultConfig,
      rewrite: (path) => path.replace('/map', ''),
    },
    '/elastic': {
      target: 'http://172.20.10.2:9200',
      ...proxyDefaultConfig,
      rewrite: (path) => path.replace('/elastic', ''),
    },
  },
}
