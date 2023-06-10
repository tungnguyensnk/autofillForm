let tab, data, id;
chrome.storage.local.get("data", (req) => {
    data = req.data;
    if (data !== undefined) {
        showNotification("Đã có data");
        let button = document.getElementById("button");
        button.style.display = "block";
    }
});
chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
    tab = tabs[0];
});

let showNotification = (text) => {
    let notification = document.getElementById("notification");
    notification.innerHTML = text;
    if (id !== undefined)
        clearTimeout(id);
    id = setTimeout(() => notification.innerHTML = "", 2000);
}
let send = (data) => chrome.tabs.sendMessage(tab.id, data);
document.getElementById("file").onchange = () => {
    const file = document.getElementById("file").files[0];
    showNotification("Đã chọn file " + file.name);
    let label = document.querySelector("#content > label");
    if (file) {
        label.style.display = "none";
        const reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = async function (evt) {
            data = JSON.parse(evt.target.result + '');
            if (data.link !== undefined) {
                await chrome.storage.local.set({"data": data});
                showNotification("Đang chuyển hướng...");
                await chrome.tabs.update({url: data.link});
            }
        }
    }
}

document.getElementById('button').onclick = () => send({"type": "data", "data": data});
chrome.runtime.onMessage.addListener(async (req) => {
    switch (req.type) {
        case "loaded":
            if (data.length !== 0) {
                showNotification("Đang làm bài...");
                send({"type": "data", "data": data});
            }
            break;
        case "done":
            showNotification("Đã hoàn thành! Nộp bài thôi!");
            break;
    }
});

fetch('https://raw.githubusercontent.com/tungnguyensnk/autofillForm/master/checkdata')
    .then(response => response.json())
    .then(data => {
        let result = document.getElementById("result");
        let text = "Các đáp án form đã có sẵn<br/>(click để tải)";
        data.data.forEach((item) => {
            text += `<br>-> <a href="${item.link}" target="_blank" style="color: aqua">${item.name}</a>`;
        });
        if (data.version === chrome.runtime.getManifest().version)
            text += "<br>Phiên bản mới nhất";
        else
            text += "<br>Có phiên bản mới: <a href='https://github.com/tungnguyensnk/autofillForm/releases' target='_blank' style='color: red'>tại đây</a>";
        result.innerHTML = text;
    })
    .catch(error => console.error(error));
