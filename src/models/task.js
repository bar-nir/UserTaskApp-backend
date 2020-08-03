const mongoose = require("mongoose")
const validator = require("validator")

const TaskSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      trim: true,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    owner: {
      ref: "User",
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

TaskSchema.pre("save", async function (next) {
  const task = this

  if (task.isModified("")) {
    console.log("before saving task")
  }
  next()
})

const Task = mongoose.model("Tasks", TaskSchema)
module.exports = Task
