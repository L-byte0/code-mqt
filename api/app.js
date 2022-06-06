/*Se configura todo lo que tenga que ver con express
 Este app.js se usa para carga de ficheros, configuraciones, etc.
*/

var express =require('express');//Trabajar con rutas y HTTP
var bodyParser= require('body-parser');//Convertir las peticiones a objetos en js

var app=express();//Carga framework

//Cargar rutas
var user_routes= require('./routes/user')
var follow_routes = require('./routes/follow');
var publication_routes = require('./routes/publication');

//Cargar middlewares
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());//tranforma peticiones (envio de datos) a json

//Cors

//Rutas de la pagina  (URL Reescritas)
app.use('/api',user_routes);
app.use('/api',follow_routes );
app.use('/api', publication_routes);

//Exportar
module.exports=app;//Exportar configuracion de lo que tenga app