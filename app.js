const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const rutasApp = require('./src/routes/HotelRutas.js')
const adminRutas = require('./src/routes/AdminRutas.js');

const app = express();

const port = 8080  || process.env.PORT || 3000

app.use(bodyParser.json());
app.use(express.static('public'));
app.use(cors());

app.use('/', rutasApp)
app.use('/', adminRutas)

app.listen(port, () => console.log(`Hola, servicio hoteles corriendo en puerto: ${port}`))

