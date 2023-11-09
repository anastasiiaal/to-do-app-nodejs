var express = require('express');
var router = express.Router();
let sqlQuery = require('../sql')
let middlewares = require('./../middlewares')

// sera executé avant chaque route dans cette page
router.use(middlewares.authentificationMiddleware)

// ce simple router est adapté a être utilisé avec authentification ✅✅
router.get('/all', function (req, res) {
  const user = req.user;

  let query = `SELECT id, title, due_date, done, description FROM tasks`;

  query += ` WHERE user_id = ${req.user.id}`
  sqlQuery(query, result => {
    res.json(result)
  })
})

// this router is to show all data on tasks page => http://127.0.0.1:3000/tasks || /tasks?page=1 ✅✅
router.get('/', function (req, res) {
  // to get the value of ?page=
  const page = req.query.page;
  const done = req.query.done;
  const like = req.query.like;
  const sortBy = req.query.sortBy;
  let tasksToShow = 5;
  let offset;
  if (!page || page == 1) {
    offset = 0;
  } else if (page > 1) {
    offset = (page-1) * tasksToShow;
  } else {
    return res.status(400).json({ error: 'Page n\'existe pas.' });
  }

  try {
    // ce WHERE faut rajouter a chaque route
    let mainQuery = `SELECT * FROM tasks WHERE user_id = ${req.user.id}`
    let countQuery = `SELECT COUNT(*) AS count FROM tasks WHERE user_id = ${req.user.id}`

    if (done == 1) {
      mainQuery += " AND done = 1";
      countQuery += " AND done = 1";
    } else if (done == 0) {
      mainQuery += " AND done = 0";
      countQuery += " AND done = 0";
    } else {
      mainQuery = mainQuery;
      countQuery = countQuery;
    }

    if (like) {
      mainQuery += ` AND title LIKE "%${like}%"`;
      countQuery += ` AND title LIKE "%${like}%"`;
    }

    if (sortBy === "asc" || sortBy === "desc") {
      mainQuery += ` ORDER BY due_date ${sortBy}`;
    }

    mainQuery += ` LIMIT ${tasksToShow} OFFSET ${offset}`;

    sqlQuery(countQuery, (countResult) => {
      const totalItems = countResult[0].count;

      sqlQuery(mainQuery, (result) => {
        if (result.length > 0) {
          res.json({ 
            count: totalItems, 
            hasPrev: page > 1,
            hasNext: (page * tasksToShow) < totalItems  || !page,
            data: result
          });
        } else {
          return res.status(400).json({ 
            error: 'Page n\'existe pas.' 
          });
        }
      });
    });
  } catch (exception) {
    res.status(500)
    res.send("Error : " + exception)
  }
});

// ////////////////////////////////////////////////////////////////////////////////

// test router   => http://127.0.0.1:3000/tasks/test ✅✅
// filtre par due date + fait la pagination + sort done/not
router.get('/test', (req, res) => {
  const page = req.query.page;
  const done = req.query.done;
  const like = req.query.like;
  const sortBy = req.query.sortBy;
  let tasksToShow = 5;
  let offset;
  if (!page || page == 1) {
    offset = 0;
  } else if (page > 1) {
    offset = (page-1) * tasksToShow;
  } else {
    return res.status(400).json({ error: 'Page n\'existe pas.' });
  }

  try {
    let mainQuery = `SELECT * FROM tasks WHERE user_id = ${req.user.id}`
    let countQuery = `SELECT COUNT(*) AS count FROM tasks WHERE user_id = ${req.user.id}`

    if (done == 1) {
      mainQuery += " AND done = 1";
      countQuery += " AND done = 1";
    } else if (done == 0) {
      mainQuery += " AND done = 0";
      countQuery += " AND done = 0";
    } else {
      mainQuery = mainQuery;
      countQuery = countQuery;
    }

    if (like) {
      mainQuery += ` AND title LIKE "%${like}%"`;
      countQuery += ` AND title LIKE "%${like}%"`;
    }

    if (sortBy === "asc" || sortBy === "desc") {
      mainQuery += ` ORDER BY due_date ${sortBy}`;
    }

    mainQuery += ` LIMIT ${tasksToShow} OFFSET ${offset}`;

    sqlQuery(countQuery, (countResult) => {
      const totalItems = countResult[0].count;

      sqlQuery(mainQuery, (result) => {
        if (result.length > 0) {
          res.json({ 
            count: totalItems, 
            hasPrev: page > 1,
            hasNext: (page * tasksToShow) < totalItems  || !page,
            data: result
          });
        } else {
          return res.status(400).json({ 
            error: 'Page n\'existe pas.' 
          });
        }
      });
    });
  } catch (exception) {
    res.status(500)
    res.send("Error : " + exception)
  }
});

