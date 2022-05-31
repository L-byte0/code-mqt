/*Se configura todo lo que tenga que ver con express*/

var express =require('express');//Trabajar con rutas y HTTP
var bodyParser= require('body-parser');//Convertir las peticiones a objetos en js

var app=express();//Carga framework

//Cargar rutas
var user_routes= require('./routes/user')

//Cargar middlewares
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());//tranforma peticiones (envio de datos) a json

//Cors

//Rutas de la pagina  (URL Reescritas)
app.use('/api',user_routes);

//Exportar
module.exports=app;//Exportar configuracion de lo que tenga app