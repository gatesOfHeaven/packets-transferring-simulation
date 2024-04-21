let graph = [
    {
        id: Number,
        adj: {
            [Number]: Number    // id: distance
        },
        pathTable: [
            {
                id: Number,
                distance: Number,
                previous: Number
            }
        ]
    }
];


const submit = () => {
    if (vertices.length < 2) {
        showAlert('✌🏻', 'Error!', 'Your graph must have at least 2 vertices');
        return;
    }

    document.getElementById('build-bar').style.display = 'none';
    document.getElementById('manage-bar').style.display = 'flex';

    document.removeEventListener('mousemove', dragging);
    document.removeEventListener('mouseup', stopDragging);
    vertices.forEach(vertex => {
        vertex.body.addEventListener('mousedown', event =>
            event.target.style.cursor = 'default'
        );
        vertex.body.style.cursor = 'default';
    });

    graph = [];
    for (let i = 0; i < vertices.length; i++)
        graph[i] = {
            id: i,
            adj: {},
            pathTable: []
        };

    edges.forEach(edge => {
        const sourceId = edge.source.id;
        const targetId = edge.target.id;
        const distance = parseFloat(edge.body.textContent);

        graph[sourceId].adj[targetId] = distance;
        graph[targetId].adj[sourceId] = distance;
    });

    graph.forEach(vertex => setPathTable(vertex));
};


const setPathTable = vertex => {
    let visited = [];
    const heap = new MinHeap();

    for (let i = 0; i < vertices.length; i++) {
        vertex.pathTable[i] = {
            id: i,
            distance: Infinity,
            previous: null
        };
        visited[i] = false;
    }

    vertex.pathTable[vertex.id].distance = 0;
    visited[vertex.id] = true;
    heap.push(vertex);

    while (!heap.isEmpty()) {
        const currVertex = heap.pop();
        
        for (let adjVertexId in currVertex.adj) {
            const newDistance = vertex.pathTable[currVertex.id].distance + currVertex.adj[adjVertexId];
            if (newDistance < vertex.pathTable[adjVertexId].distance)
                vertex.pathTable[adjVertexId] = {
                    id: parseInt(adjVertexId),
                    distance: newDistance,
                    previous: currVertex.id
                };

            if (!visited[adjVertexId]) {
                heap.push(graph[adjVertexId]);
                visited[adjVertexId] = true;
            }
        }
    }
};


const showAlert = (icon, header, message) => {
    const alertHeader = document.createElement('header');
    alertHeader.textContent = header;

    const alertMessage = document.createElement('p');
    alertMessage.textContent = message;

    const contentContainer = document.createElement('div');
    contentContainer.className = 'content';
    contentContainer.append(alertHeader, alertMessage);

    const iconContainer = document.createElement('div');
    iconContainer.className = 'icon';
    iconContainer.textContent = icon;

    const alertBody = document.createElement('div');
    alertBody.className = 'alert';
    alertBody.append(iconContainer, contentContainer);
    document.body.appendChild(alertBody);
    
    setTimeout(() => {
        alertBody.style.top = `${-alertBody.getBoundingClientRect().height}px`;
        setTimeout(() => alertBody.remove(), 250);
    }, 2500);
};