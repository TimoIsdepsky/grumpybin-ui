function setFieldStates() {
    const checked = document.querySelector('input[name="option"]:checked');
    const sentence = document.getElementById("sentence");
    const idField = document.getElementById("id");
    
    if (!checked || !sentence || !idField) return;

    // Reset both fields to enabled by default
    sentence.disabled = false;
    idField.disabled = false;

    switch (checked.id) {
        case "radio":
            sentence.disabled = false;
            idField.disabled = true;
            break;
        case "radio-3":
            sentence.disabled = true;
            idField.disabled = false;
            break;
    }
}

// Set initial state
window.addEventListener('DOMContentLoaded', () => {
    setFieldStates();
    document.querySelectorAll('input[name="option"]').forEach(radio => {
        radio.addEventListener('change', setFieldStates);
    });
});

form = document.getElementById('form')
form.addEventListener('submit', (e) => {
    e.preventDefault()
    const checked = document.querySelector('input[name="option"]:checked');
    const lineinput = document.getElementById('sentence');
    const keyinput = document.getElementById('id');
    const message = Message
    message.type = MessageType.REQUEST
    
    switch (checked.id) {
        case "radio":
            message.method = MessageMethod.ADD
            message.line = lineinput.value
            message.key = -1
            message.status = MessageStatus.NONE
            break;
        case "radio-2":
            message.method = MessageMethod.EDIT
            message.line = lineinput.value
            message.key = keyinput.value
            message.status = MessageStatus.NONE
            break
        case "radio-3":
            message.method = MessageMethod.DELETE
            message.line = ""
            message.key = keyinput.value
            message.status = MessageStatus.NONE
            break;
    }

    window.electronAPI.sendToMain('form-message', message)
})

window.electronAPI.onMqttStatus((status) => {
    const statusElem = document.getElementById('status');
    if (statusElem) statusElem.innerText = status;
});

window.electronAPI.onMqttMessage((msg) => {
    console.log("Handler called, raw msg:", msg);
    const message = JSON.parse(msg);
    if (message.type === MessageType.RESPONSE) {
        if (message.status === MessageStatus.SUCCESS) {
            console.log("message.line:", message.line);
            try {
                const messageArray = JSON.parse(message.line);
                console.log("Parsed array:", messageArray);
                const tableBody = document.getElementById('tableBody');
                tableBody.innerHTML = '';
                console.log("typeof messageArray:", typeof messageArray)
                messageArray.forEach((lineStr) => {
                    const [key, line] = lineStr.split(':');
                    const row = document.createElement('tr');
                    row.innerHTML = `<td>${key}</td><td>${line}</td>`;
                    tableBody.appendChild(row);
                });
            } catch (e) {
                console.error("Failed to parse message.line:", e);
            }
        } else {
            const msgElem = document.getElementById('message');
            if (msgElem) msgElem.innerText = "Error retrieving data";
        }
    }
});
