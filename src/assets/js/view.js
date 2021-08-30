class View {
  _parentElement = '';
  _btns = '';
  _timerElement = '';
  _questNumElement = '';

  // Messages
  _calcWaitinMessage = 'Please wait! we are calculating your score';
  _queryLoadingWaitMessage = 'Be ready! we are loading the questions';

  _timer = '';

  _;
  _data = '';
  _slideCounter = 0;

  getElements() {
    this._parentElement = document.querySelector('.query');
    this._btns = document.querySelector('.footer__btns');
    this._timerElement = document.querySelector('.timmer');
    this._questNumElement = document.querySelector('.footer__status');
  }

  render(data, result) {
    this.setupData(data);
    const markup = this._data.map(el => this._generateMarkup(el)).join('');
    this._parentElement.innerHTML = '';
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
    this._mentionQuestionPage();

    this.settingUpSlide();
    this.addHandlerNext(result);
  }

  setTimer(timer) {
    this._timer = timer;
    clearInterval(this._timer);
  }

  _removeTimer() {
    clearInterval(this._timer);
  }

  domTimer(time, result) {
    const min = Math.trunc(time / 60);
    const sec = time % 60;
    this._timerElement.textContent = `${min}:${sec} min`;

    if (time === 0) {
      this._parentElement.innerHTML = '';
      this._renderResults(result);
      this._convertBtnForRestart();
    }
  }

  _renderResults(data) {
    this._removeTimer();
    this.renderLoader(this._calcWaitinMessage);
    this._parentElement.style.width = 'auto';
    setTimeout(
      function () {
        const markup = this._generateResultMarkup(data);
        this._parentElement.innerHTML = '';
        this._parentElement.insertAdjacentHTML('afterbegin', markup);
        this._convertBtnForRestart();
      }.bind(this),
      1000
    );
  }

  _convertBtnForRestart() {
    this._btns.querySelector('.btnSkip').value = 'Restart quiz';
    this._btns.addEventListener('click', function (e) {
      if (e.target.closest('.btnSkip')) window.location.reload();
    });
  }

  addHandlerNext(result) {
    this._btns.addEventListener(
      'click',
      function (e) {
        if (e.target.closest('.btn-skip')) this._slide.call(this, result, true);
        if (e.target.closest('.btn-prev'))
          this._slide.call(this, result, false);
      }.bind(this)
    );
  }

  addHandlerSelect(results) {
    this._parentElement.addEventListener(
      'click',
      function (e) {
        // Getting actual dom elements that is clicked
        const ansOpt = e.target.closest('.query__ans-list-item');

        if (!ansOpt) return;
        const html = `<div class="overlay"></div>`;
        ansOpt
          .closest('.query__ans-list')
          .insertAdjacentHTML('afterbegin', html);

        // Update results obj
        this._updateResultsData.call(this, e, results);
      }.bind(this)
    );
  }

  _updateResultsData(e, results) {
    const isCurQuesCorrect = this._manageSelection(e);
    if (isCurQuesCorrect) this._updatePositiveResultData(results);
    if (!isCurQuesCorrect) this._updateNegativeResultData(results);
    this._slide(results);
  }

  _updatePositiveResultData(results) {
    results.correctAns += 1;
    results.points += 1;
  }

  _updateNegativeResultData(results) {
    results.wrongeAns += 1;
    results.points -= 1;
  }

  _updateNeutralResultData(result) {
    result.wrongeAns += 0;
    result.points += 0;
  }

  // Controling the option selection
  _manageSelection(e) {
    // Getting the actual dom element that is clicked
    const queryAns = e.target.closest('.query__ans-list-item');
    if (!queryAns) return;

    // Getting the option obj which has the correct ans
    const ans = this._data.find(el => el.id === +queryAns.dataset.id);

    // Getting the correct option string
    const correctOpt = Object.entries(ans.isCorrectAnswers)
      .filter(el => el[1])
      .flat()[0];

    // Checking the selected option is correct or not
    const isCurCorrect = queryAns.dataset.ansTitle === correctOpt;

    // Adding styles to selected options
    queryAns.classList.add(
      isCurCorrect ? 'query__ans--success' : 'query__ans--wronge'
    );

    // Getting all the sibling elements of selected option
    const allSiblings = queryAns
      .closest('.query__ans-list')
      .querySelectorAll('.query__ans-list-item');

    // Removing all special styles to all siblings elements
    allSiblings.forEach(el => {
      if (el === queryAns) return;
      el.classList.remove('query__ans--success');
      el.classList.remove('query__ans--wronge');
    });

    // Returning boolean to fill the results obj if correct
    if (isCurCorrect) return true;
    if (!isCurCorrect) return false;
  }

  // Preparing for slide
  settingUpSlide() {
    const parentBoxWidth = this._data.length * 100 + '%';
    this._parentElement.style.width = parentBoxWidth;
  }

  // Making a slide
  _slide(result, skip = true) {
    if (this._slideCounter === this._data.length - 1) {
      // this._btns.removeEventListener('click', this._slide);
      return this._renderResults(result);
    }
    if (this._slideCounter !== this._data.length - 1 && skip)
      this._slideCounter++;
    if (this._slideCounter !== this._data.length - 1 && !skip)
      this._slideCounter--;

    // getting all questions-box
    const elements = this._getAllElements();

    // Transforming them to make slide effect
    elements.forEach(el => {
      el.style.transform = `translateX(-${100 * this._slideCounter}%)`;
    });

    // Mentioning question page number in footer
    this._mentionQuestionPage();

    // Mentioning question number before question title
    this._mentionQuestionNum();
  }

  //Mentioning num of pages
  _mentionQuestionPage() {
    this._questNumElement.textContent = `${this._slideCounter + 1} out of ${
      this._data.length
    }`;
  }

  // Mentioning num of question before question
  _mentionQuestionNum() {
    const curQuestionPage = Array.from(
      document.querySelectorAll('.query__question-box')
    )[this._slideCounter];
    curQuestionPage.querySelector('.query__question-num').textContent =
      this._slideCounter + 1;
  }

  _getAllElements() {
    return this._parentElement.querySelectorAll('.query__question-box');
  }

  setupData(data) {
    this._data = data;
  }

  addHandlerStartGame(handler) {
    document
      .querySelector('.form__inputs')
      .addEventListener('submit', function (e) {
        e.preventDefault();
        const limit = document.querySelector('#limit').value;
        const difficulty = document.querySelector('#difficulty').value;

        handler(limit, difficulty);
      });
  }

  renderLoader(msg) {
    const html = `
    <div class="query__loader">
    <img
      src="https://i0.wp.com/codemyui.com/wp-content/uploads/2017/02/infinity-preloader-1.gif?fit=880%2C440&ssl=1"
      alt=""
    />

    <h3 class="query__loader-title">
      ${msg}
    </h3>
    </div>
    `;
    this._parentElement.innerHTML = '';
    this._parentElement.insertAdjacentHTML('afterbegin', html);
  }

  _generateResultMarkup(data) {
    data.points = data.correctAns + data.wrongeAns;
    const html = `
    <div class="results">
    <h3 class="results__heading">Congrates, you completed the quiz</h3>
    <h4>This is your performance</h4>

    <ul class="results__list">
      <li class="results__list-items results__correct">
        Correct answers: ${data.correctAns} out of ${data.totalQuestions}
      </li>
      <li class="results__list-items results__wronge">
        Wronge answers: ${data.wrongeAns} out of ${data.totalQuestions}
      </li>
      <li class="results__list-items results__other">
      Total attempt: ${data.points}
    </li>
      <li class="results__list-items results__other">
     Skip: ${data.totalQuestions - (data.correctAns + data.wrongeAns)}
  </li>
      <li class="results__list-items results__other">
       Total time taken: ${data.timeTaken}
      </li>
     
    <li class="results__list-items results__total">
    Total points: ${data.points}
  </li>
    </ul>

     <h4>We hope your quiz got well</h4>
    </div>
  `;
    return html;
  }

  _generateMarkup(data) {
    const html = `
    <div class="query__question-box" >
    <div class="query__question">
     <span class="query__question-num">1:</span> <span class="question">${
       data.question
     }</span>
    </div>

    <div class="query__ans-box">
      <ul class="query__ans-list">
          ${Object.entries(data.answers)
            .map(el => {
              if (!el[1]) return;

              const ansOpt = el[1]
                ? `<li class="query__ans-list-item" data-id="${data.id}"  data-ans-title="${el[0]}">
              <span class="query__ans-title">${el[0]}: ${el[1]}</span
              ><span class="query__ans-check"></span>
            </li>`
                : '';

              const opt = document
                .createRange()
                .createContextualFragment(ansOpt)
                .querySelector('.query__ans-list-item');

              const optTitle = opt.querySelector('.query__ans-title');

              optTitle.innerHTML = '';
              optTitle.append(`${el[0]}: ${el[1]}`);

              const temp = document.createElement('div');
              temp.appendChild(opt);

              return temp.innerHTML;
            })
            .join('')}        
          
      </ul>
    </div> 
  </div>
`;
    return html;
  }

  renderGame() {
    document.querySelector('.container').innerHTML = '';
    document.querySelector('.container').insertAdjacentHTML(
      'afterbegin',
      `
      <nav class="nav">
        <h3 class="nav__title">Hello quiz</h3>
        <div class="nav__timmer">
          Time Left <span class="timmer">20min</span>
        </div>
        <span class="nav__border"></span>
      </nav>
      <div class="query__container">
        <div class="query"></div>
      </div>
      <div class="footer">
        <p class="footer__status">1 of 3 question</p>
      <div class="footer__btns">
        <input class="footer__btn btn-prev" type="submit" value="Prev" />
        <input class="footer__btn btn-skip" type="submit" value="Skip" />
      </div>
      </div>`
    );
  }
}

export default new View();

/*
${
            data.answers.b
              ? `<li class="query__ans-list-item" data-id="${data.id}"  data-ans-title="b">
          <span class="query__ans-title">b: ${data.answers.b}</span
          ><span class="query__ans-check"></span>
        </li>`
              : ''
          }
          ${
            data.answers.c
              ? `<li class="query__ans-list-item" data-id="${data.id}"  data-ans-title="c">
          <span class="query__ans-title">c: ${data.answers.c}</span
          ><span class="query__ans-check"></span>
        </li>`
              : ''
          }
          ${
            data.answers.d
              ? `<li class="query__ans-list-item" data-id="${data.id}" data-ans-title="d">
          <span class="query__ans-title">d: ${data.answers.d}</span
          ><span class="query__ans-check"></span>
        </li>`
              : ''
          }
          
*/
