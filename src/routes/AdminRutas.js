const express = require('express')
const router = express.Router()
const adminController = require('../controllers/adminController')
const verificarToken = require('../middleware/auth.js');

router.post('/login', adminController.login)

router.get('/verHabitaciones', verificarToken, adminController.getHabitaciones);
router.post('/nuevaHabitacion', verificarToken, adminController.nuevaHabitacion);
router.put('/editarHabitacion', verificarToken, adminController.editarHabitacion);
router.delete('/eliminarHabitacion/:id', verificarToken, adminController.eliminarHabitacion);

module.exports = router