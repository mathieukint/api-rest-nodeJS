const express = require('express');
const usersControler = require('./routes/usersControler');
const messagesControler = require('./routes/messagesControler');
const likesControler = require('./routes/likesControler');

exports.router = (function() {

    const apiRouter = express.Router();

    apiRouter.route('/users/register/').post(usersControler.register);
    apiRouter.route('/users/login/').post(usersControler.login);
    apiRouter.route('./users/me/').get(usersControler.getUserProfile);
    apiRouter.route('./users/me/').put(usersControler.updateUserProfile);

    apiRouter.route('./messages/').get(messagesControler.listMessage);
    apiRouter.route('./messages/new/').post(messagesControler.createMessage);
    
    apiRouter.route('./messages/:messageId/vote/like').get(likesControler.listLike);
    apiRouter.route('./messages/:messageId/vote/dislike').post(likesControler.createLike);


    return apiRouter;
})();