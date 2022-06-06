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
var message_routes= require('./routes/message');

//Cargar middlewares
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());//tranforma peticiones (envio de datos) a json

//Cors (permite las cabeceras)
//Cada que se haga una peticion pasa por el middleware obligatoriamente
// configurar cabeceras http
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
 
    next();
});


//Rutas de la pagina  (URL Reescritas)
app.use('/api',user_routes);
app.use('/api',follow_routes );
app.use('/api', publication_routes);
app.use('/api', message_routes);

//Exportar
module.exports=app;//Exportar configuracion de lo que tenga app