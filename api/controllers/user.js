'use strict'
//Importa el modelo de usuario, la variable inicia con letra mayuscula para indicar que es un modelo
var User = require('../models/user');
var Follow  = require('../models/fallow');
var bcrypt = require('bcrypt');//Paquete para cifrar contraseña
var jwt = require('../services/jwt');
var mongoosePaginate = require('mongoose-pagination')
var fs = require('fs'); //Permite trabajar con archivos
var path = require('path');//Permite trabajar con rutas de ficheros

//Funcion de las rutas
function home(req, res) {
    res.status(200).send({
        message: 'Prueba de servidor node.js'
    });
}

function pruebas(req, res) {
    console.log(req.body);
    res.status(200).send({
        message: 'Prueba de servidor node.js'
    });
}

//----------------Metodo para registrar usuario en db
function saveUser(req, res) {
    var params = req.body;//Todos los parametros que lleguen por post se guardan en la variable
    var user = new User();
    if (params.name && params.surname && params.nick && params.email && params.password) {
        //Si todos los datos son true guarda los parametros
        user.name = params.name;
        user.surname = params.surname;
        user.nick = params.nick;
        user.email = params.email;
        user.role = 'ROLE_USER';
        user.image = null;
        /*Controlar ususaior duplicados
        Las condiciones incluidas en el array son las que se van a guardar
        Busca todos los registros en la bd, si alguna de las dos se cumple regresa los datos*/
        User.find({
            $or: [{ email: user.email.toLowerCase() },
            { nick: user.nick.toLowerCase() }
            ]
        }).exec((err, users) => {//Comprueba si el error llega
            if (err) return res.status(500).send({ message: 'Error en la peticion de usuarios' });
            //Si existen los usuarios
            //SI se cumplen las condiciones ni siquiera pasa al bcrypt
            if (users && users.length >= 1) {
                return res.status(200).send({ message: 'Usuario que intenta registrar ya existe' })
            } else {
                //Cifra contraseña y guarda los datos
                bcrypt.hash(params.password, 10, function (err, hash) {
                    user.password = hash;

                    user.save((err, userStored) => {
                        if (err) return res.status(500).send({ message: 'Error al guardar usuario' });
                        //Comprueba si el userStore existe
                        if (userStored) {
                            res.status(200).send({ user: userStored });
                        } else {
                            res.status(404).send({ message: 'No se ha registrado el usuario' })
                        }
                    });
                });
            }
        })
    } else {//Si no llegan correctamente
        res.status(200).send({
            message: 'Envia todos los campos necesarios'
        });
    }
}
//----------------------Fin metodo de registrar

//----------------------Funcion de login
function loginUser(req, res) {
    var params = req.body;
    var email = params.email; //Variable para email
    var password = params.password;//Variable para password
    //Buscar si hay conincidencia en la BD
    User.findOne({ email: email }, (err, user) => {
        //Si se produce un error
        if (err) return res.status(200).send({ message: 'error en la peticion' });
        //Si todo esta bien
        if (user) {
            //Compara la contraseña de la bd con bcrypt
            bcrypt.compare(password, user.password, (err, check) => {
                //Si todo va bien
                if (check) {
                    //Devuelve datos del usuario
                    //Comprobar si se llega parametro por post
                    if (params.gettoken) {
                        //Generar y Devolver token
                        //En el token se guardan los datos del usuario, clave secreta, fecha de creacion token etc.
                        //Todo encriptado y se puede hacer proceso inverso a devolver datos
                        return res.status(200).send({
                            token: jwt.createToken(user)
                        });
                    } else {
                        //Devolver tados del usuario
                        user.password = undefined;//Elimina la propiedad del objeto (No muestra la contraseña)
                        return res.status(200).send({ user });
                    }
                } else {
                    return res.status(404).send({ message: 'Usuario no se pudo identificar' });
                }
            });
        } else {
            //Si el usuario no existe
            return res.status(404).send({ message: 'Usuario no existe' });
        }
    });
}
//----------------------Fin de funcion de login

//----------------------Conseguir datos del usuario
function getUser(req, res) {
    var userId = req.params.id;
    User.findById(userId, (err, user) => {
        if (err) return res.status(500).send({ message: 'Error en la peticion' });
        if (!user) return res.status(404).send({ message: 'usuario no existe' });
        //-------------------Sigo a este usuario?
        //Comprueba si nosotros como user identificado estamos siguiendo al usuario que llega por el url
        //Se usa exec para ejecutar la quiero
        Follow.findOne({'user': req.user.sub, "followed": userId}).exec((err, follow) => {
            //Comprueba si esta siguiendo al usuario
            if (err) return res.status(500).send({ message: 'Error al comprobar el seguimiento' });
            return res.status(200).send({user, follow});
        })
        //------------------Fin de sigo a este usuario
    });
}

