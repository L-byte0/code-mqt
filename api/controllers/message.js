'use strict'
var moment = require('moment');
var mongoosePaginate = require('mongoose-pagination');
//Se cargan modelos
var User = require('../models/user');
var Follow = require('../models/fallow');
var Message = require('../models/message');

//Metodo de prueba
function probandoA(req, res) {
    res.status(200).send({ message: 'Modulo de mensaje' });
}

//------------- funcion Guardar mensaje
function saveMessage(req, res) {
    //Acceder a los parametros que llega por post
    var params = req.body;
    //Comprueba si existe params.text que es lo que interese como texto del mensaje y el receiver
    if (!params.text || !params.receiver) return res.status(200).send({ message: 'Envía los datos necesarios' });
    //Se crea un nuevo objeto message
    var message = new Message();
    //Se setean los valores, se da un nuevo valor
    message.emitter = req.user.sub;
    message.receiver = params.receiver;
    message.text = params.text;
    message.created_at = moment().unix();
    message.viewed = 'false';
    //GUarda el mensaje
    message.save((err, messageStored) => {
        if (err) return res.status(500).send({ message: 'Error en la petición' });
        if (!messageStored) return res.status(500).send({ message: 'Error al enviar el mensaje' });

        return res.status(200).send({ message: messageStored });
    });
}
//--------------Fin de funcion de guardar mensaje

//--------------Recibir mensajes
function getReceivedMessages(req, res) {
    var userId = req.user.sub;
    var page = 1;
    if (req.params.page) { //Si llega por la url
        page = req.params.page;
    }

    var itemsPerPage = 4;//Listar 4 usuarios por paginas

    Message.find({ receiver: userId }).populate('emitter', 'name surname image nick _id ').paginate(page, itemsPerPage, (err, messages, total) => {
        if (err) return res.status(500).send({ message: 'Error en la peticion' });
        if (!messages) return res.status(404).send({ message: 'Sin mensajes' })
        return res.status(200).send({
            total: total,
            pages: Math.ceil(total / itemsPerPage),
            messages
        });
    });
}
//--------------Fin de resivir mensaje

//--------------listar mensajes enviados
function getEmmitMessages(req, res) {
    var userId = req.user.sub;
    var page = 1;
    if (req.params.page) { //Si llega por la url
        page = req.params.page;
    }

    var itemsPerPage = 4;//Listar 4 usuarios por paginas

    Message.find({ emitter: userId }).populate('emitter receiver', 'name surname image nick _id').paginate(page, itemsPerPage, (err, messages, total) => {
        if (err) return res.status(500).send({ message: 'Error en la peticion' });
        if (!messages) return res.status(404).send({ message: 'Sin mensajes' })
        return res.status(200).send({
            total: total,
            pages: Math.ceil(total / itemsPerPage),
            messages
        });
    });
}
//--------------Fin de mensajes enviados

//--------------Mensajes sin leer
function getUnviewedMessages(req, res) {
    var userId = req.user.sub; //Usuario logeado

    Message.count({ receiver: userId, viewed: 'false' }).exec((err, count) => {
        if (err) return res.status(500).send({ message: 'Error en la peticion' });
        return res.status(200).send({
            'unviewed': count
        })
    })
}
//--------------fin Mensajes sin leer

//-------------Mensajes leidos
 function setViewedMessages(req, res){
     var userId = req.user.sub;

     Message.updateMany({receiver: userId, viewed: 'false'},{viewed: 'true'}, {"multi": true,}, (err, messageUpdate) => {
        if (err) return res.status(500).send({ message: 'Error en la peticion' });
        return res.status(200).send({
            messages: messageUpdate
        })
     });
 }
//-------------Mensajes leidos

module.exports = {
    probandoA,
    saveMessage,
    getReceivedMessages,
    getEmmitMessages,
    getUnviewedMessages,
    setViewedMessages
}