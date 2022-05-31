'use strict'
var mongoose=require('mongoose');
var Schema= mongoose.Schema;

var MessageSchema = Schema({//Modelo de mensaje
    text:String,
    create_at:String,
    emitter:{type: Schema.ObjetId, ref: 'User'},
    receiver:{type: Schema.ObjetId, ref: 'User'}
});

module.exports=mongoose.model('Message', MessageSchema);

