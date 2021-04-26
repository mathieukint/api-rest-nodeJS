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

        async.waterfall([
            function(done) {
                models.User.findOne({
                    where: {id: user_id}
                })
                .then(function(userFound) {
                    done(null, userFound);
                })
                .catch(function(err) {
                    return res.status(500).json({'erreur': "impossible de vérifier l'utilisateur"});
                });
            },
            function(userFound, done) {
                if(userFound) {
                    models.Message.create({
                        title   : title,
                        content : content,
                        likes   : 0,
                        UserId  : userFound.id
                    })
                    .then(function(newMessage) {
                        done(null, userFound, newMessage);
                    });
                } else {
                    res.status(404).json({'erreur': "utilisateur introuvable"});
                }
            },
        ],
        function(newMessage) {

        });
    },
    listMessage: function(req, res) {
        const fields = req.query.fields;
        const limit = parseInt(req.query.limit);
        const offset = parseInt(req.query.offset);
        const order = req.query.order;

        models.Message.findAll({
            order       : [(order!=null) ? order.split(':') : ['title', 'ASC']],
            attributes  : (fields !== '*' && fields != null) ? fields.split(',') : null,
            limit       : (!isNaN(limit)) ? limit : null,
            offset      : (!isNaN(offset)) ? offset : null,
            include     : [{
                models      : models.User,
                attributes  : ['user_name']
            }]
        })
        .then(function(messages) {
            if(messages) {
                res.status(200).json(messages);
            } else {
                res.status(404).json({'erreur': "messages introuvables"});
            }
        })
        .catch(function(err) {
            console.log(err);
            res.status(500).json({'erreur': "champ invalide"});
        });
    }
}