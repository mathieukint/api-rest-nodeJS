const models = require('../models');
const asyncLib = require('async');
const jwtUtils = require('../utils/jwt.utils');

const TITLE_LIMIT = 2;
const CONTENT_LIMIT = 4;

module.exports = {
    createMessage: function(req, res) {
        const headerAuth = req.headers['authorization'];
        const user_id = jwtUtils.getUserId(headerAuth);

        const message_title = req.body.message_title;
        const message_content = req.body.message_content;

        if (message_title == null || message_content == null) {
            return res.status(400).json({'erreur': "paramètres manquants"});
        }

        if (message_title.length <= TITLE_LIMIT || message_content.length <= CONTENT_LIMIT) {
            return res.status(400).json({'erreur': "paramètres invalides"});
        }
    },
    listMessage: function(req, res) {

    }
}