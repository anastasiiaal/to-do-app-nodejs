var express = require('express');
var router = express.Router();
let sqlQuery = require('../sql')
let bcrypt = require('bcrypt')
let jwt = require('jsonwebtoken')

function generateToken (id) {
    return jwt.sign(
        // 2eme - celui de user
        {id: id}, 
        // on passe par variables d'environnement (qu'on peut voir dans la console/ailleurs)
        // sont globales pour toute machine
        process.env.JWT_SECRET,
        // 3eme arg - pas obligatoire; passe tout ce qu'on veut de la liste existante en ojbet
        // {
        //     expiresIn: 3600
        // }          
    )
}

// route pour faire le sign up : http://localhost:3000/users/signup ✅
router.post('/signup', (req, res) => {
    const body = req.body;

    if (!body.email || !body.password || !body.display_name) {
        res.status(400)
        res.send("Tous les champs sont obligatoires")
        return
    }

    if (body.password.length < 8) {
        res.status(400)
        res.send("MDP doit avoir au moins 8 symboles")
        return
    }
    
    // fait 12 itérations pour generer le mdp
    bcrypt.hash(body.password, 12).then(hashedPassword => {        
        const insertQuery = `INSERT INTO user (email, password, display_name) VALUES ("${body.email}", "${hashedPassword}", "${body.display_name}")`;

        try {
            sqlQuery(insertQuery, (result) => {
                res.status(201)
                res.send("ok")
            });
          } catch (exception) {
            res.status(500)
            res.send("Erreur lors de la création : " + exception)
          }
    })
})

// ///////////////////////////////////////////////////////////////////
router.post('/login', (req, res) => {
    const body = req.body

    if (!body.email || !body.password) {
        res.status(400)
        res.send("Tous les deux champs sont obligatoires")
        return
    }

    sqlQuery(`SELECT * FROM user WHERE email="${body.email}"`, result => {
        if (result.length === 0) {
            res.status(400)
            res.send("MDP ou email invalide")
            return
        }

        const user = result[0]

        bcrypt.compare(body.password, user.password).then(isOk => {
            if (!isOk) {
                res.status(400)
                res.send("MDP ou email invalide")
            } else {
                // on ne veut pas faire voir le MDP; supprime uniquement coté JS, pas bdd
                delete user.password
                // generate a GWT token
                return res.json({
                    "token": generateToken(user.id),        // generateToken => our function (début fichier)
                    "user": user
                })
            }
        })
    })
})

// ///////////////////////////////////////////////////////////////////
// ici on passe le token dans les headers (clé autorisation; bearer token)
// ici on peut lire tokens à partir de l'objet 
// pour tester ce router : dans le Postman : Headers => Authorization => Bearer: {clé générée à l'étape précedente}
router.get('/token-test', (req, res) => {
    const authHeader = req.headers.authorization;
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
            sqlQuery(`SELECT * FROM user WHERE user.id = ${decoded.id}`, result => {
                if (!result.length) {
                    res.status(401)
                    res.send("Pas authorisé")
                }

                const user = result[0]
                res.send("Bienvenue, " + user.display_name)
            })
        })

    } else {
      // si aucun Authorization header, retourner erreur
      res.status(401)
      res.send("Access pas autorisé")
    }
})

module.exports = router;
