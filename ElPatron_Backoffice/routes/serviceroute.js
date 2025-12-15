const router = require('express').Router();
const ServiceController = require('../Controllers/servicecontroller');

router.route('/Service')
    .post(ServiceController.createService) // to create new subordinate resources
    .get(ServiceController.get)
    .patch(ServiceController.editService)
    .delete(ServiceController.deleteService)

router.route('/getServiceCategory')
    .post(ServiceController.getServiceCategory)

module.exports = router;