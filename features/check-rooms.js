const mongoose = require("mongoose");
const request = require("request");

mongoose.connect("mongodb://localhost:27017/room-checker", {
  useNewUrlParser: true
});
mongoose.Promise = global.Promise;

const Codec = require("../models/codec");

function getCodec() {
  return Codec.find({}, (err, docs) => {
    if (!err) {
      return new Promise(resolve => {
        resolve(docs);
      });
    }
    throw err;
  });
}

function getColor(codec) {
  if (codec.status === true) {
    return "Good";
  }
  return "Attention";
}

function getStatus(codec) {
  if (codec.status === true) {
    return "Available";
  }
  return "Busy";
}

function getNbPeople(codec) {
  if (codec.status === true) {
    return "";
  }
  return `: ${codec.nbPeople} people(s)`;
}

function getRoomsAvailable(codecs) {
  const choices = [];
  codecs.forEach(codec => {
    if (codec.status === true) {
      choices.push({
        title: codec.name,
        value: codec.name
      });
    }
  });
  return choices;
}

function getCard(allCodecs, message) {
  const v = [
    {
      type: "TextBlock",
      text: "List of rooms",
      weight: "Bolder"
    }
  ];
  allCodecs.forEach(codec => {
    v.push({
      type: "ColumnSet",
      separator: true,
      columns: [
        {
          type: "Column",
          width: "auto",
          items: [
            {
              type: "TextBlock",
              text: codec.name,
              horizonalAligment: "Right",
              size: "Large",
              weight: "Lighter"
            }
          ]
        },
        {
          type: "Column",
          width: "stretch",
          items: [
            {
              type: "TextBlock",
              text: "Status",
              horizontalAlignment: "Right",
              isSubtle: true
            },
            {
              type: "TextBlock",
              text: getStatus(codec) + getNbPeople(codec),
              horizontalAlignment: "Right",
              spacing: "None",
              size: "Large",
              color: getColor(codec)
            }
          ]
        }
      ],
      spacing: "Large"
    });
  });
  v.push({
    type: "ActionSet",
    actions: [
      {
        type: "Action.ShowCard",
        title: "Book a Room",
        card: {
          type: "AdaptiveCard",
          body: [
            {
              type: "TextBlock",
              text: "Select the room",
              size: "Medium",
              wrap: true
            },
            {
              type: "Input.ChoiceSet",
              id: "RoomChoice",
              style: "compact",
              isMultiSelect: false,
              choices: getRoomsAvailable(allCodecs)
            },
            {
              type: "Input.ChoiceSet",
              id: "MeetingTemp",
              style: "expanded",
              isMultiSelect: false,
              choices: [
                {
                  title: "30min",
                  value: "30"
                },
                {
                  title: "45min",
                  value: "45"
                },
                {
                  title: "60min",
                  value: "60"
                }
              ]
            },
            {
              type: "Input.Text",
              id: "MeetingTitle",
              isMultiline: false,
              placeholder: "Title of your meeting?"
              // "errorMessage": "Please complete this field."
            }
          ],
          actions: [
            {
              type: "Action.Submit",
              title: "OK",
              data: {
                type: "book",
                personEmail: message.personEmail
              }
            }
          ],
          $schema: "http://adaptivecards.io/schemas/adaptive-card.json"
        }
      }
    ]
  });
  return v;
}

