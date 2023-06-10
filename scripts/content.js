let listQuestionInHTML = [];
const send = (data) => chrome.runtime.sendMessage(data);

const waitForElement = (selector) => {
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

chrome.runtime.onMessage.addListener(async (response) => {
    switch (response.type) {
        case "data":
            if (window.location.href !== response.data.link) {
                window.location.href = response.data.link;
            }
            getQuestionInHTML();
            response.data.data.forEach(getQuestionFromData);
            scrollToSubmit();
            await send({"type": "done"});
            break;
    }
});

const getQuestionInHTML = () => {
    listQuestionInHTML = document.querySelectorAll('[data-automation-id="questionItem"]');
};

const getQuestionFromData = (data) => {
    listQuestionInHTML.forEach((item) => {
        if (item.innerText.includes(data.question)) {
            pickAnswer(item, data);
            return true;
        }
    });
};

const pickAnswer = (element, data) => {
    Array.from(element.querySelectorAll('[data-automation-id="choiceItem"]')).filter((item) =>
        item.innerText.includes(data.answer) && !item.innerText.includes(data?.not)
    )[0]?.querySelector('input').click();
};

const scrollToSubmit = () => {
    document.querySelector('[data-automation-id="submitButton"]').scrollIntoView();
}
