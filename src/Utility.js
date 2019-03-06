export function shuffleArray(arr) {
    let currentIndex = arr.length, temporaryValue, randomIndex;

    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        temporaryValue = arr[currentIndex];
        arr[currentIndex] = arr[randomIndex];
        arr[randomIndex] = temporaryValue;
    }
}

export function map(num, rngA, rngB, rngC, rngD) {
    return (num - rngA) * ((rngD - rngC) / (rngB - rngA)) + rngC
}