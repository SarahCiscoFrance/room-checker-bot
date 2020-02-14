const { BotkitConversation } = require( 'botkit' );

module.exports = function( controller ) {
let convo = new BotkitConversation('test', controller);
convo.ask('What is your name?', [], 'name');
convo.ask('What is your age?', [], 'age');
convo.ask('What is your favorite color?', [], 'color');
convo.after(async(results, bot) => {

     console.log(results.name, results.age, results.color);

});
controller.addDialog(convo);

controller.hears( 'convo', 'message,direct_message', async( bot, message ) => {
    await bot.beginDialog( 'test' );
});
}