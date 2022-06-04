'use strict'
//Controlador de seguimiento de usuarios
//var path = require('path');//Libreria path
//var fs = require('fs');
var mongoosePaginate = require('mongoose-pagination');
var User = require('../models/user');//Se carga el modelo de usuario
var Follow = require('../models/fallow');//Carga modelo de follow

function saveFollow(req, res) {//Metodo para guardar seguirores, recibe request y responsive
    var params = req.body;//Recoge resultados por body del post
    var follow = new Follow();//Setear el valor a cada una de las propiedades
    follow.user = req.user.sub;//en el user que sigue guarda el id 
    follow.followed = params.followed;//El usuario seguido sera el usuario que se pasa por la peticion

    follow.save((err, followStored) => {//Guarda objeto en la base de datos (followStored => objeto o documento guardado)
        if (err) return res.status(500).send({ message: 'Error al guardar seguimiento' });
        //En caso de que no guarde el follow
        if (!followStored) return res.status(404).send({ message: 'El seguimiento no se ha guardado' })
        //En caso de que vaya todo bien devuelve el objeto follow, es decir el follow que se ha guardado
        return res.status(200).send({ followStored });
    });
}

function deleteFollow(req, res) {
    var userId = req.user.sub;//Recoge el usuario que esta siguiendo
    var followId = req.params.id;//Usuario al que se va a dejar de seguir, se pasa por url
    Follow.findOneAndDelete({
        'user': userId,
        'followed': followId
    }, (err) => {//Pasa el usuario logeado y el usuario que se va a dejar de seguir por el url    
        if (err) return res.status(500).send({ message: 'Error al dejar de seguir' });
        return res.status(200).send({ message: 'Follow se ha eliminado' });
    });
}

function getFollowingUsers(req, res) {
    var userId = req.user.sub; //Se guarda el id del usuario
    if (req.params.id && req.params.page) { //Si llega por userid
        userId = req.params.id;
    }
    var page = 1;
    if (req.params.page) { //Si llega por la url
        page = req.params.page;
    } else {
        page = req.params.id;
    }
    var itemsPerPage = 4;//Listar 4 usuarios por paginas

    Follow.find({ user: userId }).populate({ path: 'followed' }).paginate(page, itemsPerPage, (err, follows, total) => {
        if (err) return res.status(500).send({ message: 'Error en el servidor' });
        if (!follows) return res.status(404).send({ message: 'No estas siguiendo a ningun usuario' })
        return res.status(200).send({
            total: total,
            pages: Math.ceil(total / itemsPerPage),
            follows
        });
    });
}

function getFollowedUsers(req, res) {
    var userId = req.user.sub; //Se guarda el id del usuario

    if (req.params.id && req.params.page) { //Si llega por userid
        userId = req.params.id;
    }

    var page = 1;

    if (req.params.page) { //Si llega por la url
        page = req.params.page;
    } else {
        page = req.params.id;
    }
    var itemsPerPage = 4;//Listar 4 usuarios por paginas

    Follow.find({ followed: userId }).populate('user').paginate(page, itemsPerPage, (err, follows, total) => {
        if (err) return res.status(500).send({ message: 'Error en el servidor' });
        if (!follows) return res.status(404).send({ message: 'No te sigue ningun usuario' })
        return res.status(200).send({
            total: total,
            pages: Math.ceil(total / itemsPerPage),
            follows
        });
    });
};
//---------------------------Devolver listado de usuarios que sigo
function getMyFollows(req, res) {
    var userId = req.user.sub;
    var find= Follow.find({ user: userId });
    if(req.params.followed){
        find = Follow.find({followed: userId});
    }
    find.populate('user followed').exec((err, follows) => {
        if (err) return res.status(500).send({ message: 'Error en el servidor' });
        if (!follows) return res.status(404).send({ message: 'No sigues a ningun usuario' })
        return res.status(200).send({follows});
    });
}
//---------------------------Fin Devolver listado usuarios que sigo

module.exports = {
    saveFollow,
    deleteFollow,
    getFollowingUsers,
    getFollowedUsers,
    getMyFollows
}