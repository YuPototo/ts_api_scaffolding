
import {createServer} from '@dune/server'
import config from "@dune/config"


createServer()
  .then(server => {
    server.listen(config.port, () => {
      console.info(`Listening on http://localhost:${config.port}`)
    })
  })
  .catch(err => {
    console.error(`Error: ${err}`)
  })