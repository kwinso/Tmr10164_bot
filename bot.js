if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const { Telegraf, mount, filter } = require('telegraf');
const Markup = require('telegraf/markup');
const mongoose = require("mongoose");
const Voice = require('./models/Voice.js');
const express = require("express");
const app = express();




const dropOldUpdates = mount('message', ({ message }, next) => {
  const now = new Date().getTime() / 1000
  if (message.date > (now - 60 * 2)) {
    return next()
  }
})

const dropOldUpdatesAlternate = ({ message }, next) => {
  const now = new Date().getTime() / 1000
  if (!message || message.date > (now - 60 * 2)) {
    return next()
  }
}

// Using `filter` factory, telegraf 3.7.3 is required 
const dropOldUpdatesModern = filter(({ message }) => {
  const now = new Date().getTime() / 1000
  return !message || message.date > (now - 60 * 2)
})

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.use(dropOldUpdates)
bot.use(dropOldUpdatesAlternate)
bot.use(dropOldUpdatesModern)


bot.on("inline_query", async ({ inlineQuery, answerInlineQuery }) => {
    try {
                
        const programmer = Math.floor(Math.random() * 100) + 1;
        const dbquery = inlineQuery.query.trim() ? { tags: { $all: inlineQuery.query.toLowerCase().trim().split(' ')}} : {};
        const voices = await Voice.find(dbquery).limit(35);
        const repsonse = voices.map((v, index) => {
            return {
                type: "voice", 
                id: index + 2,
                title: v.title,
                voice_url: v.voice_url
            }
        });
        repsonse.unshift({
            type: "article", 
            id: 1,
            title: `Какой уровень программирования у ${inlineQuery.query || "у тебя"}?`,
            thumb_url: "https://i.ibb.co/3dkm2wk/tmr-pic.jpg",
            reply_markup: Markup.inlineKeyboard([
                Markup.switchToCurrentChatButton("Поделиться своим уровнем программирования", '')
            ]),
            input_message_content: {
                message_text: `У меня ${programmer} паяльник(-ов)!`
            }
        })
        return answerInlineQuery(repsonse, { cache_time: 10})
    } catch (e) {
        console.log(e);
    }
});

function connectToDB() {
    mongoose.connect(process.env.MONGODB_URI, {
        useUnifiedTopology: true,
        useNewUrlParser: true
    });
    const db = mongoose.connection;
    db.on("open", () => console.log("Connectted to database " + db.name));
    db.on("error", (e) => console.error("Error occured while connecting to database:\n" + e));
}


async function startBot() {
    try {
        await bot.launch()
        connectToDB();
        console.log("Bot started");
    } catch (e) {
        console.log(e);        
    }
}

startBot()

// app.get('/', (req, res) => {
//     res.send("Server for nice bot")
// })
// app.listen( 3000)