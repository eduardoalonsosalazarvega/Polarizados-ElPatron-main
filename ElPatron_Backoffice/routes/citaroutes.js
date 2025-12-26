const router = require('express').Router();
const CitaController = require('../controllers/citaController');
const authMiddleware = require("../middlewares/middlewareauth");

// Rutas específicas primero (sin parámetros dinámicos)
router.get('/Cita/disponibilidad', CitaController.obtenerDisponibilidad);
router.get('/Cita/cliente', authMiddleware, CitaController.getCitasPorCliente);
router.post('/Cita/servicios', CitaController.agregarServicioACita);

// Rutas con parámetros dinámicos después
router.get('/Cita/:id/servicios', CitaController.getServiciosDeCita);
router.patch('/Cita/:id/cancelar', CitaController.cancelarCita);

// Ruta base al final
router.route('/Cita')
    .post(CitaController.crearCita)
    .get(CitaController.get)
    .patch(CitaController.editDate);

module.exports = router;