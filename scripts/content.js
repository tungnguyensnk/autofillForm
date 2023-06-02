let QAinHTML = [];
let send = (data) => chrome.runtime.sendMessage(data);

function waitForElement(selector) {
    return new Promise((resolve) => {
        const interval = setInterval(() => {
            const element = document.querySelector(selector);
            if (element) {
                clearInterval(interval);
                resolve(element);
            }
        }, 100);
    });
}

waitForElement('#form-main-content').then(async (element) => {
    await send({"type": "loaded"});
});

chrome.runtime.onMessage.addListener(async (data) => {
    console.log(data);
    switch (data.type) {
        case "data":
            getQA();
            for (const item of data.data.data) {
                getQuestion(item);
            }
            QAinHTML[QAinHTML.length - 1].scrollIntoView();
            await send({"type": "done"});
            break;
    }
});

let getQA = () => {
    QAinHTML=Array.from(document.querySelectorAll('[data-automation-id="questionItem"]'))
};

let getQuestion = (data) => {
    QAinHTML.forEach((item) => {
        if (item.innerText.includes(data.question)) {
            pickAnswer(item, data);
            return true;
        }
    });
};

let pickAnswer = (element, data) => {
    Array.from(element.querySelectorAll(`input[value="${data.answer}"]`)).forEach(
        (v,i)=>{
            v.click();
        }
    )
};