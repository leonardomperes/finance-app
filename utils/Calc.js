export class Calc {
    constructor() {

    }

    convertToCent(value) {
        // console.log("convertCents", value * 100)
        return +value * 100
    }
    convertToDecimal(value) {
        // console.log("convertToDecimal", value * 100)
        return +value / 100
    }

}