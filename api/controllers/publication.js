'use strict'
/*
    En este controlador se empezara a trabajar con las diferentes rutas y metodos para el backend
    de las publicaciones
*/
//Librerias
var path = require('path');
var fs = require('fs');
var moment = require('moment');
var mongoosePaginate = require('mongoose-pagination');
//Modelos
var Publication = require('../models/publication');
var User = require('../models/user');
var Follow = require('../models/fallow');
const publication = require('../models/publication');

//----------
function probando(req, res) {
    res.status(200).send({
        message: 'Mensaje de publication controler'
    });
}

//-------------Funcion para guardar publicacion
function savePublication(req, res) {
    //Recoge los parametros que llegan por post
    var params = req.body;//Setea los datos a cada una de las propiedades
    //NO puede haber una publicacion que no tenga el parametro texto, si no llega texto
    if (!params.text) return res.status(200).send({ message: 'Debes enviar algun texto' });
    var publication = new Publication();
    publication.text = params.text;
    publication.file = 'null';
    publication.user = req.user.sub; //Dueño de la publicacion
    publication.created_at = moment().unix();//Fecha
    //Guarda la publicacion
    publication.save((err, publicationStored) => {
        if (err) return res.status(500).send({ message: 'Error al guardar publicacion' });
        if (!publicationStored) return res.status(404).send({ message: 'La publicacion no ha sido guardada' });
        return res.status(200).send({ publicationStored });
    })
}
//-------------Fin Funcion para guardar publicacion

//-------------Funcion de devuelve publicaciones de los usuarios
function getPublications(req, res) {
    var page = 1; //Recoger el parametro de la pagina por url
    if (req.params.page) {
        page = req.params.page;
    }
    var itemsPerPage = 4;

    Follow.find({ user: req.user.sub }).populate('followed').exec((err, follows) => {
        if (err) return res.status(500).send({ message: 'Error al devolver seguimiento' });
        //Por cada iteracion se crea un objeto que se llama follow y se obtiene el elemento que se
        //esta recorriendo
        var follows_clean = [];
        follows.forEach((follow) => {
            follows_clean.push(follow.followed);
        });

        Publication.find({ user: { $in: follows_clean } }).sort('created_at').populate('user').paginate(page, itemsPerPage, (err, publications, total) => {

            if (err) return res.status(500).send({ message: 'Error devolver publicaciones' + err });
            if (!publications) return res.status(404).send({ message: 'No hay publicaciones' });

            return res.status(200).send({
                total_items: total,
                pages: Math.ceil(total / itemsPerPage),
                page: page,
                publications
            }
            )
        });
    });

}
//-------------Fin Funcion de time line para las publicaciones

//-------------Devolver publicacion
function getPublication(req, res) {
    //Recoge el id por la url
    var publicationId = req.params.id;

    publication.findById(publicationId, (err, publication) => {
        if (err) return res.status(500).send({ message: 'Error devolver publicaciones' + err });
        if (!publication) return res.status(404).send({ message: 'No hay publicaciones' });

        return res.status(200).send({ publication })
    })
}
//-------------fin devolver publicacion

//---------------ELIMINAR PUBLICACION
//metodo para elimianr las publicaciones
function deletePublication(req, res) {
    //Obtiene id por el url de la publicacion
    var publicationId = req.params.id;
    //Borra la publicacion si el dueño es quien la borra, de otro modo no lo hace
    Publication.findOneAndRemove({ user: req.user.sub, '_id': publicationId }, (err, publicationRemoved) => {

        if (err) return res.status(500).send({ message: 'Error al borrar la publicación.' });

        if (!publicationRemoved) return res.status(404).send({ message: 'No se ha borrado la publicación.' });

        return res.status(200).send({ message: 'se borro la publicacion con exito' });
    });
}
//--------------Eliminar publicacion

//--------------Subir imagen a publicacion
function uploadImage(req, res) {
    //Se recoge el id de la publicacion
    var publicationId = req.params.id;
    if (req.files) {
        var file_path = req.files.image.path;
        var file_split = file_path.split(/[\\/]/);
        var file_name = file_split[2];//Carga nombre del archivo

        var ext_split = file_name.split('\.')//Corta el nombre del archivo por el punto
        var file_ext = ext_split[1];//Extencion del archivo

        //Comprueba que las extenciones sean correctas
        if (file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif') {
            Publication.findOne({ 'user': req.user.sub, '_id': publicationId }).exec((err, publication) => {
                if (publication) {
                    //Actualiza documento del publicacion
                    Publication.findByIdAndUpdate(publicationId, { file: file_name }, { new: true }, (err, publicationUpdated) => {
                        if (err) return res.status(500).send({ message: 'error en la peticion' })
                        if (!publicationUpdated) return res.status(404).send({ message: 'No se ha podido actualizar' })
                        //Todo bien
                        return res.status(200).send({ publication: publicationUpdated });
                    });
                }else {//En caso de que la extencion sea mala
                    return removeFileOfUploads(res, file_path, 'No tienes los permisos necesarios para actualizar');
                }
            })

        } else {//En caso de que la extencion sea mala
            return removeFileOfUploads(res, file_path, 'extencion no valida');
        }

    } else {
        return res.status(200).send({ message: 'No se han subido archivos' });
    }
}
//-------------------------Fin de subir imagen/avatar

//-----------------Inicio Funcion de borrar archivo si no cumple las condiciones
function removeFileOfUploads(res, file_path, message) {
    fs.unlink(file_path, (err) => {
        return res.status(200).send({ message: message });
    });
}
//---------------Fin Funcion de borrar archivo si no cumple las condiciones

//---------------Obtener imagen subida de usuario
function getImage(req, res) {
    let imageFile = req.params.imageFile;
    let pathFile = './upload/publications/' + imageFile;

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



module.exports = {
    probando,
    savePublication,
    getPublications,
    getPublication,
    deletePublication,
    uploadImage,
    getImage
}