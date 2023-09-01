const langBtn = document.getElementById("lang-btn");
const langForm = document.getElementById("lang-form");
const body = document.querySelector("body")

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
            let questions = await response.json();
            await renderExam(questions);
        }
    } catch (error) {
        console.log(error)
    }
}

async function renderExam(questions) {
    body.innerText = ""
    //box for 1 question
    const questionsDiv = document.createElement("div");
    questionsDiv.id = "questions_div";
    body.append(questionsDiv);

    // renderSideMenu();
    await showQuestion(questionsDiv, questions, 0);
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
        answerInp.name = `question${index}`
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
        prevButton.addEventListener("click", showPrevQuestion)
    }

    if (index < 19) {
        const nextButton = document.createElement("button");
        nextButton.classList = ["next-btn", "list-btn"];
        nextButton.innerText = ">"; // find font awesome icon for "next"
        parent.append(nextButton);
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

getAllLanguages()
langBtn.addEventListener('click', getQuestions)