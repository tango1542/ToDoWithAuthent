var express = require('express');
var router = express.Router();
var Task = require('../models/task');
var ObjectId = require('mongoose').mongo.ObjectID;


// This function will verify if the user is authenticated.
function isLoggedIn(req, res, next) {
  console.log('user is auth ', req.user)
  if (req.isAuthenticated()) {
    res.locals.username = req.user.local.username;
    next();
  } else {
    res.redirect('/auth');
  }
}

// This would be used for every route.

router.use(isLoggedIn);


// This get would list incomplete tasks
router.get('/', function(req, res, next) {

  Task.find( { creator: req.user._id, completed: false})
    .then( (docs) => {
      res.render('index', {title: 'Incomplete Tasks', tasks: docs})
    })
    .catch( (err) => {
    next(err);
  });

});


/* GET details about one task */

router.get('/task/:_id', function(req, res, next) {

/* This route matches URLs in the format task/anything
Note the format of the route path is  /task/:_id
This matches task/1 and task/2 and task/3...
Whatever is after /task/ will be available to the route as req.params._id

For our app, we expect the URLs to be something like task/1234567890abcdedf1234567890
Where the number is the ObjectId of a task.
So the req.params._id will be the ObjectId of the task to find
*/

  Task.findOne({_id: req.params._id} )
    .then( (task) => {

      if (!task) {
        res.status(404).send('Task not found');
      }
      else if ( req.user._id.equals(task.creator)) {
// This is checking to see if this task belongs to this user
        res.render('task', {title: 'Task', task: task});
      }
      else {
        // If it's not this user's task, it would Send 403 Forbidden response
        res.status(403).send('This is not your task, you may not view it');
      }
    })
    .catch((err) => {
      next(err);
    })

});


/* GET completed tasks */
router.get('/completed', function(req, res, next){

  Task.find( {creator: req.user._id, completed:true} )
    .then( (docs) => {
      res.render('tasks_completed', { title: 'Completed tasks' , tasks: docs });
    }).catch( (err) => {
    next(err);
  });

});


/* POST new task */
router.post('/add', function(req, res, next){

  if (!req.body || !req.body.text) {
    //no task text info, redirect to home page with flash message
    req.flash('error', 'please enter a task');
    res.redirect('/');
  }

  else {

    // Insert into database. New tasks are assumed to be not completed.

    // Create a new Task, an instance of the Task schema, and call save()
    new Task( { creator: req.user._id, text: req.body.text, completed: false} ).save()
      .then((newTask) => {
        console.log('The new task created is: ', newTask);
        res.redirect('/');
      })
      .catch((err) => {
        next(err);   // most likely to be a database error.
      });
  }

});


/* POST task done */
router.post('/done', function(req, res, next) {

  // Is this is the user's task?

  Task.findOneAndUpdate( { creator: req.user._id, _id: req.body._id}, {$set: {completed: true}} )
    .then((updatedTask) => {
      if (updatedTask) {   // updatedTask is the document *before* the update
        res.redirect('/')  // One thing was updated. Redirect to home
      } else {
        // if no updatedTask, then no matching document was found to update. 404
        res.status(404).send("Error marking task done: not found");
      }
    }).catch((err) => {
    next(err);
  })

});


/* POST all tasks done */
router.post('/alldone', function(req, res, next) {

  Task.updateMany( { creator: req.user._id, completed : false } , { $set : { completed : true} } )
    .then( (result) => {
      console.log("How many documents were modified? ", result.n);
      req.flash('info', 'All tasks marked as done!');
      res.redirect('/');
    })
    .catch( (err) => {
      next(err);
    })

});


/* POST task delete */
router.post('/delete', function(req, res, next){

  Task.deleteOne( { creator: req.user._id, _id : req.body._id } )
    .then( (result) => {

      if (result.deletedCount === 1) {  // one task document deleted
        res.redirect('/');

      } else {
        // The task was not found. Report 404 error.
        res.status(404).send('Error deleting task: not found');
      }
    })
    .catch((err) => {
      next(err);   // Will handle invalid ObjectIDs or DB errors.
    });

});


module.exports = router;
