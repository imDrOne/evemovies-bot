import { ContextMessageUpdate } from 'telegraf';
import Stage from 'telegraf/stage';
import Scene from 'telegraf/scenes/base';
import { languageChangeAction } from './actions';
import { getLanguageKeyboard } from './helpers';
import logger from '../../util/logger';
import User from '../../models/User';
import { getMainKeyboard } from '../../util/keyboards';

const { leave } = Stage;
const start = new Scene('start');

start.enter(async (ctx: ContextMessageUpdate) => {
  const uid = String(ctx.from.id);
  const user = await User.findById(uid);
  const { mainKeyboard } = getMainKeyboard(ctx);

  if (user) {
    await ctx.reply(ctx.i18n.t('scenes.start.welcome_back'), mainKeyboard);
  } else {
    logger.debug(ctx, 'New user has been created');

    const languageKeyboard = getLanguageKeyboard();
    const newUser = new User({
      _id: uid,
      username: ctx.from.username,
      name: ctx.from.first_name + ' ' + ctx.from.last_name,
      observableMovies: [],
      lastActivity: new Date(),
      totalMovies: 0
    });

    await newUser.save();
    await ctx.reply('Choose language / Выбери язык', languageKeyboard);
    await ctx.answerCbQuery();
  }
});

start.leave(async (ctx: ContextMessageUpdate) => {
  const { mainKeyboard } = getMainKeyboard(ctx);

  await ctx.reply(ctx.i18n.t('shared.what_next'), mainKeyboard);
});

start.command('saveme', leave());
start.action(/languageChange/, languageChangeAction);
start.action(/confirmAccount/, leave());

export default start;
