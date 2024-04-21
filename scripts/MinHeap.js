class MinHeap {
    constructor() {
        this.heap = [];
    }

    push(value) {
        this.heap.push(value);
        this.heapifyUp(this.heap.length - 1);
    }

    pop() {
        if (this.isEmpty()) {
            return null;
        }
        if (this.heap.length === 1) {
            return this.heap.pop();
        }
        const min = this.heap[0];
        this.heap[0] = this.heap.pop();
        this.heapifyDown(0);
        return min;
    }

    isEmpty() {
        return this.heap.length === 0;
    }

    heapifyUp(index) {
        let currentIndex = index;
        let parentIndex = Math.floor((currentIndex - 1) / 2);
        while (currentIndex > 0 && this.heap[currentIndex] < this.heap[parentIndex]) {
            [this.heap[currentIndex], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[currentIndex]];
            currentIndex = parentIndex;
            parentIndex = Math.floor((currentIndex - 1) / 2);
        }
    }

    heapifyDown(index) {
        let currentIndex = index;
        let leftChildIndex = 2 * currentIndex + 1;
        let rightChildIndex = 2 * currentIndex + 2;
        let smallestChildIndex = currentIndex;

        if (leftChildIndex < this.heap.length && this.heap[leftChildIndex] < this.heap[smallestChildIndex])
            smallestChildIndex = leftChildIndex;

        if (rightChildIndex < this.heap.length && this.heap[rightChildIndex] < this.heap[smallestChildIndex])
            smallestChildIndex = rightChildIndex;

        if (smallestChildIndex !== currentIndex) {
            [this.heap[currentIndex], this.heap[smallestChildIndex]] = [this.heap[smallestChildIndex], this.heap[currentIndex]];
            this.heapifyDown(smallestChildIndex);
        }
    }
}