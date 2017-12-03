var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// This is the objectId that is added to be able to use the creator
var ObjectId = mongoose.Schema.Types.ObjectId;

//This describes the fields that will be in the document.  The creator field was just added
var taskSchema = new Schema( {
  text: String,
  dateCreated: Date,
  dateCompleted: Date,
  completed: Boolean,

  creator: {type: ObjectId, ref: 'User'}

});

// Compile taskSchema into Mongoose model object
var Task = mongoose.model('Task', taskSchema);

// And export the Task so our other code can use it
module.exports = Task;
