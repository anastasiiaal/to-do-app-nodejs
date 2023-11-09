let jwt = require('jsonwebtoken')
let sqlQuery = require('./sql')

function testMiddleware (req, res, next) {
    console.log("hello depuis middleware");
    next();
    console.log("deuxieme coucou");
}

function authentificationMiddleware (req, res, next) {
    const authHeader = req.headers.authorization;
    // pour voir les headers dont to auth token bearer
    console.log("authHeader === ");
    console.log(authHeader);
    if (authHeader && authHeader.startsWith('Bearer')) {
        // on recupère uniquement ce qui est après l'espace (car avant il y a "Bearer ")
        const token = authHeader.split(' ')[1];
        // pour verifier le jwt
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            console.log(decoded);
            if(err) {
                res.status(401)
                if(err.name == "TokenExpiredError") {
                    res.send('Token expired')
                } else {
                    res.send("Invalid token")
                }
                return
            }
            sqlQuery(`SELECT id, email, display_name FROM user WHERE user.id = ${decoded.id}`, result => {
                if (!result.length) {
                    res.status(401)
                    res.send("Pas authorisé")
                    return 
                }

                const user = result[0];

                req.user = user;
                // cette fonction dit qu'on peut passer à la suite
                next();
            })
        })

    } else {
      // si aucun Authorization header, retourner erreur
      res.status(401)
      res.send("Access pas autorisé (potentiellement problème de token...)")
    }
}

module.exports = {
    testMiddleware,
    authentificationMiddleware
}