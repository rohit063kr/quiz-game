import 'regenerator-runtime/runtime';
import 'core-js/stable';

import * as model from './model.js';
import View from './view.js';
import view from './view.js';

let timer;

const controleQuestion = async function (limit, difficulty) {
  try {
    View.renderGame();

    View.getElements();
    View.addHandlerSelect(model.state.results);

    View.renderLoader(View._queryLoadingWaitMessage);
    // Get Questions
    await model.getQuestions(limit, difficulty);

    // Render question
    View.render(model.state.questions, model.state.results);

    //startTimer
    if (difficulty === 'easy') timer = model.queryTimer(30);
    if (difficulty === 'medium') timer = model.queryTimer(20);
    if (difficulty === 'hard') timer = model.queryTimer(10);

    view.setTimer(timer);

    // Update timer dom
    const checkInterval = setInterval(function () {
      if (`${model.state.quiz.curTime}`)
        View.domTimer(model.state.quiz.curTime, model.state.results);
      if (!model.state.quiz.curTime) clearInterval(checkInterval);
    }, 1000);
  } catch (err) {
    View.renderError(err);
  }
};

const init = function () {
  View.addHandlerStartGame(controleQuestion);
};

init();
