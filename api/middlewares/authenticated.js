'use strict'
/*
Se crea un middleware
Un middleware es un metodo que se va a ajecutar antes de ejecutar la accion del controlador
Se detecta si el token es correcto o no para dejar pasar al metodo de la api
*/
//Se importan librerias para hacer uso de sus metodos
var jwt = require('jwt-simple');
var moment = require('moment');
var secret='claveSecreta';

/*
    req -> Datos que se reciben en la peticion
    res -> Respuesta que se va escupir
    next -> Funcionalidad que va a permitir saltar a otra cosa (Hasta que no se ejecute no sale del middleware)
*/
exports.ensureAuth= function(req, res, next){
    //Se debe llegar una cabecera de autorizacion
    if(!req.headers.authorization){//Si no llega
        return res.status(403).send({message: 'La peticion no tiene cabecera de autenticacion'})
    }
    //Si llega se crea la variable token
    //Token limpio guardado en la variable token
    //Proteje los metodos con autenticacion
    var token = req.headers.authorization.replace(/['"]+/g, '');//Se reemplaza cualquier comilla simple o doble por nada (expresion regular)
    try{
        //Se decodifica el payload (Objeto con todos los datos que tiene el token)
        var payload = jwt.decode(token,secret);
        //Verifica la fecha de creacion del token
        if(payload.exp <= moment().unix()){
            return res.status(401).send({
                message: 'El token ha expirado'
            });
        }
    }catch(ex){
        return res.status(404).send({
            message: 'Token no valido'
        });
    }
    //Todos los datos del usuario del token alojados en el req user
    req.user = payload;
    //saltar a la proxima opcion
    next();
    

}