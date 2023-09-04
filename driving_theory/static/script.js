const langBtn = document.getElementById("lang-btn");
const langForm = document.getElementById("lang-form");
const body = document.querySelector("body");
let questions = '';
let usr_answers = {};
let corrAnswers = {};
let curr_question = 0;


/* Get questions and start exam */

async function getAllLanguages() {
    try {
        const url = "http://127.0.0.1:8000/exam/languages/";
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Couldn`t get languages")
        } else {
            let data = await response.json();
            displayAllLanguages(langForm, data);
        }
    } catch (error) {
        console.log(error)
    }
}

function displayAllLanguages(element, data) {

    for (let i = 0; i < data.length; i++) {
        const newInput = document.createElement("input");
        newInput.type = 'radio';
        newInput.name = 'lang'
        newInput.value = data[i]['id'];
        newInput.id = `langInput${data[i]['id']}`;
        const newInputLabel = document.createElement("label");
        newInputLabel.for = newInput.id;
        newInputLabel.innerText = data[i]['code'];
        newInputLabel.classList.add("form-check-label");

        element.append(newInput, newInputLabel);
    }
}

async function getQuestions() {
    let language = -1;
    const langInputs = document.getElementsByName('lang');
    for (i = 0; i < langInputs.length; i++) {
        if (langInputs[i].checked) {
            language = langInputs[i].value;
        }
    }

    const url = `http://127.0.0.1:8000/exam/get-exam-questions/${language}`
    try {
        const response = await fetch(url);
        if (!response.ok) {
            // displayDownloadError(); display error with downloading, suggest to reload
            throw new Error("Cant get the questions");
        } else {
            questions = await response.json();
            await renderExam(questions);
        }
    } catch (error) {
        console.log(error)
    }
}

async function renderExam(questions) {
    const startExamDiv = document.getElementById("start-exam");
    startExamDiv.innerText = "";
    //box for 1 question
    const questionsBoxDiv = document.createElement("div");
    questionsBoxDiv.id = "questions-box-div";
    const sideMenuDiv = document.createElement("div");
    sideMenuDiv.id = "side-menu-div";
    const questionsDiv = document.createElement("div");
    questionsDiv.id = "questions-div";
    questionsDiv.className = "text-secondary-emphasis";

    body.append(questionsBoxDiv);
    questionsBoxDiv.append(sideMenuDiv, questionsDiv);

    renderSideMenu(sideMenuDiv, questions);
    await showQuestion(questionsDiv, questions, 0);
    showSubmitButton();
}


/* Exam side menu */

function renderSideMenu(parent, questions) {
    const sideQuestionsBox = document.createElement("div");
    sideQuestionsBox.id = "side-questions-box"

    for (let index = 0; index < questions.length; index++) {
        const qSideDiv = document.createElement("div");
        const qSideSpan = document.createElement("span");
        qSideDiv.id = `q_s_div_${index}`;
        qSideDiv.classList = "link-to-question";
        qSideSpan.id = `q_s_span_${index}`;
        qSideSpan.innerText = `#${index + 1}`;
        qSideDiv.append(qSideSpan)
        sideQuestionsBox.append(qSideDiv)

        qSideDiv.addEventListener("click", saveTheAnswer);

        qSideDiv.addEventListener("click", async () => {
            const questionsDiv = document.getElementById("questions-div");
            questionsDiv.innerText = "";
            showQuestion(questionsDiv, questions, index);
        })

    }
    parent.append(sideQuestionsBox);
    const timeSpan = document.createElement("span");
    timeSpan.id = "time"
    parent.append(timeSpan)
    const twentyMinutes = 20 * 60;
    startTimer(twentyMinutes, timeSpan);
}

async function showQuestion(parent, questions, index) {
    parent.innerHTML = "";
    highlightSideBarQuestion(index);
    const question = questions[index];
    renderQuestionText(parent, question);
    await displayImg(parent, question["image_id"]);
    renderAnswerChoices(parent, question, index);
    renderListButtons(parent, questions, index);
}

function highlightSideBarQuestion(index) {
    removeHighlightFromSideBarQuestion();
    curr_question = index;
    const sideQuestionLink = document.getElementById(`q_s_div_${curr_question}`);
    sideQuestionLink.style.border = "1px solid red";
}

function removeHighlightFromSideBarQuestion() {
    const sideQuestionLink = document.getElementById(`q_s_div_${curr_question}`);
    if (sideQuestionLink) {
        sideQuestionLink.style.border = "1px solid black";
    }
}

function startTimer(duration, display) {
    var timer = duration, minutes, seconds;
    setInterval(function () {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;
        display.textContent = minutes + ":" + seconds;

        if (--timer < 0) {
            timer = duration;
            saveTheAnswer();
            getCorrAnswers();
        }
    }, 1000);
}


/* Question render */

function renderQuestionText(parent, question) {
    const questionOfQuestion = document.createElement("h3");
    questionOfQuestion.innerText = question["question"];
    questionOfQuestion.className = "question";
    parent.appendChild(questionOfQuestion);
}

async function displayImg(parent, imageId) {
    try {
        if (imageId) {
            const url = `http://127.0.0.1:8000/exam/get-img/${imageId}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error("Couldn't get the image");
            } else {
                const data = await response.json();
                const image = createImageElement(data["image_link"]);
                parent.appendChild(image);
            }
        }
    } catch (error) {
        console.log(error);
    }
}

function createImageElement(src) {
    const image = document.createElement("img");
    image.src = src;
    image.classList.add("rounded");
    image.classList.add("mx-auto");
    image.classList.add("d-block");
    return image;
}

function renderAnswerChoices(parent, question, index) {
    const answers = [question['answer1'], question['answer2'], question['answer3'], question['answer4']];
    const answersBox = document.createElement("div");
    answersBox.id = "answers-box";

    answers.forEach((answer, i) => {
        const answerDiv = createAnswerDiv(index, i);
        const answerInp = createAnswerInput(index, i);
        const answerLabel = createAnswerLabel(answer, index, i);

        if (index in usr_answers && i === usr_answers[curr_question]) {
            answerInp.checked = true;
        }

        appendAnswerElements(answerDiv, answerInp, answerLabel);
        answersBox.appendChild(answerDiv);
    });

    parent.appendChild(answersBox);
}

function createAnswerDiv(index, i) {
    const answerDiv = document.createElement("div");
    answerDiv.id = `qAnsDiv_${index}_${i}`;
    return answerDiv;
}

function createAnswerInput(index, i) {
    const answerInp = document.createElement("input");
    answerInp.type = 'radio';
    answerInp.name = 'question';
    answerInp.value = i;
    answerInp.id = `qAns_${index}_${i}`;
    answerInp.classList.add("form-check-input");
    return answerInp;
}

function createAnswerLabel(answer, index, i) {
    const answerLabel = document.createElement("label");
    answerLabel.for = `qAns_${index}_${i}`;
    answerLabel.innerText = answer;
    answerLabel.classList.add("form-check-label");
    return answerLabel;
}

function appendAnswerElements(answerDiv, answerInp, answerLabel) {
    answerDiv.appendChild(answerInp);
    answerDiv.appendChild(answerLabel);
}

function renderListButtons(parent, questions, index) {
    const listButtons = document.createElement("div");
    listButtons.id = "list-buttons";

    if (index > 0) {
        addButtonToList(listButtons, "prev-btn", "prev-button", "<", () => showQuestion(parent, questions, index - 1));
    }

    if (index < questions.length - 1) {
        addButtonToList(listButtons, "next-btn", "next-button", ">", () => showQuestion(parent, questions, index + 1));
    }

    parent.appendChild(listButtons);
}

function addButtonToList(listButtons, buttonClass, buttonText, innerText, clickHandler) {
    const button = document.createElement("button");
    button.classList.add(buttonClass);
    button.classList.add("list-btn");
    button.innerText = innerText;
    button.addEventListener("click", saveTheAnswer);
    button.addEventListener("click", clickHandler);
    listButtons.appendChild(button);
}

async function displayImg(element, image_id) {
    try {
        if (image_id) {
            const url = `http://127.0.0.1:8000/exam/get-img/${image_id}`
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error("Couldn`t get languages");
            } else {
                let data = await response.json();
                const image = document.createElement("img");
                image.src = data["image_link"];
                image.classList.add("rounded");
                image.classList.add("mx-auto");
                image.classList.add("d-block");
                element.append(image);
            }
        }
    } catch (error) {
        console.log(error);
    }
}

