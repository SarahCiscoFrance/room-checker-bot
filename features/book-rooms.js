const { BotkitConversation } = require('botkit');

const mongoose = require('mongoose');

mongoose.connect(
  'mongodb://localhost:27017/room-checker',
  {
    useNewUrlParser: true,
  },
);
mongoose.Promise = global.Promise;

const Codec = require('../models/codec');

const request = require("request");

function getCodec() {
  return Codec.find({}, (err, docs) => {
    if (!err) {
      return new Promise((resolve) => {
        resolve(docs);
      });
    }
    throw err;
  });
}

function getStringRoomsAvailable(codecs) {
  let choices = '';
  let cpt = 0;
  codecs.forEach((codec) => {
    if (codec.status === true) {
      choices += `${cpt}. ${codec.name}\n`;
      cpt++;
    }
  });
  return new Promise((r) => r(choices));
}

function getRoomsAvailable(codecs) {
  const choices = [];
  codecs.forEach((codec) => {
    if (codec.status === true) {
      choices.push(codec);
    }
  });
  return choices;
}


module.exports = function (controller) {
  const convo = new BotkitConversation('book_dialog', controller);

  convo.ask('Do you want to book a room?', [
    {
      pattern: '^yes|Yes|yep$',
      handler: async (response, convo, bot) => {
        await convo.setVar('guess', response);
        const codecs = await getCodec();
        const rooms = await getStringRoomsAvailable(codecs);
        await convo.setVar('rooms', rooms);
        await convo.gotoThread('yes');
      },
    },
    {
      pattern: '^no|No|nop$',
      handler: async (response, convo, bot) => {
        await convo.setVar('guess', response);
        await convo.gotoThread('no');
      },
    },
    {
      default: true,
      handler: async (response, convo, bot) => {
        await convo.gotoThread('incorrect');
      },
    },
  ]);

  convo.addMessage({
    text: 'You said "{{ vars.guess }}" :) Ok which one :\n{{vars.rooms}}',
    action: 'next_step',
  }, 'yes');

  convo.addMessage({
    text: 'You said "no" ok',
    action: 'complete',
  }, 'no');

  convo.addMessage({
    text: 'Sorry, I did not understand  \nTry again!',
    action: 'repeat',
  }, 'incorrect');

  // ///
  convo.addQuestion('Select the room number you want to book', [
    {
      pattern: '([0-9]|[1-8][0-9]|9[0-9]|100)',
      handler: async (response, convo, bot) => {
        await convo.gotoThread('time');
      },
    },
    {
      default: true,
      handler: async (response, convo, bot) => {
        await convo.gotoThread('incorrect');
      },
    },
  ], { key: 'number' }, 'next_step');

  convo.addQuestion('Times in minute ?', [
    {
      pattern: '([0-9]|[1-8][0-9]|9[0-9]|100)',
      handler: async (response, convo, bot) => {
        await convo.gotoThread('title');
      },
    },
    {
      default: true,
      handler: async (response, convo, bot) => {
        await convo.gotoThread('incorrect');
      },
    },
  ], { key: 'time' }, 'time');

  convo.addQuestion('The title of the meeting ?', [
    {
      pattern: '[a-z]',
      handler: async (response, convo, bot) => {
        await convo.gotoThread('finish');
      },
    },
    {
      default: true,
      handler: async (response, convo, bot) => {
        await convo.gotoThread('incorrect');
      },
    },
  ], { key: 'title' }, 'title');

  convo.addMessage({
    text: 'Ok I book this room',
    action: 'complete',
  }, 'finish');

  convo.after(async (results, bot) => {
    console.log(results);
    console.log(results.number);
    console.log(results.time);
    console.log(results.title);
    const { number } = results;
    const { time } = results;
    const { title } = results;
    const rooms = await getCodec();
    const availableRooms = getRoomsAvailable(rooms);
    const room = availableRooms[number]; // the room choose by the user

    ////////////

//     var options = { method: 'POST',
//       url: 'https://10.228.52.154/bookingsputxml',
//       headers: 
//       { 'cache-control': 'no-cache',
//         Connection: 'keep-alive',
//         'Content-Length': '1440',
//         Host: '10.228.52.154',
//         'Cache-Control': 'no-cache',
//         Accept: '*/*',
//         '': '',
//         Authorization: 'Basic cHJlc2VuY2U6QzFzYzAxMjM=',
//         'Content-Type': 'application/xml' 
//       },
//       body:  '   <?xml version=\'1.0\'?>  '  + 
//       '         <Bookings item="1" status="OK">   '  + 
//       '           <Booking item="1">  '  + 
//       '             <Id item="1">1</Id>  '  + 
//       '             <Title item="1">'+title+'</Title>  '  + 
//       '             <Agenda item="1"></Agenda>  '  + 
//       '             <Privacy item="1">Public</Privacy>     '  + //Titre meeting VISIBLE
//       '             <Organizer item="1">  '  + 
//       '               <FirstName item="1">Demo</FirstName>     '  + 
//       '               <LastName item="1"></LastName>    '  + 
//       '               <Email item="1"></Email>  '  + 
//       '             </Organizer>  '  + 
//       '             <Time item="1">  '  + 
//       '               <StartTime item="1">2020-02-06T10:02:57Z</StartTime>       '  + 
//       '               <StartTimeBuffer item="1">300</StartTimeBuffer>     '  + 
//       '               <EndTime item="1">2020-02-06T10:15:57Z</EndTime>     '  + 
//       '               <EndTimeBuffer item="1">0</EndTimeBuffer>    '  + 
//       '             </Time>     '  + 
//       '             <MaximumMeetingExtension item="1">5</MaximumMeetingExtension>     '  + 
//       '             <BookingStatus item="1">OK</BookingStatus>    '  + 
//       '             <BookingStatusMessage item="1"></BookingStatusMessage>     '  + 
//       '             <Webex item="1">      '  + 
//       '               <Enabled item="1">False</Enabled>   '  + 
//       '               <MeetingNumber item="1"></MeetingNumber>       '  + 
//       '               <Password item="1"></Password>    '  + 
//       '             </Webex>  '  + 
//       '             <Encryption item="1">BestEffort</Encryption>     '  + 
//       '             <Role item="1">Master</Role>     '  + 
//       '             <Recording item="1">Disabled</Recording>      '  + 
//       '             <DialInfo item="1">       '  + 
//       '               <Calls item="1">          '  + 
//       '                 <Call item="1">          '  + 
//       '                   <Number item="1">rudferna@cisco.com</Number>           '  + 
//       '                   <Protocol item="1">SIP</Protocol>           '  + 
//       '                   <CallRate item="1">6000</CallRate>            '  + 
//       '                   <CallType item="1">Video</CallType>        '  + 
//       '                 </Call>     '  + 
//       '               </Calls>    '  + 
//       '               <ConnectMode item="1">OBTP</ConnectMode>      '  + 
//       '             </DialInfo>  '  + 
//       '           </Booking>  '  + 
//       '        </Bookings>  '  
//     };

// request(options, function (error, response, body) {
//   if (error) throw new Error(error);

//   console.log(body);
// });

    ////////////
  });
  /////
  controller.addDialog(convo);

  controller.hears('book', 'message,direct_message', async (bot, message) => {
    await bot.beginDialog('book_dialog');
  });
};
