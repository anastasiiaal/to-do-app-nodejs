const { DataTypes } = require('sequelize');
const { sequelize } = require('../sql.js')

const Task = sequelize.define('Task', {
    title: {
        type: DataTypes.STRING,
        allowNul: false
    },
    due_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    done: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    description: {
        type: DataTypes.TEXT
    },
    user_id: {
        type: DataTypes.INTEGER
    }
}, {})

// Task.sync()
// Task.sync({alter: true})         // cela peut peter la BDD, donc ne jamais utiliser en prod; permet de modifier la table, va supprimer les entrees

module.exports = Task