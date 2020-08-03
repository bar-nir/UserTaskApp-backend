const mongoose = require("mongoose")
const validator = require("validator")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const Task = require("../models/task")

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 7,
      validate(value) {
        if (value.toLowerCase().includes("password")) {
          throw new Error("Password is not correct")
        }
      },
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("email is not valid")
        }
      },
    },
    age: {
      type: Number,
      defualt: 0,
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
)

UserSchema.virtual("tasks", {
  ref: "Tasks",
  localField: "_id",
  foreignField: "owner",
})
//Find User By emmail and password
UserSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({email})
  if (!user) {
    throw new Error("Email is inncorect ,Cant log ing")
  }
  isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    throw new Error("Unable to Login")
  }
  return user
}
//Creating token for user
UserSchema.methods.generateAuthToken = async function () {
  const user = this
  const token = jwt.sign({_id: user.id.toString()}, "thisismynewcourse")
  user.tokens = user.tokens.concat({token})
  await user.save()
  return token
}

//hiding private data by with toJSON.
//called every time res.send()
UserSchema.methods.toJSON = function () {
  const user = this
  const userObject = user.toObject()
  delete userObject.password
  delete userObject.tokens
  return userObject
}
//Hash the text password
UserSchema.pre("save", async function (next) {
  const user = this

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8)
  }
  next()
})

//Delete user tasks when user is removed
UserSchema.pre("remove", async function (next) {
  const user = this
  await user.populate("tasks").execPopulate()
  await Task.deleteMany({owner: user._id})
  next()
})

const User = mongoose.model("User", UserSchema)

module.exports = User
