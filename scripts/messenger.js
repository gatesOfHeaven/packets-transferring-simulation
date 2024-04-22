let messages = [
    {
        id: Number,
        senderId: Number,
        receiverId: Number,
        path: Array,
        text: String,
        time: Date
    }
];
let currPath = [];

const phoneMenu = document.querySelector('#manage-bar aside');
const dynamicIsland = document.getElementById('dynamic-island');
const senderInput = document.getElementById('sender');
const receiverInput = document.getElementById('receiver');
const chat = {
    header: document.querySelector('#manage-bar header'),
    history: document.querySelector('#history'),
    footer: document.querySelector('#manage-bar footer')
};

senderInput.setAttribute('max', graph.length - 1);
receiverInput.setAttribute('max', graph.length - 1);


const openChat = () => {
    const senderId = parseInt(senderInput.value);
    const receiverId = parseInt(receiverInput.value);
    const n = graph.length;

    if (isNaN(senderId) || isNaN(receiverId)) {
        showAlert('🤐', 'Error!', 'Fill both inputs');
        return;
    }

    if (
        senderId < 0 || senderId >= n ||
        receiverId < 0 || receiverId >= n ||
        senderId == receiverId
    ) {
        showAlert('👩🏼‍🦽', 'Error!', 'Invalid input');
        return;
    }

    const pathTable = graph[senderId].pathTable;
    if (pathTable[receiverId].distance == Infinity) {
        showAlert('🚷', 'Error!', `There is no path between ${senderId} and ${receiverId}`);
        return;
    }

    phoneMenu.style.display = 'none';
    for(let part in chat)
        chat[part].style.display = 'flex';

    let currVertexId = receiverId;
    while (currVertexId != senderId) {
        currPath.unshift(currVertexId);
        const prevVertexId = pathTable[currVertexId].previous;

        vertices[currVertexId].body.style.backgroundColor = 'black';
        edges.find(edge =>
            edge.source.id == prevVertexId && edge.target.id == currVertexId ||
            edge.source.id == currVertexId && edge.target.id == prevVertexId
        ).body.style.backgroundColor = 'black';

        currVertexId = prevVertexId;
    }
    currPath.unshift(currVertexId);

    const vertexStyles = { backgroundColor: 'black', borderColor: 'black' };
    Object.assign(vertices[senderId].body.style, vertexStyles);
    Object.assign(vertices[receiverId].body.style, vertexStyles);

    // open chat
    const senderInDynamicIsland = document.createElement('span');
    const receiverInDynamicIsland = document.createElement('span');
    senderInDynamicIsland.textContent = senderId;
    receiverInDynamicIsland.textContent = receiverId;
    dynamicIsland.style.width = '130px';
    dynamicIsland.append(senderInDynamicIsland, receiverInDynamicIsland);

    let pathString = currPath.toString();
    while (pathString.includes(','))
        pathString = pathString.replace(',', ' ');

    chat.header.querySelector('.path').textContent = pathString;
    chat.header.querySelector('.avatar').textContent = receiverId;
    chat.footer.querySelector('.avatar').textContent = senderId;
    
    messages.filter(message =>
        senderId == message.senderId && receiverId == message.receiverId ||
        senderId == message.receiverId && receiverId == message.senderId
    ).forEach(message => {
        let month = message.time.getMonth();
        let hours = message.time.getHours();
        let minutes = message.time.getMinutes();
        month = (month < 9 ? '0' : '') + (month + 1);
        hours = (hours < 10 ? '0' : '') + hours;
        minutes = (minutes < 10 ? '0' : '') + minutes;

        const messageTextBody = document.createElement('div');
        messageTextBody.className = 'dialog-shape';
        messageTextBody.textContent = message.text;
        const messageTimeBody = document.createElement('span');
        messageTimeBody.className = 'time';
        messageTimeBody.textContent = `${message.time.getDate()}.${month} ${hours}:${minutes}`;
        const messageBody = document.createElement('div');

        if (senderId == message.senderId) {
            messageBody.append(messageTimeBody, messageTextBody);
            messageBody.className = 'sender-message';
        } else {
            messageBody.append(messageTextBody, messageTimeBody);
            messageBody.className = 'receiver-message';
        }

        chat.history.appendChild(messageBody);
    });

    chat.history.scrollTop = chat.history.scrollHeight - chat.history.clientHeight;
    
    chat.history.addEventListener('contextmenu', showContext);
};


const closeChat = () => {
    currPath = [];
    vertices.forEach(vertex => Object.assign(vertex.body.style, {
        backgroundColor: '#0c4a6e',
        borderColor: '#ccc'
    }));
    edges.forEach(edge => edge.body.style.backgroundColor = '#ccc');

    for (let part in chat)
        chat[part].style.display = 'none';
    phoneMenu.style.display = 'flex';

    dynamicIsland.style.width = '100px';
    dynamicIsland.innerHTML = '';
    chat.history.innerHTML = '';
};

