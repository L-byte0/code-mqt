/*
    En este archivo se crea la conexion y se inicia el servidor de node
    Se hace la carga principal del proyecto
*/
'use strict' //Permite utilizar nuevas caracteristicas de JS
var mongoose = require('mongoose');//importa libreria de mongoose
var app =require('./app')//importa configuracion de express
var port =3800;//Puerto en el que se va a trabajar

//---------Conexion a mongoDB
mongoose.Promise=global.Promise;//Conexion a base de promesas
mongoose.connect('mongodb://localhost:27017/db_mqt')// Se hace la conexion indicando con la URL
    //Si la conexion es correcta
    .then(() => {
      console.log("Conexion a BD correcta");
      //crear servidor
      app.listen(port,() => {
        //Si se crea el servidor correctamente
        console.log("servidor corriendo en http://localhost:3800");
      })
    })
    //Si no es correcta la conexion manda los mensajes de error
    .catch(err => console.log(err));
//--------Final de conexion de mongoDB