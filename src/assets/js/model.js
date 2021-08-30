import {
  API_URL,
  API_KEY,
  TIMEOUT_SEC,
  QUES_LIMIT,
  QUES_CATEGORY,
  GAME_DIFICULTY,
} from './config.js';

export const state = {
  questions: [],
  totalQuestions: '',
  quiz: {
    curTime: '',
    curQuestionNo: '',
  },
  results: {
    time: 0,
    timeTaken: 0,
    correctAns: 0,
    wrongeAns: 0,
    points: 0,
  },
};

export const getQuestions = async function (
  qLimit = QUES_LIMIT,
  gameDificulty = GAME_DIFICULTY,
  category = QUES_CATEGORY
) {
  try {
    const res = await fetch(
      `${API_URL}?limit=${qLimit}&difficulty=${gameDificulty}`,
      {
        headers: {
          'X-Api-Key': API_KEY,
        },
      }
    );
    const data = await res.json();
    //
    state.questions = data.map(el => {
      const correctAnswer = el.correct_answer?.slice(-1);

      return {
        answers: {
          a: el.answers.answer_a,
          b: el.answers.answer_b,
          c: el.answers.answer_c,
          d: el.answers.answer_d,
          e: el.answers.answer_e,
        },
        category: '',
        correctAnswer: correctAnswer,
        isCorrectAnswers: {
          a: el.correct_answers.answer_a_correct === 'true' ? true : false,
          b: el.correct_answers.answer_b_correct === 'true' ? true : false,
          c: el.correct_answers.answer_c_correct === 'true' ? true : false,
          d: el.correct_answers.answer_d_correct === 'true' ? true : false,
          e: el.correct_answers.answer_e_correct === 'true' ? true : false,
        },
        description: el.description,
        difficulty: el.difficulty,
        explanation: el.explanation,
        id: el.id,
        multipleCorrectAnswers: el.multiple_correct_answers,
        question: el.question,
        tags: el.tags,
        tip: el.tip,
      };
    });
    state.totalQuestions = state.questions.length;
    state.results.totalQuestions = state.questions.length;
  } catch (err) {
    throw err;
  }
};

export const queryTimer = function () {
  let time = TIMEOUT_SEC;
  state.results.time = TIMEOUT_SEC;
  const timer = setInterval(function () {
    time--;
    state.quiz.curTime = time;
    state.results.timeTaken = state.results.time - state.quiz.curTime;
    if (time === 0) clearInterval(timer);
  }, 1000);
  return timer;
};
