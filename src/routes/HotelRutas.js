const express = require("express");
const router = express.Router();
const hotelController = require('../controllers/hotelController');

router.get('/habitaciones', hotelController.getHabitaciones);
router.get('/miReserva/:id', hotelController.getReserva);
router.get('/cancelarReserva/:id', hotelController.cancelarReserva);
router.get('/verHab/:id', hotelController.verHabitacion);
router.post('/reservar', hotelController.reservarHabitacion);

module.exports=router;

