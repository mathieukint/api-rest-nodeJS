const models = require('../models');
const asyncLib = require('async');
const jwtUtils = require('../utils/jwt.utils');

const DISLIKED = 0;
const LIKED    = 1;

module.exports = {
    likePost: function(req, res) {
        const headerAuth = req.headers['authorization'];
        const userId = jwtUtils.getUserId(headerAuth);
        const messageId = parseInt(req.params.messageId);

        if(messageId<=0) {
            return res.status(400).json({'erreur': "paramètres invalides"});
        }

        asyncLib.waterfall([
            function(done) {
                models.Message.findOne({
                    where: { id:messageId }
                })
                .then(function(messageFound) {
                    done(null, messageFound);
                })
                .catch(function(err) {
                    return res.status(500).json({'erreur': "impossible de vérifier le message"});
                });
            },
            function(messageFound, done) {
                if(messageFound) {
                    models.User.findOne({
                        where: {id: userId}
                    })
                    .then(function(userFound) {
                        done(null, messageFound, userFound);
                    })
                    .catch(function(err) {
                        return res.status(500).json({'erreur': "impossible de vérifier l'utilisateur"});
                    });
                } else {
                    res.status(404).json({'erreur': "message déjà aimé"});
                }
            },
            function(messageFound, userFound, done) {
                if(messageFound) {
                    models.Like.findOne({
                        where: {
                            userId: userId,
                            messageId: messageId
                        }
                    })
                    .then(function(userAlreadyLikedFound) {
                        done(null, messageFound, userFound, userAlreadyLikedFound);
                    })
                    .catch(function(err) {
                        return res.status(500).json({'erreur': "impossible de vérifier si l'utilisateur a déjà aimé"});
                    });
                } else {
                    res.status(404).json({'erreur': "l'utilisateur n'existe pas"});
                }
            },
            function(messageFound, userFound, userAlreadyLikedFound, done) {
                if(!userAlreadyLikedFound) {
                    messageFound.addUser(userFound)
                    .then(function(alreadyLikeFound) {
                        done(null, messageFound, userFound);
                    })
                    .catch(function(err) {
                        return res.status(500).json({'erreur': "impossible de définir la réaction de l'utilisateur"});
                    });
                } else {
                    res.status(409).json({'erreur': "message déjà aimé"});
                    if (userAlreadyLikedFound.isLike === DISLIKED) {
                        userAlreadyLikedFound.update({
                          isLike: LIKED,
                        }).then(function() {
                          done(null, messageFound, userFound);
                        }).catch(function(err) {
                          res.status(500).json({'erreur': "mise à jour de la réaction impossible"});
                        });
                    } else {
                        res.status(409).json({'erreur': "message déjà aimé"});
                    }
                }
            },
            function(messageFound, userFound, done) {
                messageFound.update({
                    likes: messageFound.likes + 1,
                })
                .then(function() {
                    done(messageFound);
                })
                .catch(function(err) {
                    res.status(500).json({'erreur': "impossible de mettre à jour le compteur"});
                })
            },
        ], function(messageFound) {
            if(messageFound) {
                return res.status(201).json(messageFound);
            } else {
                return res.status(500).json({'erreur': "impossible de mettre à jour le message"});
            }
        });
    },
    dislikePost: function(req, res) {
        const headerAuth  = req.headers['authorization'];
        const userId      = jwtUtils.getUserId(headerAuth);
     
        const messageId = parseInt(req.params.messageId);
     
        if (messageId <= 0) {
          return res.status(400).json({ 'erreur': 'invalid parameters' });
        }
     
        asyncLib.waterfall([
         function(done) {
            models.Message.findOne({
              where: { id: messageId }
            })
            .then(function(messageFound) {
              done(null, messageFound);
            })
            .catch(function(err) {
              return res.status(500).json({ 'erreur': 'unable to verify message' });
            });
          },
          function(messageFound, done) {
            if(messageFound) {
              models.User.findOne({
                where: { id: userId }
              })
              .then(function(userFound) {
                done(null, messageFound, userFound);
              })
              .catch(function(err) {
                return res.status(500).json({ 'erreur': 'unable to verify user' });
              });
            } else {
              res.status(404).json({ 'erreur': 'post already liked' });
            }
          },
          function(messageFound, userFound, done) {
            if(userFound) {
              models.Like.findOne({
                where: {
                  userId: userId,
                  messageId: messageId
                }
              })
              .then(function(userAlreadyLikedFound) {
                 done(null, messageFound, userFound, userAlreadyLikedFound);
              })
              .catch(function(err) {
                return res.status(500).json({ 'erreur': 'unable to verify is user already liked' });
              });
            } else {
              res.status(404).json({ 'erreur': 'user not exist' });
            }
          },
          function(messageFound, userFound, userAlreadyLikedFound, done) {
           if(!userAlreadyLikedFound) {
             messageFound.addUser(userFound, { isLike: DISLIKED })
             .then(function (alreadyLikeFound) {
               done(null, messageFound, userFound);
             })
             .catch(function(err) {
               return res.status(500).json({ 'erreur': 'unable to set user reaction' });
             });
           } else {
             if (userAlreadyLikedFound.isLike === LIKED) {
               userAlreadyLikedFound.update({
                 isLike: DISLIKED,
               }).then(function() {
                 done(null, messageFound, userFound);
               }).catch(function(err) {
                 res.status(500).json({ 'erreur': 'cannot update user reaction' });
               });
             } else {
               res.status(409).json({ 'erreur': 'message already disliked' });
             }
           }
          },
          function(messageFound, userFound, done) {
            messageFound.update({
              likes: messageFound.likes - 1,
            }).then(function() {
              done(messageFound);
            }).catch(function(err) {
              res.status(500).json({ 'erreur': 'impossible de mettre à jour le compteur' });
            });
          },
        ], function(messageFound) {
          if (messageFound) {
            return res.status(201).json(messageFound);
          } else {
            return res.status(500).json({ 'erreur': 'cannot update message' });
          }
        });
    }
}