const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DB_NAME_BIS, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: 'localhost',
    dialect: 'mysql'
})

// --------------------------------------------------
// on ne va plus utiliser ça si on utilise sequelize
const mysql = require('mysql');
const pool = mysql.createPool({
    'host': process.env.DB_HOST,
    'user': process.env.DB_USER,
    'password': process.env.DB_PASSWORD,
    'database': process.env.DB_NAME_BIS,
    // pour passer plusieurs requetes sql
    multipleStatements: true
});

function sqlQuery(query, callback){
    pool.getConnection((connError, connection) => {
        if(connError){
            console.log(connError);
            throw new Error("Connection error " + connError);
        }
        try {
            connection.query(query, (error, result) => {
                if(error){
                    console.log(error);
                    throw new Error("Query error " + error);
                }
                
                callback(result);
            });
        } catch(error){
            throw new Error("Unexpected error occured : " + error);
        }
        connection.release();
    });
}

module.exports = {
    sqlQuery,
    sequelize
}


// --------------------------------------------------

/**
 * Fonction utilitaire permettant de faire une requête
 * 
 * Arguments: 
 *   query : Chaîne de caractères d'une requête SQL
 *   callback : Fonction de rappel qui sera appelée avec le résultat de la requête en cas de succès
 * 
 * Attention ! En cas d'erreur une exception sera levée, il faut entourer les appels à cette fonction par un try/except
 * try {
 *     sqlQuery(....)
 * } except {
 *     // Gestion de l'erreur ici
 * }
 * 
 * Exemple d'utilisation */
// try {
//     sqlQuery("SELECT * FROM tasks", (results) => {
//         console.log(results);
//     })
// } catch (error) {
//     console.log(error);   
// }
