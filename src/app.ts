import config from '@dune/config'
import express from 'express';

console.log(config); // 尝试使用 config

const app = express();

const port = 3000;

app.get('/', (req, res) => {
    res.send('Hello World!')
  })
  
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
  })
