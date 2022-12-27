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
    let i = 1;
    do {
        let tmp = document.querySelector("#form-main-content > div > div.office-form.office-form-theme-shadow > div.office-form-body > div.office-form-question-body > div:nth-child(" + i + ")");
        if (tmp !== null) {
            QAinHTML.push(tmp);
            i++;
        } else {
            break;
        }
    } while (1);
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
    let i = 1;
    do {
        let tmp = element.querySelector("div.office-form-question-choice:nth-child(" + i + ")  > div > label > input");
        if (tmp !== null) {
            if (tmp.value.includes(data.answer)) {
                if (data.not !== undefined && tmp.value.includes(data.not)) {
                    i++;
                    continue;
                }
                tmp.click();
                break;
            }
            i++;
        } else {
            break;
        }
    } while (1);
};