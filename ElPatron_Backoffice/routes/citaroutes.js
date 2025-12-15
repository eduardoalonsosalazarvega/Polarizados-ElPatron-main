const router = require('express').Router();
const CitaController = require('../controllers/citaController');
const authMiddleware = require("../middlewares/middlewareauth");

router.route('/Cita')
    .post(CitaController.crearCita) // to create new subordinate resources
    .get(CitaController.get)
    .patch(CitaController.editDate)


router.post('/Cita/servicios', CitaController.agregarServicioACita);


router.get('/Cita/disponibilidad', CitaController.obtenerDisponibilidad);
router.patch('/Cita/:id/cancelar', CitaController.cancelarCita);
router.get('/Cita/cliente',authMiddleware, CitaController.getCitasPorCliente);

module.exports = router;