function bookRoom(meetingTitle, startTime, endTime, ip, personEmail) {
  const options = {
    method: "POST",
    url: `https://${ip}/bookingsputxml`,
    headers: {
      Authorization: "Basic cHJlc2VuY2U6QzFzYzAxMjM=",
      "Content-Type": "text/xml"
    },
    body: `<?xml version='1.0'?>\n<Bookings item="1" status="OK">\n  <Booking item="1">\n    <Id item="1">1</Id>\n    <Title item="1">${meetingTitle}</Title>\n    <Agenda item="1"></Agenda>\n    <Privacy item="1">Public</Privacy>\n    <Organizer item="1">\n      <FirstName item="1">Demo</FirstName>\n      <LastName item="1"></LastName>\n      <Email item="1"></Email>\n    </Organizer>\n    <Time item="1">\n      <StartTime item="1">${startTime}</StartTime>\n      <StartTimeBuffer item="1">300</StartTimeBuffer>\n      <EndTime item="1">${endTime}</EndTime>\n      <EndTimeBuffer item="1">0</EndTimeBuffer>\n    </Time>\n    <MaximumMeetingExtension item="1">5</MaximumMeetingExtension>\n    <BookingStatus item="1">OK</BookingStatus>\n    <BookingStatusMessage item="1"></BookingStatusMessage>\n    <Webex item="1">\n      <Enabled item="1">False</Enabled>\n      <MeetingNumber item="1"></MeetingNumber>\n      <Password item="1"></Password>\n    </Webex>\n    <Encryption item="1">BestEffort</Encryption>\n    <Role item="1">Master</Role>\n    <Recording item="1">Disabled</Recording>\n    <DialInfo item="1">\n      <Calls item="1">\n        <Call item="1">\n          <Number item="1">${personEmail}</Number>\n          <Protocol item="1">SIP</Protocol>\n          <CallRate item="1">6000</CallRate>\n          <CallType item="1">Video</CallType>\n        </Call>\n      </Calls>\n      <ConnectMode item="1">OBTP</ConnectMode>\n    </DialInfo>\n  </Booking>\n</Bookings>`
  };
  console.log(options.url);
  console.log(options.body);
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

  request(options, (error, response, body) => {
    if (error) throw new Error(error);

    console.log(body);
  });
}

function formatDate(addingTime = 1) {
  const time = new Date().getTime() + addingTime * 60000;
  const date = new Date(time);
  let hours = date.getHours() - 1;
  let day = date.getDate();
  let minutes = date.getMinutes();
  let month = date.getMonth() + 1;
  let seconds = date.getSeconds();
  console.log(hours);
  hours = hours < 10 ? `0${hours}` : hours;
  console.log(hours);
  day = day < 10 ? `0${day}` : day;
  minutes = minutes < 10 ? `0${minutes}` : minutes;
  month = month < 10 ? `0${month}` : month;
  seconds = seconds < 10 ? `0${seconds}` : seconds;
  const strTime = `${hours}:${minutes}:${seconds}`;
  return `${date.getFullYear()}-${month}-${day}T${strTime}Z`;
}

function getOneCodec(param) {
  return Codec.findOne({ name: param }, (err, codec) => {
    if (!err) {
      return new Promise(resolve => {
        resolve(codec);
      });
    }

    throw err;
  });
}

module.exports = async function(controller) {
  controller.hears("rooms", "message,direct_message", async (bot, message) => {
    const allCodecs = await getCodec();
    //console.log(allCodecs);
    await bot.reply(message, {
      text: "Salles disponible",
      attachments: [
        {
          contentType: "application/vnd.microsoft.card.adaptive",
          content: {
            $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
            type: "AdaptiveCard",
            version: "1.0",
            body: getCard(allCodecs, message)
          }
        }
      ]
    });
  });

  controller.on("attachmentActions", async (bot, attachmentActions) => {
    switch (attachmentActions.inputs.type) {
      case "book":
        console.log("ATTACHEMENT_ACTION: triggered");
        const room = attachmentActions.inputs.RoomChoice.split(",");
        const roomName = room[0];
        const meetingTitle = attachmentActions.inputs.MeetingTitle;
        const meetingDuration = attachmentActions.inputs.MeetingTemp;
        const personEmail = attachmentActions.inputs.personEmail;
        const startTime = formatDate();
        const endTime = formatDate(meetingDuration);
        const codec = await getOneCodec(roomName);
        console.log(codec);
        //Codec.findOne({ mac }, (err, updateCodec) => {
        // if (updateCodec) {
        //   updateCodec.name = name;
        //   updateCodec.status = status;
        //   updateCodec.nbPeople = nbPeople;
        //   updateCodec.publicIp = publicIp;
        //    updateCodec.ip = ip;
        //    updateCodec.save();
        //  } else {
        //     newCodec.save((err) => {
        //      res.send(err);
        //    });
        //   }
        // });
        const { ip } = codec;
        console.log(ip);
        //if (meetingTitle)
        bookRoom(meetingTitle, startTime, endTime, ip, personEmail);
        break;
      default:
        break;
    }
  });
};
