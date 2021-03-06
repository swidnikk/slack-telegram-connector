module.exports = function(telegram, slack) {
  var slackBot = slack.spawn({ 
     incoming_webhook: {
       url: process.env.slack_webhook_url
  }
})
  var telegramBot = telegram.spawn({})
  
 telegram.on('message_received', function(botot, message) {
   console.log('=====GOT MESSAGE FROM TELEGRAM CHANNEL:', message)
   var name = message.profile.fn + ' ' + message.profile.ln
   name = name.toLowerCase() 
   var slack_message = {
      text: message.text,
     username: name,
     // footer: '_sent from telegram_'
   }
   

   slackBot.sendWebhook(slack_message, function(err, res) {
     if (err) console.log('Uh oh!\n', err)
   })
 })
  
  
  slack.on('ambient', function(bot, message) {
    // I need to get slack user name to post into telegram
    console.log('====MESSAGE AMBIENT SLACK', message)
    if (message.channel === process.env.slack_channel) {
    if (!message.username && message.subtype !== 'channel_join') {
      slack.storage.teams.get(message.team, function(err, team) {
        if (err) {
          console.log('err getting team from db:', err)
          return
        }else if(!team) {
          console.log('team is not setup!')
          return
        } else if (team) {
          bot.api.users.info({token: team.access_token, user: message.user}, function(err, res) {
        if (err) {
          console.log('err getting user info:', slack.config)
        } else if (!res.user) {
          console.log('Couldnt get user for this message:\n', message)
          return
        } else {
          // console.log('USER INFO REQUEST', res)
          var user = {
                      id: res.user.id,
                      username: res.user.name,
                      is_bot: res.user.is_bot,
                      real_name: res.user.profile.real_name
                    }
          var tel_message = {
      channel: process.env.telegram_channel,
      text: '*' + user.username + '*' + ': ' + message.text,
      parse_mode: 'Markdown'
    } 
    telegramBot.say(tel_message)
          slack.storage.users.save(user, function(err) {
            if (err) {console.log(err)}
          })
        }
      })
        }
      })
      
      
    } else {
    
    var tel_message = {
      channel: process.env.telegram_channel,
      text: '*' + message.username + '*' + ': ' + message.text,
      parse_mode: 'Markdown'
    } 
    telegramBot.say(tel_message)
    }
    }
  })
}