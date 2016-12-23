// ENV CONFIG
require('dotenv').config();


// require
const path = require('path');
const Telegram = require('telegraf');


// bot instance
const bot = new Telegram(process.env.BOT_TOKEN);

// const shit

const ms = {
  goodBoy:      'Молодец, что пришел. Можешь валить пыхать сейчас или через час. Мне похер.',
  wtf:          'Че тебе нужно баран, я ж уже сказал! Сообщу, когда можно пыхнуть.',
  getOut:       'Вали из офиса, до связи.',
  timeTo:       'Время попыхать пришло. Прямо сейчас.',
  urgentTimeTo: 'ААААААА!!! БЫСТРЕЕ. ПИСОС. КУРИТЬ!'
};

const img = 'v.jpg',
      sm  = 's.jpg',
      ur  = 'n.jpg',
      answers = { start: '🚬  Новый день', end: '🚭  Баста', now: '🔥 Срочный покур'},
      resources = path.join(path.resolve(__dirname), 'resources'),
      hour = 5000;

let timers = {};


bot.use((ctx, next) => {
  const start = new Date()
  return next().then(() => {
    const ms = new Date() - start
    console.log('Response time %sms', ms)
  })
});

bot.command('start', (ctx) => {
  return ctx.replyWithPhoto({ source: path.join(resources, img) }, Telegram.Markup
    .keyboard([
      [answers.start]
    ])
    .resize()
    .extra()
  )
});

bot.hears(answers.start, (ctx) => {
  let intervalId = setInterval(() => {
    ctx.reply(ms.timeTo);
    ctx.replyWithPhoto({ source: path.join(resources, sm) });
  }, hour);
  timers[ctx.chat.id] = intervalId;
  return ctx.reply(ms.goodBoy,
    Telegram.Markup
      .keyboard([
        [answers.end, answers.now]
      ])
      .resize()
      .extra()
  )
});

bot.hears(answers.end, (ctx) => {
  clearInterval(timers[ctx.chat.id]);
  delete timers[ctx.chat.id];
  return ctx.reply(ms.getOut,
    Telegram.Markup
      .keyboard([
        [answers.start]
      ])
      .resize()
      .extra()
  )
});

bot.hears(answers.now, (ctx) => {
  clearInterval(timers[ctx.chat.id]);
  delete timers[ctx.chat.id];
  let intervalId = setInterval(() => {
    ctx.reply(ms.timeTo);
    ctx.replyWithPhoto({ source: path.join(resources, sm) });
  }, hour);
  timers[ctx.chat.id] = intervalId;
  ctx.replyWithPhoto({ source: path.join(resources, ur) });
  return ctx.reply(ms.urgentTimeTo);
});

bot.on('text', (ctx) => {
  return Promise.all([
    ctx.reply(ms.wtf),
    ctx.replyWithPhoto({ source: path.join(resources, img) })
  ])
});

bot.startPolling();
