function RandInt(_min, _max) {
    let min = Math.ceil(_min);
    let max = Math.floor(_max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}