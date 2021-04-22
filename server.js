/**
 * Imports
 */
const express = require('express');
const bodyParser = require('body-parser');
const apiRouter = require('./apiRouter').router;

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
server.listen(8000, function() {
    console.log('Serveur en ecoute');
});