//----------------------Fin de conseguir los datos del usuario

//----------------------Funcion para listar los usuarios paginados
//Recibe por un url una paginando el listado de usuarios
function getUsers(req, res) {
    var identity_user_id = req.user.sub; //ide del usuario logeado
    var page = 1;
    if (req.params.page) {//Comprueba que llega por url la pagina
        //Se tiene id y la pagina
        page = req.params.page;
    }
    var itemsPage = 5; //Lista de usuarios por pagina
    User.find().sort('_id').paginate(page, itemsPage, (err, users, total) => {
        if (err) return res.status(500).send({ message: 'error en la peticion'});
        if (!users) return res.status(404).send({ message: 'No usuarios en la plataforma' });
        //devolver usuarios
        return res.status(200).send({
            users,
            total,
            page: Math.ceil(total/itemsPage)//Redondeo y saca el numero de paginas que van a existir
        });

    });
}
//----------------------Fin de funcion para usuarios paginados

//---------------------Actualizar los datos del usuario
function updateUser(req, res){
    var userId = req.params.id;
    var update = req.body;
    //Borrar la propiedad password
    delete update.password;

    if(userId != req.user.sub){//el userid que se recibe por url tiene que ser el mismo que el que tiene el objeto del token
        return res.status(500).send({message: 'No tienes permiso para actualizar los datos'});
    }
    User.findByIdAndUpdate(userId, update, {new: true}, (err, userUpdated) =>{
        if (err) return res.status(500).send({message: 'error en la peticion'})
        if(!userUpdated) return res.status(404).send({message: 'No se ha podido actualizar el usuario'})
        //Todo bien
        return res.status(200).send({user: userUpdated});
    });
};

//-------------------------Fin de actualizar usuario

//-------------------------Inicio de subir imagen/avatar
function uploadImage(req, res){
    var userId = req.params.id;
    if(req.files){
        var file_path = req.files.image.path;
        console.log(file_path);
        var file_split = file_path.split(/[\\/]/);
        var file_name=file_split[2];//Carga nombre del archivo
        console.log(file_name);

        var ext_split = file_name.split('\.')//Corta el nombre del archivo por el punto
        console.log(ext_split);
        var file_ext = ext_split[1];//Extencion del archivo
        console.log(file_ext);

        if(userId != req.user.sub){//el userid que se recibe por url tiene que ser el mismo que el que tiene el objeto del token
            return removeFileOfUploads(res, file_path, 'No tienes permiso para actualizar los datos');
        }
        
        //Comprueba que las extenciones sean correctas
        if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif'){
            //Actualiza documento del usuario logeado
            User.findByIdAndUpdate(userId, {image: file_name}, {new: true}, (err, userUpdated) => {
                if (err) return res.status(500).send({message: 'error en la peticion'})
                if(!userUpdated) return res.status(404).send({message: 'No se ha podido actualizar el usuario'})
                //Todo bien
                return res.status(200).send({user: userUpdated});
            });
        }else{//En caso de que la extencion sea mala
            return removeFileOfUploads(res, file_path, 'extencion no valida');
        }

    }else{
        return res.status(200).send({message: 'No se han subido archivos'});
    }
}
//-------------------------Fin de subir imagen/avatar

//-----------------Inicio Funcion de borrar archivo si no cumple las condiciones
function removeFileOfUploads(res, file_path, message){
    fs.unlink(file_path, (err) => {
        return res.status(200).send({message: message});
    });
}
//---------------Fin Funcion de borrar archivo si no cumple las condiciones

//---------------Obtener imagen subida de usuario
function getImage(req, res) {
    let imageFile = req.params.imageFile;
    let pathFile = './upload/users/' + imageFile;
 
    fs.stat(pathFile, (err, exists) => {
        if (exists) {
            res.sendFile(path.resolve(pathFile));
        } else {
            return res.status(404).send({
                message: 'No existe la imagen'
            })
        }
    });
}
//----------------Fin de obtener imagen



//Exporta las funciones de los modelos para que puedan ser utilizadas fuera del archivo
module.exports = {
    home,
    pruebas,
    saveUser,
    loginUser,
    getUser,
    getUsers,
    updateUser,
    uploadImage,
    getImage
}
