const express = require("express")
const router = new express.Router()
const Task = require("../models/task")
const auth = require("../middleware/auth")
const {Mongoose} = require("mongoose")
const User = require("../models/user")

router.post("/tasks", auth, async (req, res) => {
  const task = new Task({
    ...req.body,
    owner: req.user._id,
  })
  try {
    await task.save()
    res.status(201).send(task)
  } catch (e) {
    res.status(500).send(e)
  }
  // task
  //   .save()
  //   .then(() => {
  //     res.send(task)
  //   })
  //   .catch((e) => {
  //     res.status(400).send(e)
  //   })
})

//GET / task?comleted=true
//GET / task?limit=10&skip=20
//GET / tasks?sortBy = CreatedAt_asc/desc
router.get("/tasks", auth, async (req, res) => {
  const match = {}
  const sort = {}
  if (req.query.completed) {
    match.completed = req.query.completed === "true"
  }
  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(":")
    sort[parts[0]] = parts[1] === "desc" ? -1 : 1
  }
  try {
    // const tasks = await Task.find({owner: req.user._id})
    await req.user
      .populate({
        path: "tasks",
        match,
        options: {
          limit: parseInt(req.query.limit),
          skip: parseInt(req.query.skip),
          sort: {
            sort,
          },
        },
      })
      .execPopulate()
    res.status(400).send(req.user.tasks)
  } catch (e) {
    res.status(500).send(e)
  }
  // Task.find({})
  //   .then((tasks) => {
  //     res.send(tasks)
  //   })
  //   .catch(() => {
  //     res.status(500).send()
  //   })
})

router.get("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id
  try {
    const task = await Task.findOne({_id, owner: req.user._id})
    if (!task) {
      return res.status(404).send({error: "error"})
    }
    res.status(400).send(task)
  } catch (e) {
    res.status(500).send(e)
  }
  // Task.findById(_id)
  //   .then((task) => {
  //     if (!task) {
  //       return res.status(404).send()
  //     }
  //     res.send(task)
  //   })
  //   .catch((e) => {
  //     res.status(400).send(e)
  //   })
})

router.patch("/tasks/:id", auth, async (req, res) => {
  const allowedUpdates = ["description", "completed"]
  const updates = Object.keys(req.body)
  const isValid = updates.every((item) => {
    return allowedUpdates.includes(item)
  })
  if (!isValid) {
    return res.status(400).send({error: "Invalid Update"})
  }
  try {
    const task = await Task.findOne({_id: req.params.id, owner: req.user._id})
    allowedUpdates.forEach((update) => (task[update] = req.body[update]))
    await task.save()
    // const task = await Task.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})
    if (!task) {
      res.status(400).send({error: "cant find task"})
    }
    res.status(200).send(task)
  } catch (e) {
    res.status(400).send({error: "cant update"})
  }
})

router.delete("/tasks/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({_id: req.params.id, owner: req.user._id})
    if (!task) {
      return res.status(400).send({error: "invalid id for task"})
    }
    res.status(200).send(task)
  } catch (e) {
    res.status(400).send({error: "Somthing went wrong"})
  }
})

module.exports = router
