//Metodo para generar token
'use strict'
var jwt = require('jwt-simple');
var moment= require('moment');
var secret='claveSecreta';

exports.createToken=function(user){//Usuario que requiere generar token
    var payload ={
        sub:user._id,//Identificador de documento
        name:user.name,
        surname: user.surname,
        nick: user.nick,
        email: user.email,
        role: user.role,
        image:user.image,
        iat:moment().unix(),//Fecha de creacion del token
        exp:moment().add(30, 'days').unix//Fecha de expriracion del token
    };
    //
    return jwt.encode(payload,secret)//Se pasa info del user y clave
};