async function saveTheAnswer() {
    // get inputs
    let answer = -1;
    let questionNum = -1;
    const inputName = `question`;
    const ansInputs = document.getElementsByTagName("input");
    console.log("ansInputs.length: " + ansInputs.length);
    for (i = 0; i < ansInputs.length; i++) {
        if (ansInputs[i].checked) {
            answer = Number(ansInputs[i].value);
            //get question number from its id
            questionNum = ansInputs[i].id.split("_")[1];
            console.log("questionNum: " + questionNum)
            // save answer to global usr_answers
            usr_answers[questionNum] = answer;
            // highlighting already answered questions
            let sideQuestionLink = document.getElementById(`q_s_div_${questionNum}`);
            sideQuestionLink.style.backgroundColor = "lightgreen";
        }
    }
    console.log("usr_answers: " + Object.entries(usr_answers))
}

function showSubmitButton() {
    const submitButton = document.createElement("button");
    submitButton.id = "submit-answers";
    submitButton.innerText = "OK!"; // add font awesome icon to submit
    // getting right answers
    submitButton.addEventListener("click", saveTheAnswer)
    submitButton.addEventListener("click", getCorrAnswers);
    const sidebarDiv = document.getElementById("side-menu-div");
    sidebarDiv.append(submitButton)
}

