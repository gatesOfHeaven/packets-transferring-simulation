let vertices = [
    {
        id: Number,
        body: HTMLDivElement
    }
];

let edges = [
    {
        source: { id: Number, body: HTMLDivElement },
        target: { id: Number, body: HTMLDivElement },
        body: HTMLDivElement
    }
];

const area = document.getElementById('graph-area');
const sourceInput = document.getElementById('source-input');
const targetInput = document.getElementById('target-input');

let isDragging = false;
let draggableVertexBody;
let offsetX, offsetY;

const startDragging = event =>  {
    isDragging = true;
    draggableVertexBody = event.target;
    const vertexRect = draggableVertexBody.getBoundingClientRect();
    offsetX = event.clientX - vertexRect.left;
    offsetY = event.clientY - vertexRect.top;
    draggableVertexBody.style.zIndex = 3;
    draggableVertexBody.style.cursor = 'grabbing'
};

const dragging = event => {
    if (isDragging && draggableVertexBody) {
        const areaRect = area.getBoundingClientRect();
        draggableVertexBody.style.left = `${event.clientX - offsetX - areaRect.left}px`;
        draggableVertexBody.style.top = `${event.clientY - offsetY - areaRect.top}px`;

        const draggableVertexId = parseInt(draggableVertexBody.id.replace('vertex-', ''));
        edges.forEach(edge => {
            if (
                edge.source.id == draggableVertexId ||
                edge.target.id == draggableVertexId
            ) determineEdgePosition(edge);
        });
    }
};

const stopDragging = () => {
    if (isDragging && draggableVertexBody) {
        isDragging = false;
        draggableVertexBody.style.cursor = 'grab';
        draggableVertexBody.style.zIndex = 2;
        preventVertexExit(draggableVertexBody);
        draggableVertexBody = null;
    }
};

const addVertices = () => {
    const n = parseInt(document.getElementById('vertices-count').value);
    if (isNaN(n) || n < 2) {
        showAlert('🤭', 'Error!', 'So short!');
        return;
    }

    area.innerHTML = '';
    sourceInput.setAttribute('max', n);
    targetInput.setAttribute('min', n);

    vertices = [];
    edges = [];
    const areaWidth = area.getBoundingClientRect().width;

    for (let i = 0; i < n; i++) {
        const vertexBody = document.createElement('div');
        vertexBody.id = `vertex-${i}`;
        vertexBody.className = 'vertex';
        vertexBody.style.left = `${10 + 40 * (i % (areaWidth / 45))}px`;
        vertexBody.style.top = `${10 + 40 * parseInt(i * 45 / areaWidth)}px`;
        vertexBody.textContent = i;
        area.appendChild(vertexBody);

        vertexBody.addEventListener('mousedown', startDragging);

        vertices[i] = { id: i, body: vertexBody };
    }
    document.addEventListener('mousemove', dragging);
    document.addEventListener('mouseup', stopDragging);
};

const connect = () => {
    const sourceId = sourceInput.value;
    const targetId = targetInput.value;
    const n = vertices.length;

    if (sourceId == '' || targetId == '') {
        showAlert('🤐', 'Error!', 'Fill both inputs');
        return;
    }

    if (
        sourceId == targetId ||
        sourceId < 0 || sourceId >= n ||
        targetId < 0 || targetId >= n ||
        sourceId[0] == '0' && sourceId != 0 ||
        targetId[0] == '0' && targetId != 0
    ) {
        showAlert('👩🏼‍🦽', 'Error!', 'Invalid input');
        return;
    }

    if (edges.find(edge =>
        edge.source.id == sourceId && edge.target.id == targetId ||
        edge.source.id == targetId && edge.target.id == sourceId
    )) {
        showAlert('🙏🏻', 'Error!', 'Sush edge already exists');
        return;
    }

    const edgeBody = document.createElement('div');
    edgeBody.id = `edge-${sourceId}-${targetId}`;
    edgeBody.className = 'edge';
    area.appendChild(edgeBody);
    
    const edge = {
        source: vertices[sourceId],
        target: vertices[targetId],
        body: edgeBody
    };

    edges.push(edge);
    determineEdgePosition(edge);
};

const preventVertexExit = vertexBody => {
    const areaRect = area.getBoundingClientRect();
    const vertexRect = vertexBody.getBoundingClientRect();

    if (vertexRect.left < areaRect.left)
        vertexBody.style.left = '0px';
    else if (vertexRect.left > areaRect.right - vertexRect.width)
        vertexBody.style.left = `${areaRect.width - vertexRect.width}px`;

    if (vertexRect.top < areaRect.top)
        vertexBody.style.top = '0px';
    else if (vertexRect.top > areaRect.bottom - vertexRect.height)
        vertexBody.style.top = `${areaRect.height - vertexRect.height}px`;

    const draggableVertexId = parseInt(vertexBody.id.replace('vertex-', ''));
    edges.forEach(edge => {
        if (
            draggableVertexId == edge.source.id ||
            draggableVertexId == edge.target.id
        ) determineEdgePosition(edge);
    });
};

const determineEdgePosition = edge => {
    const areaRect = area.getBoundingClientRect();
    const sourceRect = edge.source.body.getBoundingClientRect();
    const targetRect = edge.target.body.getBoundingClientRect();
    let distance = Math.sqrt((sourceRect.left - targetRect.left) ** 2 + (sourceRect.top - targetRect.top) ** 2);

    Object.assign(edge.body.style, {
        left: `${sourceRect.left + sourceRect.width/2 - areaRect.left}px`,
        top: `${sourceRect.top + sourceRect.height/2 - areaRect.top}px`,
        width: `${distance}px`,
        transform: `rotate(${Math.atan2(
            targetRect.top - sourceRect.top, targetRect.left - sourceRect.left
        ) * 180/Math.PI}deg)`
    });

    edge.body.textContent = distance < 100 ? parseInt(distance) : parseInt(distance * 10) / 10;
};

