let tab, data;
chrome.storage.local.get("data", (req) => {
    data = req.data;
    if (data !== undefined) {
        showNoti("Đã có data");
        let button = document.getElementById("button");
        button.style.display = "block";
    }
});
chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
    tab = tabs[0];
});
let id;
let showNoti = (text) => {
    let noti = document.getElementById("noti");
    noti.innerHTML = text;
    if (id !== undefined)
        clearTimeout(id);
    id = setTimeout(() => {
        noti.innerHTML = "";
    }, 2000);
}
let send = (data) => chrome.tabs.sendMessage(tab.id, data);
document.getElementById("file").onchange = () => {
    const file = document.getElementById("file").files[0];
    showNoti("Đã chọn file " + file.name);
    let label = document.querySelector("#content > label");
    if (file) {
        label.style.display = "none";
        const reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = async function (evt) {
            data = JSON.parse(evt.target.result + '');
            if (data.link !== undefined) {
                await chrome.storage.local.set({"data": data});
                showNoti("Đang chuyển hướng...");
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
                showNoti("Đang làm bài...");
                send({"type": "data", "data": data});
            }
            break;
        case "done":
            showNoti("Đã hoàn thành! Nộp bài thôi!");
            break;
    }
});