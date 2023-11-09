const { DataTypes } = require('sequelize');
const { sequelize } = require('../sql.js')

const User = sequelize.define('User', {
    email: {
        type: DataTypes.STRING,
    },
    password: {
        type: DataTypes.STRING,
        set: function(value) {
            this.setDataValue(value + "*")
        }
    },
    display_name: {
        type: DataTypes.STRING,
    }
}, {
    indexes: [
        // pour que l'email soit unique
        {'unique': true, fields: ['email']},
        // pour que la combinaison de non + user soit unique
        // {'unique': true, fields: ['name', 'user']},
    ]
})

// User.sync();
// User.sync({alter: true})         // cela peut peter la BDD, donc ne jamais utiliser en prod; permet 

module.exports = User