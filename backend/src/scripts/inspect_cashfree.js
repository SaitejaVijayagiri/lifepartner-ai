const { Cashfree } = require("cashfree-pg");
console.log("Cashfree Class:", Cashfree);
if (Cashfree) {
    console.log("Static Keys:", Object.keys(Cashfree));
    console.log("XEnvironment (Initial):", Cashfree.XEnvironment);

    try {
        console.log("Trying new Cashfree({ xEnvironment: 'TEST' })...");
        const cf = new Cashfree({
            xClientId: "TEST_ID",
            xClientSecret: "TEST_SECRET",
            xEnvironment: "TEST"
        });
        console.log("Instantiation Success!");
    } catch (e) {
        console.log("Instantiation with TEST failed:", e.message);
    }
} else {
    console.log("Cashfree is undefined");
}
