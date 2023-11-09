let express = require('express');
let router = express.Router()
const sql = require('../sql')
const User = require('../models/user')
const { Op } = require('sequelize')

router.post('/login', async (req, res) => {
    const { email, password } = req.body

    if (!body.email || !body.password) {
        res.status(400)
        res.send("Tous les deux champs sont obligatoires")
        return
    }

    const user = await User.findAll({
        where: {
            email: email,
            password: password
        }
    })

    if (user && user.length) {
        user = user[0]
    }

    // je n'ai pas eu temps de finir :(
})

module.exports = router