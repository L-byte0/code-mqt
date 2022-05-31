//Modelo de las publicaciones
'use strict'//utilizar nuevas caracteristicas
var mongoose=requiere('mongoose')//Cargar modulo de moongose
var Schema = mongoose.Schema;

//
var PublicationSchema = Schema({//Estructura de bd
    text: String,
    file: String,
    create_at:String,
    user: {type: Schema.ObjetID, ref: 'User'}//Se guarda objetId de otro doc y hace referencia al modelo User
})

module.exports=mongoose.model('Publication', publicationSchema);//Exporta modelo