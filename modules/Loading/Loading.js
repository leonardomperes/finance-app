export class Loading {
    delay(time) {
        return new Promise(resolve => setTimeout(resolve, time))
    }
}