const MessageMethod = {
    ADD: "ADD",
    EDIT: "EDIT",
    DELETE: "DELETE",
    GET: "GET",
    NONE: "NONE"
}

const MessageStatus = {
    SUCCESS: "SUCCESS",
    ERROR: "ERROR",
    NONE: "NONE"
}

const MessageType = {
    REQUEST: "REQUEST",
    RESPONSE: "RESPONSE",
    NONE: "NONE"
}

const Message = {
    line: "",
    method: MessageMethod.NONE,
    status: MessageStatus.NONE,
    type: MessageType.NONE,
    key: -1
}