// ////////////////////////////////////////////////////////////////////////////////

// this router is to show the data concerning a specific task => http://127.0.0.1:3000/tasks/1 ✅✅
router.get('/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  const taskQuery = "SELECT * FROM tasks WHERE id = " + taskId + ` AND user_id = ${req.user.id}`
  try {
    sqlQuery(taskQuery, (result) => {
      if(result.length === 1) {
        // console.log(result);
        res.json(result);
      } else {
        res.status(404).json({
          error: 'Tâche non trouvée'
        });
      }
    })
  } catch (exception) {
    res.status(500)
    res.send("Error : " + exception)
  }
});

// ////////////////////////////////////////////////////////////////////////////////

// this router is to add a new task to the list ✅✅
router.post('/', (req, res) => {
  const { title, due_date, done, description, user } = req.body;

  const insertQuery = `INSERT INTO tasks (title, due_date, done, description, user_id) VALUES ("${title}", "${due_date}", "${done}", "${description}", "${req.user.id}")`;
  
  try {
    sqlQuery(insertQuery, (result) => {
      if (result.affectedRows === 1) {
        res.json({ message: 'Tâche ajoutée avec succès' });
      } else {
        res.status(500).json({ 
          error: 'Une erreur est survenue lors de l\'ajout de la tâche.' 
        });
      }
    });
  } catch (exception) {
    res.status(500)
    res.send("Error : " + exception)
  }
});

// ////////////////////////////////////////////////////////////////////////////////

// this router is to modify data concerning one particular task ✅✅
router.patch('/:id', (req, res) => {
  const taskId = req.params.id;
  const fieldsToUpdate = req.body;

  let updateQuery = 'UPDATE tasks SET ';
  const updates = [];

  for (const key in fieldsToUpdate) {
    if (fieldsToUpdate.hasOwnProperty(key)) {
      updates.push(`${key} = "${fieldsToUpdate[key]}"`);
    }
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'Aucune donnée de mise à jour fournie.' });
  }

  updateQuery += updates.join(', ');
  updateQuery += ` WHERE id = ${taskId} AND user_id = ${req.user.id}`;

  try {
    sqlQuery(updateQuery, (result) => {
      if (result.affectedRows === 1) {
        res.json({ message: 'Tâche mise à jour avec succès' });
      } else {
        res.status(500).json({ 
          error: 'Une erreur est survenue lors de la mise à jour de la tâche.' 
        });
      }
    });
  } catch (exception) {
    res.status(500)
    res.send("Error : " + exception)
  }
});


// this router is to delete the task ✅✅
router.delete('/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  const deleteQuery = "DELETE FROM tasks WHERE id = " + taskId + ` AND user_id = ${req.user.id}`;

  try {
    sqlQuery(deleteQuery, (result) => {
      if (result.affectedRows === 1) {
        res.json({ 
          message: "Tâche supprimée avec succès" 
        });
      } else {
        res.status(404).json({ 
          error: "Tâche non trouvée" 
        });
      }
    });
  } catch (exception) {
    res.status(500)
    res.send("Error : " + exception)
  }
});





module.exports = router;
