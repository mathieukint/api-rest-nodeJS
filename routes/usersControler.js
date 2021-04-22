const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
const jwtUtils = require('../utils/jwt.utils');
const models = require('../models');
const asyncLib = require('async');

const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const PWD_REGEX = /^(?=.*\d).{4,8}$/;

module.exports = {
    
    register: function(req, res) {

        // Params
        const user_email = req.body.user_email;
        const user_name = req.body.user_name;
        const user_password = req.body.user_password;
        const user_bio = req.body.user_bio;
        const user_isAdmin = req.body.user_isAdmin;


        if(user_name.length<=3 || user_name>=12) {
            return res.status(400).json({'erreur': "le nom d'utilisateur doit contenir 3 à 12 caractères"});
        }

        if(user_email == null || user_name == null || user_password == null) {
            return res.status(400).json({'erreur': 'paramètres manquants'});
        }

        if(!EMAIL_REGEX.test(user_email)) {
            return res.status(400).json({'erreur': "le mail n'est pas valide"});
        }

        if(!PWD_REGEX.test(user_password)) {
            return res.status(400).json({'erreur': "le mot de passe doit contenir 4 à 8 caractères et au moins 1 chiffre"});
        }

        asyncLib.waterfall([
            function(done) {
                models.User.findOne({
                    attributes: ['user_email'],
                    where: {user_email: user_email}
                })
                .then(function(userFound) {
                    done(null, userFound);
                })
                .catch(function(err) {
                    return res.status(500).json({'erreur': "impossible de trouver cet utilisateur"});
                });
            },
            function(userFound, done) {
                if(!userFound) {
                    bcrypt.hash(user_password, 5, function(err, bcryptedPassword) {
                        done(null, userFound, bcryptedPassword);
                    });
                } else {
                    return res.status(409).json({'erreur': "cet utilisateur existe déjà"});
                }
            },
            function(userFound, bcryptedPassword, done) {
                const newUser = models.User.create({
                    user_email: user_email,
                    user_name: user_name,
                    user_password: user_password,
                    user_bio: user_bio,
                    user_isAdmin: 0,
                })
                .then(function(newUser) {
                    done(newUser);
                })
                .catch(function(err) {
                    return res.status(500).json({'erreur': "impossible d'ajouter cet utilisateur"});
                });
            }
        ], function(err) {
            if(!err) {
                return res.status(200).json({'msg': 'ok'});
            } else {
                return res.status(404).json({'erreur': 'erreur'});
            }
        });

    },

    login: function(req, res) {
    
        // Params
        var user_email    = req.body.user_email;
        var user_password = req.body.user_password;
    
        if (user_email == null ||  user_password == null) {
          return res.status(400).json({'erreur': 'paramètres manquants'});
        }
    
        asyncLib.waterfall([
          function(done) {
            models.User.findOne({
              where: { user_email: user_email }
            })
            .then(function(userFound) {
              done(null, userFound);
            })
            .catch(function(err) {
              return res.status(500).json({ 'erreur': "impossible de trouver cet utilisateur" });
            });
          },
          function(userFound, done) {
            if (userFound) {
              bcrypt.compare(password, userFound.password, function(errBycrypt, resBycrypt) {
                done(null, userFound, resBycrypt);
              });
            } else {
              return res.status(404).json({'erreur': "cet utilisateur n'existe pas dans la base de données"});
            }
          },
          function(userFound, resBycrypt, done) {
            if(resBycrypt) {
              done(userFound);
            } else {
              return res.status(403).json({'error': "mot de passe invalide"});
            }
          }
        ], function(userFound) {
          if (userFound) {
            return res.status(201).json({
              'user_id': userFound.id,
              'token': jwtUtils.generateTokenForUser(userFound)
            });
          } else {
            return res.status(500).json({'erreur': "impossible de connecter cet utilisateur"});
          }
        });
    },

    getUserProfile: function(req, res) {

        const headerAuth = req.headers['authorization'];
        const user_id = jwtUtils.getUserId(headerAuth);

        if(user_id<0) {
            return res.status(400).json({'erreur': "Token erroné"});
        }

        models.User.findOne({
            attributes: ['user_id', 'user_name', 'user_email', 'user_bio'],
            where: {id: user_id}
        })
        .then(function(user) {
            if(user) {
                res.status(201).json(user);
            } else {
                res.status(404).json({'erreur': "utilisateur introuvable"});
            }
        })
        .catch(function(err) {
            res.status(500).json({'erreur': "impossible de récupérer cet utilisateur"})
        });
    },

    updateUserProfile: function(req, res) {

        const headerAuth = req.headers['authorization'];
        const user_id = jwtUtils.getUserId(headerAuth);
        const user_bio = req.body.user_bio;

        asyncLib.waterfall([
            function(done) {
                models.User.findOne({
                    attributes: ['user_id', 'user_bio'],
                    where: {id: user_id}
                })
                .then(function(userFound) {
                    done(null, userFound);
                })
                .catch(function(err) {
                    return res.status(500).json({'erreur': "impossible de vérifier cet utilisateur"})
                });
            },
            function(userFound, done) {
                if(userFound) {
                    userFound.update({
                        user_bio: (user_bio ? user_bio : userFound.user_bio)
                    })
                    .then(function() {
                        done(userFound);
                    })
                    .catch(function(err) {
                        res.status(500).json({'erreur': "impossible de mettre à jour l'utilisateur"});
                    });
                } else {
                    res.status(500).json({'erreur': "utilisateur introuvable"});
                }
            }
        ], function(userFound) {
            if(userFound) {
                return res.status(201).json(userFound);
            } else {
                return res.status(500).json({'erreur': "impossible de mettre à jour le profil utilisateur"});
            }
        });
    }
}
