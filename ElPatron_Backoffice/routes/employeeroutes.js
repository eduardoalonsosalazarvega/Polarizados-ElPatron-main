const router = require('express').Router();
const EmployeeController = require('../Controllers/employeecontroller');

router.route('/employees')
    .post(EmployeeController.createEmployee) // to create new subordinate resources
    .get(EmployeeController.get); // to retrieve resource representation/information only



router.route('/employees/auth')
    .post(EmployeeController.getEmployee)
    

router.route('/employees/:EmpleadoId')
    .get(EmployeeController.getEmployee) // to retrieve resource representation/information only
    //.put(EmployeeController.editUser) // to update existing resource
    //.delete(EmployeeController.deleteUser)  // to delete resources
    //.patch(()=>{}); // to make partial update on a resource


module.exports = router;