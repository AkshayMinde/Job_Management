const express = require('express');
const router = express.Router();

const Notification = require('../models/notification');

// ! MIDDLEWARES

const {checkAdmin, checkLoggedIn} = require('../middlewares/index');

// ! INDEX
router.get('/notifications', async (req,res) => {
    try {
        const allNotifs = await Notification.find();
        res.render('notifications/index', {allNotifs});
    } catch (error) {
        req.flash('error', 'Something went wrong while fetching all notifications, please try again later');
		console.log(error);
		res.redirect('/jobs');
    }
})


// ! NEW
router.get('/notifications/new',checkLoggedIn, checkAdmin, (req,res) => {
    res.render('notifications/new');
})

// ! CREATE
router.post('/notifications',checkLoggedIn, checkAdmin, async (req,res) => {
    try {
        const newNotif = new Notification({
            title: req.body.title,
            body: req.body.body,
            author: req.body.author
        });
        await newNotif.save();
        req.flash('success', 'Successfully created a notification');
		res.redirect('/notifications');
    } catch (error) {
        req.flash('error', 'Something went wrong while creating a notification, please try again later');
		console.log(error);
		res.redirect('/notifications');
    }
})

// ! EDIT
router.get('/notifications/:id/edit',checkLoggedIn, checkAdmin, async (req,res) => {
    try {
        const foundNotif = await Notification.findById(req.params.id);
        res.render('notifications/edit', {foundNotif});
    } catch (error) {
        req.flash('error', 'Something went wrong while fetching a notification, please try again later');
		console.log(error);
		res.redirect('/notifications');
    }
})

// ! UPDATE
router.patch('/notifications/:id',checkLoggedIn, checkAdmin, async (req,res) => {
    try {
        const notifData ={
            title: req.body.title,
            body: req.body.body,
            author: req.body.author
        };
        await Notification.findByIdAndUpdate(req.params.id, notifData);
        res.redirect('/notifications');
    } catch (error) {
        req.flash('error', 'Something went wrong while updating a notification, please try again later');
		console.log(error);
		res.redirect('/notifications');
    }
})

// ! DELETE
router.delete('/notifications/:id',checkLoggedIn, checkAdmin, async (req,res) => {
    try {
        await Notification.findByIdAndDelete(req.params.id);
        req.flash('success', 'Successfully deleted a notification');
		res.redirect('/notifications');
    } catch (error) {
        req.flash('error', 'Something went wrong while deleting a notification, please try again later');
		console.log(error);
		res.redirect('/notifications');
    }
})

module.exports = router;