const pkg = require("cashfree-pg");
console.log("Exports:", pkg);
console.log("Cashfree keys:", pkg.Cashfree ? Object.keys(pkg.Cashfree) : "Cashfree missing");
if (pkg.Cashfree) {
    console.log("Cashfree static props:", Object.getOwnPropertyNames(pkg.Cashfree));
}
