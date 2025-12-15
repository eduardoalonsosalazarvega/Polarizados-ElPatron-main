const router = require('express').Router();
const UserController = require('../Controllers/usercontroller');

router.route('/Users')
    .post(UserController.createUser) // to create new subordinate resources
    .get(UserController.get)


router.route('/GetUser')
    .post(UserController.getUser)

module.exports = router;