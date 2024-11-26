import express from 'express';
import { getUsers } from './database/database.js';
const app = express()
const port = 3000


app.get('/', (req, res) => {
  res.send('Farmacia Deserete')
})

app.get('/userRooms', async(req, res) =>{
  try {
    res.status(200).json(await getUsers())
  }
  catch(error){
    console.error(error)
    res.status(500).json({ message: 'Error: no se pudo hallar la información' })
  }
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})