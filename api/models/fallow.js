'use strict'
var mongoose=require('mongoose');
var Schema= mongoose.Schema;

var FollowSchema = Schema({//Esquema de follow
    user:{type: Schema.ObjetId, ref: 'User'},
    followed:{type: Schema.ObjetId, ref: 'User'}
});

module.exports=mongoose.model('Follow', FollowSchema);//Para hacer uso fuera