const DataStore = require("nedb");
// database used for logs
const database = new DataStore("logs.db");
const mongoose = require("mongoose");

database.loadDatabase();
mongoose.connect("mongodb://localhost:27017/room-checker", {
  useNewUrlParser: true
});
mongoose.Promise = global.Promise;

//  __   __  ___        ___
// |__) /  \  |  |__/ |  |
// |__) \__/  |  |  \ |  |

// This is the main file for the template bot.

// Import Botkit's core features
const { Botkit } = require("botkit");

// Import a platform-specific adapter for webex.
const { WebexAdapter } = require("botbuilder-adapter-webex");
const Codec = require("./models/codec");

// Load process.env values from .env file
require("dotenv").config();

// Load random UUID generator
// const uuidv4 = require('uuid/v4');

const adapter = new WebexAdapter({
  access_token: process.env.ACCESS_TOKEN,
  public_address: process.env.PUBLIC_ADDRESS,
  secret: "room-checker"
});

const controller = new Botkit({
  webhook_uri: "/api/messages",
  adapter,
  storage: null
});

// Once the bot has booted up its internal services, you can use them to do stuff.
controller.ready(() => {
  // load traditional developer-created local custom feature modules
  controller.loadModules(`${__dirname}/features`);
});

controller.botCommons = {
  healthCheck: `${process.env.PUBLIC_ADDRESS}/ping`,
  upSince: new Date(Date.now()).toGMTString(),
  version: `v${require("./package.json").version}`,
  owner: process.env.OWNER,
  support: process.env.SUPPORT,
  platform: process.env.PLATFORM,
  code: process.env.CODE
};

// /////////////////////// CONTROLLER ICI ///////////////////////////
controller.webserver.get("/", (req, res) => {
  res.send(`This app is running Botkit ${controller.version}.`);
});

controller.webserver.get("/ping", (req, res) => {
  res.send(JSON.stringify(controller.botCommons, null, 4));
});

/** This controller insert or update codecs informations in db
 * (The informations are send by macro)
 */
controller.webserver.post("/update", async (req, res) => {
  try {
    const c = req.body.Status.RoomAnalytics;
  } catch (error) {
    res.status(409).json({ error: "RoomAnalytics issue: undefined" });
  }
  const publicIp =
    req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const ip = req.body.Status.Identification.IPAddress.Value;
  const roomAnalytics = req.body.Status.RoomAnalytics;
  const mac = req.body.Status.Identification.MACAddress.Value;
  const name = req.body.Status.Identification.ProductID.Value;
  console.log(req.body.Status.Identification);
  let nbPeople;
  let status;
  const codec = await getOneCodec(mac);
  if (codec) {
    nbPeople = codec.nbPeople;
    status = codec.status;
  } else {
    nbPeople = 0;
    status = true;
  }

  if (roomAnalytics.PeoplePresence) {
    console.log("Presence DETECTED:");
    if (roomAnalytics.PeoplePresence === "Yes") {
      console.log("YES");
      status = false; // room busy
    } else {
      console.log("NO");
      status = true; // room available
    }
  }

  if (roomAnalytics.PeopleCount) {
    nbPeople = roomAnalytics.PeopleCount.Current;
    if (nbPeople > 0) {
      status = false; // room busy
    }
  }
  if (roomAnalytics.PeoplePresence === "Yes" || nbPeople > 0) {
    status = false;
  } else status = true;
  console.log(mac, name, status, nbPeople);
  const newCodec = new Codec({
    mac,
    name,
    status,
    nbPeople,
    publicIp
  });
  Codec.findOne({ mac }, (err, updateCodec) => {
    if (updateCodec) {
      updateCodec.name = name;
      updateCodec.status = status;
      updateCodec.nbPeople = nbPeople;
      updateCodec.publicIp = publicIp;
      updateCodec.ip = ip;
      updateCodec.save();
    } else {
      newCodec.save(err => {
        res.send(err);
      });
    }
  });
  // var d = new Date();
  // const info = {
  //     mac: mac,
  //     ip:ip,
  //     name: name,
  //     nbPeople: nbPeople,
  //     status: status,
  //     time: d.getTime(),
  // }
  // database.insert(info, function (err, newDoc) {
  //     res.send(err);
  // });
});

controller.webserver.post("/webhook", async (req, res) => {
  console.log("INSIDEEEE");
  console.log(req.body);
});

// //////////////////////// FIN CONTROLLER ///////////////////////////

controller.checkAddMention = function(roomType, command) {
  const botName = adapter.identity.displayName;

  if (roomType == "group") {
    return `\`@${botName} ${command}\``;
  }

  return `\`${command} \``;
};

console.log(`Health check available at: ${controller.botCommons.healthCheck}`);

function getOneCodec(mac) {
  return Codec.findOne({ mac }, (err, codec) => {
    if (!err) {
      return new Promise(resolve => {
        resolve(codec);
      });
    }

    throw err;
  });
}
