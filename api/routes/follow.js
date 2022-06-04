//Ruta de follow, se tiene una url por cada modelo de la api
'use strict'
var express = require('express');
var FollowController =require('../controllers/follow');//Se carga el controlador de seguir usuario
var api = express.Router();//Se carga el router de express
var md_auth=require('../middlewares/authenticated')//Se carga el midleware de autenticacion

//Se carga la ruta
api.post('/follow', md_auth.ensureAuth,FollowController.saveFollow);
api.delete('/follow/:id', md_auth.ensureAuth,FollowController.deleteFollow);
api.get('/following/:id?/:page?', md_auth.ensureAuth, FollowController.getFollowingUsers);
api.get('/followed/:id?/:page?', md_auth.ensureAuth, FollowController.getFollowedUsers);
api.get('/get-my-follow/:followed?', md_auth.ensureAuth, FollowController.getMyFollows);
module.exports=api;