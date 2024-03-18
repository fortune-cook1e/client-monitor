# client-monitor

[cookie-client-monitor](https://github.com/fortune-cook1e/client-monitor) client-side javascript exception and tracing library.

- Collect performance metrics and error to your custom api

## Usage
### Install
```bash
npm install cookie-client-monitor --save
or yarn add cookie-client-monitor
or pnpm add cookie-client-monitor
```
### Quick Start
```javascript
import monitor from 'cookie-client-monitor'
```
#### Register
```javascript
monitor.register({
  url:'http://www.backend.com/api', // backend api for collecting metrics
  spa:true, // 
  fmp:true, // Collect FMP (first meaningful paint) data of the first screen
  errors:{
    js:true,
    ajax:true,
    resource:true,
    promise:true
  },
  report:{
    performance:true,
    error:{
      js:true,
      ajax:true,
      resource:true,
      promise:true
    }
  },
  handleError:true
})
```

#### Check example
```bash
npm run dev
```


