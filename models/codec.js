const mongoose = require("mongoose");

const codecSchema = mongoose.Schema({
  // _id: mongoose.Schema.Types.ObjectId,
  name: {
    type: String,
    required: true
  },
  nbPeople: {
    type: Number,
    required: true
  },
  mac: {
    type: String,
    required: true,
    unique: true
  },
  ip: {
    type: String,
    default: false,
    required: true
  },
  status: {
    type: Boolean,
    default: false,
    required: true
  },
  publicIp: {
    type: String
  }
});

module.exports = mongoose.model("Codec", codecSchema);
