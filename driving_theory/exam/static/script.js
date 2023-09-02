const langBtn = document.getElementById("lang-btn");
const langForm = document.getElementById("lang-form");
const body = document.querySelector("body");
let questions = '';
let usr_answers = {};
let corrAnswers = {};
let curr_question = 0;

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
        newInputLabel.innerText = data[i]['code']
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
    body.innerText = "";
    //box for 1 question
    const questionsBoxDiv = document.createElement("div");
    questionsBoxDiv.id = "questions-box-div";
    const sideMenuDiv = document.createElement("div");
    sideMenuDiv.id = "side-menu-div";
    const questionsDiv = document.createElement("div");
    questionsDiv.id = "questions-div";

    body.append(questionsBoxDiv);
    questionsBoxDiv.append(sideMenuDiv, questionsDiv);

    renderSideMenu(sideMenuDiv, questions);
    await showQuestion(questionsDiv, questions, 0);
    showSubmitButton();
}

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
}

//clean it up!
async function showQuestion(parent, questions, index) {
    // highlighting current question in side bar
    let sideQuestionLink = document.getElementById(`q_s_div_${curr_question}`);
    sideQuestionLink.style.border = "none";
    curr_question = index;
    sideQuestionLink = document.getElementById(`q_s_div_${curr_question}`);
    sideQuestionLink.style.border = "1px solid red";


    // question
    const question = questions[index];
    const questionOfQuestion = document.createElement("h3");
    questionOfQuestion.innerText = question["question"];
    questionOfQuestion.className = "question"
    parent.append(questionOfQuestion);

    //image
    await displayImg(parent, question["image_id"]);

    // all 4 answers
    const answers = [question['answer1'], question['answer2'], question['answer3'], question['answer4']];

    const answersBox = document.createElement("div");
    answersBox.id = "answers-box";
    for (let i = 1; i < (answers.length + 1); i++) {
        // answers div
        const answerDiv = document.createElement("div");
        answerDiv.id = `qAnsDiv_${index}_${i}`
        //answers input
        const answerInp = document.createElement("input");
        answerInp.type = 'radio';
        // answerInp.name = `question${index}`
        answerInp.name = `question`;
        answerInp.value = i;
        answerInp.id = `qAns_${index}_${i}`;
        //answers label
        const answerLabel = document.createElement("label");
        answerLabel.for = answerInp.id;
        const answerName = `answer${i}`;
        answerLabel.innerText = question[answerName];
        // display if answer to question was given
        if (index in usr_answers && i == usr_answers[curr_question]) {
            answerInp.checked = true;
        }
        //append
        answersBox.append(answerDiv);
        answerDiv.append(answerInp, answerLabel);
    }
    parent.append(answersBox);

    //list buttons
    const listButtons = document.createElement("div");
    listButtons.id = "list-buttons";

    if (index > 0) {
        const prevButton = document.createElement("button");
        prevButton.classList.add("prev-btn");
        prevButton.classList.add("list-btn");
        prevButton.innerText = "<"; // find font awesome icon for "previous"
        listButtons.append(prevButton);
        prevButton.addEventListener("click", saveTheAnswer)
        prevButton.addEventListener("click", showPrevQuestion)
    }

    if (index < 19) {
        const nextButton = document.createElement("button");
        nextButton.classList.add("next-btn");
        nextButton.classList.add("list-btn");
        nextButton.innerText = ">"; // find font awesome icon for "next"
        listButtons.append(nextButton);
        nextButton.addEventListener("click", saveTheAnswer)
        nextButton.addEventListener("click", showNextQuestion)
    }
    parent.append(listButtons);

    function showNextQuestion() {
        parent.innerText = "";
        showQuestion(parent, questions, index + 1);
    }

    function showPrevQuestion() {
        parent.innerText = "";
        showQuestion(parent, questions, index - 1);
    }

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
                image.class = "picture"
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
    const inputName = `question`
    const ansInputs = document.getElementsByName(inputName);
    for (i = 0; i < ansInputs.length; i++) {
        if (ansInputs[i].checked) {
            answer = Number(ansInputs[i].value);
            //get question number from its id
            const questionNum = ansInputs[i].id.split("_")[1];
            // save answer to global usr_answers
            usr_answers[questionNum] = answer;
            // highlighting already answered questions
            curr_question = questionNum;
            let sideQuestionLink = document.getElementById(`q_s_div_${curr_question}`);
            sideQuestionLink.style.backgroundColor = "lightgreen";
        }
    }

}

function showSubmitButton() {
    const submitButton = document.createElement("button");
    submitButton.id = "submit-answers";
    submitButton.innerText = "OK!"; // add font awesome icon to submit
    // displaying given answers
    submitButton.addEventListener("click", () => {
        const p_user = document.createElement("p");
        p_user.innerText = Object.entries(usr_answers);
        p_user.id = "usr_answers";

        body.innerText = "";
        body.append(p_user);
    })
    // getting right answers
    submitButton.addEventListener("click", getCorrAnsers);
    const sidebarDiv = document.getElementById("side-menu-div");
    sidebarDiv.append(submitButton)
}


function getCorrAnsers() {
    for (let i = 0; i < questions.length; i++) {
        corrAnswers[i] = questions[i]["corr_answer"];
    }
    const p_corr = document.createElement("p");
    p_corr.innerText = Object.entries(corrAnswers);
    p_corr.id = "corr_answers"
    p_corr.style.backgroundColor = "lightgreen"
    body.append(p_corr);
}

getAllLanguages()
langBtn.addEventListener('click', getQuestions)