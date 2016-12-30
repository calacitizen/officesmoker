// ENV CONFIG
require('dotenv').config();


// require
const path = require('path');
const Telegram = require('telegraf');


// bot instance
const bot = new Telegram(process.env.BOT_TOKEN);

// const shit

const ms = {
  goodBoy:      'Молодец, что пришел. Запускай голосование или не запускай. Мне похер.',
  wtf:          'Че тебе нужно баран, я ж уже сказал! Сообщу, когда можно пыхнуть.',
  getOut:       'Вали из офиса, до связи.',
  timeTo:       'Время попыхать пришло. Запускай голосование.',
  urgentTimeTo: 'ААААААА!!! БЫСТРЕЕ. ПИСОС. КУРИТЬ!',
  yep:          '👍',
  nope:         '👎',
  getready:     'Собирайся',
  skip:         'Пропускаешь покур',
  pollover:     'Голосование прошло, запускай новое!'
};

const img   = 'v.jpg',
      sm    = 's.jpg',
      ur    = 'n.jpg',
      w     = 'w.jpg',
      basta = 'basta.jpg',
      answers = { start: '🚬  Новый день', end: '🚭  Баста', now: '🔥 Срочный покур', how: 'Сколько осталось?'},
      resources = path.join(path.resolve(__dirname), 'resources'),
      min  = 2000,
      hour = 3600000;

let timers = {};

let
    concatStr = function concatStr() {
      return [...arguments].join(' ');
    },
    getTeam = function getTeam(team) {
      let begin = 'Состав покура: \n';
      return begin + team.join('\n');
    },
    poll = function poll(from) {
      return concatStr(from.first_name, from.last_name, 'предложил покур.');
    },
    calculate = function calculate(ctx) {
      if (ctx.session.team.length > 0) {
        ctx.replyWithPhoto({ source: path.join(resources, ur) }, { caption: getTeam(ctx.session.team) });
      } else {
        ctx.reply('Покур не состоится.');
      }
    };




bot.use(Telegram.memorySession());

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
    ctx.replyWithPhoto({ source: path.join(resources, sm) }, { caption: ms.timeTo});
  }, hour);
  timers[ctx.chat.id] = intervalId;
  return ctx.reply(ms.goodBoy,
    Telegram.Markup
      .keyboard([
        [answers.end, answers.now],
        [answers.how]
      ])
      .resize()
      .extra()
  )
});

bot.hears(answers.end, (ctx) => {
  clearInterval(timers[ctx.chat.id]);
  delete timers[ctx.chat.id];
  return ctx.replyWithPhoto({ source: path.join(resources, basta) },
  Telegram.Markup
    .keyboard([
      [answers.start]
    ])
    .resize()
    .extra()
  );
});


bot.hears(answers.now, (ctx) => {
  // clearInterval(timers[ctx.chat.id]);
  // delete timers[ctx.chat.id];
  //
  ctx.session.team = [];
  ctx.session.on = true;
  let intervalId = setTimeout(() => {
    calculate(ctx);
    ctx.session.on = false;
    ctx.session.team = [];
  }, min);
  // timers[ctx.chat  .id] = intervalId;
  return ctx.reply(poll(ctx.from),
    Telegram.Markup.inlineKeyboard([
        Telegram.Markup.callbackButton(ms.yep, ms.yep),
        Telegram.Markup.callbackButton(ms.nope, ms.nope),
    ]).extra()
  );
});

bot.action(ms.yep, (ctx, next) => {
  if (ctx.session.on) {
    if (ctx.session.team) {
      ctx.session.team.push([concatStr(ctx.from.first_name, ctx.from.last_name)]);
    }
    return ctx.answerCallbackQuery(ms.getready);
  } else {
    return ctx.answerCallbackQuery(ms.pollover);
  }
});

bot.action(ms.nope, (ctx, next) => {
  if (ctx.session.on) {
    return ctx.answerCallbackQuery(ms.skip);
  } else {
    return ctx.answerCallbackQuery(ms.pollover);
  }
})

bot.hears(answers.how, (ctx) => {
  return ctx.replyWithPhoto({ source: path.join(resources, w) });
});

bot.startPolling();
