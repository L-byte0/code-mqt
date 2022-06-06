'use strict'
var mongoose=require('mongoose');
var Schema= mongoose.Schema;

var MessageSchema = Schema({//Modelo de mensaje
    text:String,
    viewed: String,
    create_at:String,
    emitter:{type: Schema.ObjectId, ref: 'User'},
    receiver:{type: Schema.ObjectId, ref: 'User'}
});

module.exports=mongoose.model('Message', MessageSchema);

