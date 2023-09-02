const langBtn = document.getElementById("lang-btn");
const langForm = document.getElementById("lang-form");
const body = document.querySelector("body");
let questions = '';
let answers = {};
let corrAnswers = {};
// let answers = {
//     0: 0,
//     1: 0,
//     2: 0,
//     3: 0,
//     4: 0,
//     5: 0,
//     6: 0,
//     7: 0,
//     8: 0,
//     9: 0,
//     10: 0,
//     11: 0,
//     12: 0,
//     13: 0,
//     14: 0,
//     15: 0,
//     16: 0,
//     17: 0,
//     18: 0,
//     19: 0,
// }

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
    const questionsDiv = document.createElement("div");
    questionsDiv.id = "questions_div";
    body.append(questionsDiv);

    // renderSideMenu();
    await showQuestion(questionsDiv, questions, 0);
    showSubmitButton();
}


//clean it up!
async function showQuestion(parent, questions, index) {

    // question
    const question = questions[index];
    const questionOfQuestion = document.createElement("h3");
    questionOfQuestion.innerText = question["question"];
    parent.append(questionOfQuestion);

    //image
    await displayImg(parent, question["image_id"]);


    // all 4 answers
    const answers = [question['answer1'], question['answer2'], question['answer3'], question['answer4']];

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
        //append
        parent.append(answerDiv);
        answerDiv.append(answerInp, answerLabel);
    }

    //list buttons
    if (index > 0) {
        const prevButton = document.createElement("button");
        prevButton.classList = ["prev-btn", "list-btn"];
        prevButton.innerText = "<"; // find font awesome icon for "previous"
        parent.append(prevButton);
        prevButton.addEventListener("click", saveTheAnswer)
        prevButton.addEventListener("click", showPrevQuestion)
    }

    if (index < 19) {
        const nextButton = document.createElement("button");
        nextButton.classList = ["next-btn", "list-btn"];
        nextButton.innerText = ">"; // find font awesome icon for "next"
        parent.append(nextButton);
        nextButton.addEventListener("click", saveTheAnswer)
        nextButton.addEventListener("click", showNextQuestion)
    }
    
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
                throw new Error("Couldn`t get languages")
            } else {
                let data = await response.json();
                const image = document.createElement("img");
                image.src = data["image_link"];
                element.append(image);
            }
        }
    } catch (error) {
        console.log(error)
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
            // save answer to global answers
            answers[questionNum] = answer;
            console.log(answers)
        }
    }

}

function showSubmitButton() {
    const submitButton = document.createElement("button");
    submitButton.id = "submit-answers";
    submitButton.innerText = "Submit all answers and finish" // add font awesome icon to submit
    // displaying given answers
    submitButton.addEventListener("click", () => {
        const p_user = document.createElement("p");
        console.log(Object.entries(answers))
        p_user.innerText = Object.entries(answers);
        p_user.id = "usr_answers"

        body.innerText = "";
        body.append(p_user);
    })
    // getting right answers
    submitButton.addEventListener("click", getCorrAnsers)
    body.append(submitButton)
}


function getCorrAnsers() {
    for (let i = 0; i < questions.length; i++) {
        corrAnswers[i] = questions[i]["corr_answer"];
    }
    const p_corr = document.createElement("p");
    console.log(Object.entries(answers))
    p_corr.innerText = Object.entries(corrAnswers);
    p_corr.id = "corr_answers"
    p_corr.style.backgroundColor = "lightgreen"
    body.append(p_corr);
}

getAllLanguages()
langBtn.addEventListener('click', getQuestions)