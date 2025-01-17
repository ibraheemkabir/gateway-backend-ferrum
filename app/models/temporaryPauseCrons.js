"use strict";

var mongoose = require("mongoose");

const schema = mongoose.Schema(
  {
       cronName:{ type: String, required:true, unique: true },
       isActive:{type:Boolean, default: true},
       paused:{type:Boolean, default: false},
       pauseReason:{type:String, required:false},
    }, {
       collection: 'temporaryPauseCrons',
       Timestamps: true
  }
);

const TemporaryPauseCrons = mongoose.model("TemporaryPauseCrons", schema);
module.exports = TemporaryPauseCrons;
