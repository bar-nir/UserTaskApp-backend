const express = require("express")
const router = new express.Router()
const User = require("../models/user")
const auth = require("../middleware/auth")

router.post("/users", async (req, res) => {
  const user = new User(req.body)
  try {
    await user.save()
    const token = await user.generateAuthToken()
    res.status(201).send({user, token})
  } catch (e) {
    res.status(400).send(e)
  }
  // user
  //   .save()
  //   .then(() => {
  //     res.send(user)
  //   })
  //   .catch((e) => {
  //     res.status(400).send(e)
  //   })
})

router.get("/users/me", auth, async (req, res) => {
  res.send(req.user)

  // try {
  //   const users = await User.find({})
  //   res.send(users)
  // } catch (e) {
  //   res.status(500).send(e)
  // }

  // User.find({})
  //   .then((users) => {
  //     res.send(users)
  //   })
  //   .catch((e) => {
  //     res.status(500).send()
  //   })
})

router.patch("/users/me", auth, async (req, res) => {
  const updates = Object.keys(req.body)
  const allowedUpdates = ["name", "email", "password", "age"]
  const isValidOperation = updates.every((update) => {
    return allowedUpdates.includes(update)
  })
  if (!isValidOperation) {
    return res.status(400).send({error: "invalid update"})
  }
  try {
    updates.forEach((update) => (req.user[update] = req.body[update]))
    await req.user.save()
    // const user = await User.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})
    // if (!user) {
    //   return res.send(404).send({error: "cant find user"})
    // }
    res.status(200).send(req.user)
  } catch (e) {
    res.status(404).send({error: "error"})
  }
})

router.delete("/users/me", auth, async (req, res) => {
  try {
    // const user = await User.findByIdAndDelete(req.user._id)
    // if (!user) {
    //   return res.status(400).send({error: "invalid id"})
    // }
    await req.user.remove()
    res.status(200).send(req.user)
  } catch (e) {
    res.status(400).send({error: "Cant Delete User"})
  }
})

router.post("/users/login", async (req, res) => {
  console.log("hey")
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password)
    const token = await user.generateAuthToken()
    res.send({user, token})
  } catch (e) {
    res.status(400).send({error: "Error"})
  }
})

router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token != req.token
    })
    console.log(req.user.tokens)
    console.log(req.token)
    await req.user.save()
    res.send("loged out")
  } catch (e) {
    res.status(500).send()
  }
})

router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = []
    await req.user.save()
    res.status(200).send("All Loged Out")
  } catch (e) {
    res.status(400).send("Error")
  }
})

module.exports = router