const QUALITY = 0.7;
const history = document.getElementById("history");
const fileInput = document.getElementById("fileInput");

const sendMessage = () => {
    const messageInput = document.getElementById("messageInput");
    if (messageInput.value === "") {
        showAlert("💨", "Error!", "Your message is empty");
        return;
    }

    const message = {
        id: messages.length,
        senderId: currPath[0],
        receiverId: currPath[currPath.length - 1],
        path: currPath.slice(),
        text: messageInput.value,
        time: new Date(),
        image: null // Placeholder for the compressed image data
    };

    let month = message.time.getMonth();
    let hours = message.time.getHours();
    let minutes = message.time.getMinutes();
    month = (month < 9 ? "0" : "") + (month + 1);
    hours = (hours < 10 ? "0" : "") + hours;
    minutes = (minutes < 10 ? "0" : "") + minutes;

    messageInput.value = "";
    const messageTextBody = document.createElement("div");
    messageTextBody.className = "dialog-shape";
    messageTextBody.textContent = message.text;
    const messageTimeBody = document.createElement("span");
    messageTimeBody.className = "time";
    messageTimeBody.textContent = `${message.time.getDate()}.${month} ${hours}:${minutes}`;
    const messageBody = document.createElement("div");
    messageBody.className = "sender-message";
    messageBody.append(messageTimeBody, messageTextBody);
    history.appendChild(messageBody);
    history.scrollTop = history.scrollHeight - history.clientHeight;

    messages[message.id] = message;
};

fileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    compressAndSendMessage(file);
});

const compressAndSendMessage = (file) => {
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const imageData = e.target.result; // Binary data of the image

            // Log the original image size
            console.log("Original Image Size:", imageData.length, "bytes");

            // Compress the image using canvas
            const img = new Image();
            img.src = imageData;
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0, img.width, img.height);

                canvas.toBlob(
                    (blob) => {
                        // Log the compressed image size
                        console.log("Compressed Image Size:", blob.size, "bytes");
                        const compressedImageDataURL = URL.createObjectURL(blob);
                        sendMessageWithImage(compressedImageDataURL);
                    },
                    file.type
                );
            };
        };
        reader.readAsDataURL(file); // Read the selected file as data URL
    }
};

const sendMessageWithImage = (imageDataURL) => {
    const message = {
        id: messages.length,
        senderId: currPath[0],
        receiverId: currPath[currPath.length - 1],
        path: currPath.slice(),
        text: "",
        time: new Date(),
        image: imageDataURL
    };

    let month = message.time.getMonth();
    let hours = message.time.getHours();
    let minutes = message.time.getMinutes();
    month = (month < 9 ? "0" : "") + (month + 1);
    hours = (hours < 10 ? "0" : "") + hours;
    minutes = (minutes < 10 ? "0" : "") + minutes;

    const messageImage = document.createElement("img");
    messageImage.classList.add('message-img')
    messageImage.src = imageDataURL;

    const messageTimeBody = document.createElement("span");
    messageTimeBody.className = "time";
    messageTimeBody.textContent = `${message.time.getDate()}.${month} ${hours}:${minutes}`;

    const messageBody = document.createElement("div");
    messageBody.className = "image-container";
    messageBody.className = "sender-message";
    messageBody.appendChild(messageTimeBody);
    messageBody.appendChild(messageImage);

    history.appendChild(messageBody);
    history.scrollTop = history.scrollHeight - history.clientHeight;

    messages[message.id] = message;
};




const showContext = (event) => {
    event.preventDefault();
    let context = document.getElementById('context');
    if (context)
        context.remove();

    context = {
        body: document.createElement('div'),
        refresh: document.createElement('div'),
        toBottom: document.createElement('div'),
        back: document.createElement('div')
    };
    context.body.id = 'context';

    context.refresh.className = 'option';
    context.refresh.textContent = 'Refresh';
    context.refresh.addEventListener('click', () => {
        closeChat();
        openChat();
    });

    context.toBottom.className = 'option';
    context.toBottom.textContent = 'To Bottom';
    context.toBottom.addEventListener('click', () =>
        chat.history.scrollTop = chat.history.scrollHeight - chat.history.clientHeight
    );

    context.back.className = 'option';
    context.back.textContent = 'Close Chat';
    context.back.addEventListener('click', closeChat);

    context.body.style.left = `${event.clientX}px`;
    context.body.style.top = `${event.clientY}px`;
    context.body.append(context.refresh, context.toBottom, context.back);
    document.body.appendChild(context.body);

    for (let part in chat)
        chat[part].style.filter = 'blur(1px)';

    const hideContest = () => {
        context.body.remove();
        for (let part in chat)
            chat[part].style.filter = 'none';
        document.removeEventListener('click', hideContest);
    }

    document.addEventListener('click', hideContest);
};