/* Results */

async function getCorrAnswers() {
    const corrAnswers = fillCorrAnswers();
    const resExamDiv = createResultExamDiv();
    const examDiv = clearScreen();
    const resMenuDiv = createResultMenuDiv();
    const questionsBox = createQuestionsBox();

    resExamDiv.append(resMenuDiv, questionsBox);
    body.append(resExamDiv);

    const corrAnsCounter = countCorrectAnswers(corrAnswers);
    const resultScore = createResultScoreElement(corrAnsCounter, questions.length);
    resMenuDiv.append(resultScore);

    for (let index = 0; index < questions.length; index++) {
        const questionBoxDiv = createQuestionBoxDiv(index);
        const question = questions[index];
        const questionOfQuestion = createQuestionElement(question["question"]);

        if (usr_answers[index] !== corrAnswers[index]) {
            questionOfQuestion.classList.add("wrong-answer");
        }

        await displayImg(questionBoxDiv, question["image_id"]);
        const answersBox = createAnswersBox(index, question);

        questionBoxDiv.append(questionOfQuestion, answersBox);
        questionsBox.append(questionBoxDiv);
    }
}

function fillCorrAnswers() {
    const corrAnswers = [];
    for (let i = 0; i < questions.length; i++) {
        corrAnswers[i] = questions[i]["corr_answer"];
    }
    return corrAnswers;
}

function createResultExamDiv() {
    const resExamDiv = document.createElement("div");
    resExamDiv.id = "res-exam";
    return resExamDiv;
}

function clearScreen() {
    const examDiv = document.getElementById("questions-box-div");
    examDiv.remove();
    return examDiv;
}

function createResultMenuDiv() {
    const resMenuDiv = document.createElement("div");
    resMenuDiv.id = "res-menu-div";
    return resMenuDiv;
}

function createQuestionsBox() {
    const questionsBox = document.createElement("div");
    questionsBox.id = "quiestions-box";
    return questionsBox;
}

function countCorrectAnswers(corrAnswers) {
    let corrAnsCounter = 0;
    for (let i = 0; i < questions.length; i++) {
        if (i in usr_answers && usr_answers[i] === corrAnswers[i]) {
            corrAnsCounter++;
        }
    }
    return corrAnsCounter;
}

function createResultScoreElement(corrAnsCounter, totalQuestions) {
    const resultScore = document.createElement("h2");
    resultScore.innerText = `You answered right for ${corrAnsCounter} questions of ${totalQuestions} questions total.`;
    return resultScore;
}

function createQuestionBoxDiv(index) {
    const questionBoxDiv = document.createElement("div");
    questionBoxDiv.id = `questions-box-div-#${index}`;
    questionBoxDiv.className = "text-secondary-emphasis";
    return questionBoxDiv;
}

function createQuestionElement(questionText) {
    const questionOfQuestion = document.createElement("h3");
    questionOfQuestion.innerText = questionText;
    questionOfQuestion.className = "answered-question";
    return questionOfQuestion;
}

function createAnswersBox(index, question) {
    const answersBox = document.createElement("div");
    answersBox.classList = "answers-box";

    const answers = [question['answer1'], question['answer2'], question['answer3'], question['answer4']];
    for (let i = 1; i <= answers.length; i++) {
        const answerDiv = createAnswerDiv(index, i);
        const answerInp = createAnswerInput(index, i);
        const answerLabel = createAnswerLabel(answers[i - 1], index, i);

        if (i === question["corr_answer"]) {
            answerLabel.classList.add("corr-answer");
        }

        if (index in usr_answers && usr_answers[index] === i) {
            answerInp.checked = true;
        }

        answerDiv.append(answerInp, answerLabel);
        answersBox.appendChild(answerDiv);
    }
    return answersBox;
}

function createAnswerInput(index, i) {
    const answerInp = document.createElement("input");
    answerInp.type = 'radio';
    answerInp.name = `question${index}`;
    answerInp.classList.add("form-check-input");
    answerInp.value = i + 1;
    answerInp.id = `qAns_${index}_${i}`;
    return answerInp;
}

function createAnswerLabel(answer, index, i) {
    const answerLabel = document.createElement("label");
    answerLabel.for = `qAns_${index}_${i}`;
    answerLabel.innerText = answer;
    answerLabel.classList.add("form-check-label");
    return answerLabel;
}


/* Run */

getAllLanguages()
langBtn.addEventListener('click', getQuestions)