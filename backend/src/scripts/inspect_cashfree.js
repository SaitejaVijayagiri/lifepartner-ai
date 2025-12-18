const { Cashfree } = require("cashfree-pg");
console.log("Cashfree Class:", Cashfree);
if (Cashfree) {
    console.log("Static Keys:", Object.keys(Cashfree));
    console.log("Environment:", Cashfree.Environment);
    console.log("XEnvironment:", Cashfree.XEnvironment);
} else {
    console.log("Cashfree is undefined");
}
