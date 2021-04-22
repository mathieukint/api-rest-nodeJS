const express = require('express');
const usersControler = require('./routes/usersControler');


exports.router = (function() {

    const apiRouter = express.Router();

    apiRouter.route('/users/register/').post(usersControler.register);
    apiRouter.route('/users/login/').post(usersControler.login);
    apiRouter.route('./users/me/').get(usersControler.getUserProfile);
    apiRouter.route('./users/me/').put(usersControler.updateUserProfile);

    apiRouter.route('./messages/').get(messagesControler.listMessage);
    apiRouter.route('./messages/new/').post(messagesControler.createMessage);
    


    return apiRouter;
})();