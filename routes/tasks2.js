let express = require('express');
let router = express.Router()
const sql = require('../sql')
const Task = require('../models/task')
const { Op } = require('sequelize')

// find all tasks
router.get('/all', function (req, res) {
    Task.findAll().then(tasks => {
        res.json(tasks)
    })
})

// fins all tasks async
router.get('/all/async', async function (req,res) {
    const tasks = await Task.findAll()
    res.json(tasks)
})

// filtered search
router.get('/filtered', async function (req, res) {
    const searchQuery = req.query.search 
    whereClauses = {}
    if (searchQuery) {
        whereClauses.title = {
            [Op.like]: `${searchQuery}`
        }
    }
    let tasks = await Task.findAll({
        where: {
            done: true,
        }
        // where: whereClauses
    })

    res.json(tasks)
    
})

// find task by id (findByPk)
router.get('/:id', (req, res) => {
    const id = req.params.id
    Task.findByPk(id).then(task => {
        if(task) {
            res.json(task)
        } else {
            res.status(404)
            res.send("Task not found")
        }
    })
})

// create task
router.post('/', async (req, res) => {
    const { title, description, user_id } = req.body;

    const due_date = req.body.due_date ? (
        new Date(Date.parse(req.body.due_date))
    ) : null;

    const task = Task.build({
        title: title,
        due_date: due_date,
        description: description,
        user_id: user_id
    })
    
    try {
        await task.save()            
        res.status(201)
        res.json({ message: "Task created successfully" })
    } catch (exception) {
        res.status(500)
        res.send("Something went wrong: " + exception)
    }
})

// modify task
router.patch('/:id', async (req, res) => {
    const id = req.params.id
    const { title, done, description } = req.body
    const due_date = req.body.due_date ? (
        new Date(Date.parse(req.body.due_date))
    ) : undefined;

    const task = Task.findByPk(id)

    if (task) {
        const body = {
            title: title,
            done: done,
            due_date: due_date,
            description: description
        }

        for (let key in body) {
            if (body[key] == undefined) {
                delete body[key]
            } 
        }

        task.set(body)

        try {
            await task.save()
            res.status(200)
            res.json({ message: "Task modified successfully" }, task)
        } catch (exception) {
            res.status(500)
            res.json("Error while modifying :" + exception)
        }
    } else {
        res.status(404)
        res.send("Task you want to modify was not found")
    }
})

// delete task
router.delete('/:id', async (req, res) => {
    const id = req.params.id
    const task = await Task.findByPk(id)

    if(task) {
        try {
            await task.destroy();
            res.status(204)
            res.send({ message: "Task deleted successfully" })
        } catch (exception) {
            res.status(500)
            res.send("Error while deletion: " + exception)
        }
    } else {
        res.status(404)
        res.send("Task you want to delete was not found")
    }
})

module.exports = router