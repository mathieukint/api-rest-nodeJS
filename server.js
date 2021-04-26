/**
 * Imports
 */
const express = require('express');
const bodyParser = require('body-parser');
const apiRouter = require('./apiRouter').router;
const nodemon = require('nodemon');

/**
 * Instanciation
 */
const server = express();

/**
 * Configuration du Body Parser
 */
server.use(bodyParser.urlencoded({extended:true}))
server.use(bodyParser.json());


/**
 * Configuration des Routes
 */
server.get('/', function(req, res) {
    res.setHeader('Content-Type', 'text/html')      //en-tete de la requete reponse http
    res.status(200).send('<h1>Hello, World!</h1>')   //message qui s'affiche en cas de succes (200)
});

server.use('./api/', apiRouter);

/**
 * CallBack
 */
const PORT = 8000;
server.listen(PORT, function() {
    console.log('Serveur en ecoute sur le port '+ PORT + '\n'+Date());
});

