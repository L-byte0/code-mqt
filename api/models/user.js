'use strict'//Nuevos estandares de js
var mongoose=require('mongoose');//
var Schema=mongoose.Schema; //Definir nuevo esquema
//------------Modelo de los usuarios
var UserSchema=Schema({ //Definir campos para la base de datos
    name:String,
    surname: String,
    nick: String,
    email: {type: String, select:true, unique:false},
    password: {type: String, select:true},
    role: String,
    image:String
})//Estructura de los objetos (entidad a reutilizar para crear nuevo usuario)

//
module.exports = mongoose.model('User', UserSchema)//Entidad y los campos (esquema) que se va a ir utilizando
//-----------Fin de modelo de usuarios