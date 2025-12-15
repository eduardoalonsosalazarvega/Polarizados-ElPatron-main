const jwt = require("jsonwebtoken");
const secretKey = "MI_LLAVE_SECRETA_SUPER_SEGURA";

module.exports = (req, res, next) => {
    const header = req.headers["authorization"];

    if (!header) {
        return res.status(401).json({ message: "Token requerido" });
    }

    const token = header.split(" ")[1];

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Token inválido" });
        }

        req.user = decoded; // contiene userId, username, role
        next();
    });
};
