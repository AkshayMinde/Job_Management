const express = require('express');
const router = express.Router();
const Job = require('../models/job') /*model name always start by capital letter*/
const User = require('../models/user') /*model name always start by capital letter*/
const Notification = require('../models/notification') /*model name always start by capital letter*/

// ! MIDDLEWARES

const {checkAdmin, checkLoggedIn} = require('../middlewares/index');
const { use } = require('passport');
const escapeRegex = (text) => {
	return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
};

// ! INDEX ROUTE
// to show all jobs on site
router.get('/jobs', async (req,res) => {
    try {
        let pageNo = 1;/* used let because page no can be updated from query  */
        if(req.query.page) pageNo = req.query.page;
        const options = {
            page: pageNo,
            limit: 10,
        };
        const allJobs = await Job.paginate({}, options);
        return res.render('jobs/index', {allJobs});
    } catch (error) {
        req.flash('error', 'Something went wrong while fetching all jobs, please try again later');
		console.log(error);
		return res.redirect('/');
    }
})

// ! JOB SEARCH
router.get('/jobs/search', async (req, res) => {
	try {
		const name = req.query.name;
		if (!name) return res.redirect('/jobs');
		const regex = new RegExp(escapeRegex(name));
		console.log(regex);
		const jobs = await Job.find({ companyName: regex });
		res.render('jobs/search', { jobs });
	} catch (error) {
		req.flash('error', 'Something went wrong while searching jobs, please try again later');
		console.log(error);
		return res.redirect('/');
	}
});


// ! NEW ROUTE
// a form to add new job
router.get('/jobs/new',checkLoggedIn, checkAdmin, (req,res) => {
    return res.render('jobs/newJob');
});

// ! CREATE ROUTE
// read data from form and add to database
router.post('/jobs',checkLoggedIn, checkAdmin, async (req,res) => {
    try {
        const newJob = new Job({/* creating a job by the model Job and fetching the values from thee form  */
        postName: req.body.postName, /* to fetch value from form we use req.body.postName */
        companyName: req.body.companyName,
        ctc: req.body.ctc,
        location:req.body.location,
        cgpa: req.body.cgpa,
        description: req.body.description,
        numberOfPositions: req.body.numberOfPositions
    });
    await newJob.save();/* to save the job in database  */
    const newNotif = new Notification({
        title:`New ${newJob.postName} opening`,
        body:`${newJob.companyName} just posted a new job`,
        author: newJob.companyName,
    })

    await newNotif.save();
    req.flash('success', 'Successfully posted a job');
	return res.redirect('/jobs');
    } catch (error) {
        req.flash('error', 'Something went wrong while creating a job, please try again later');
		console.log(error);
		return res.redirect('/jobs');
    }
})

// ! SHOW ROUTE
//  Shows info about only one job
router.get('/jobs/:id', async (req, res)=>{
   try {
     const foundJob = await Job.findById(req.params.id).populate('appliedUsers');/* populate method if we have provide refernce works and it fills all the data present in object instead of giving object id */
    //  return res.send(foundJob);
     return res.render('jobs/show', {foundJob});/* foundJob is passed so we can use it in show.ejs page */
   } 
   catch (error) {
    req.flash('error', error);
    res.redirect('/jobs');
   }
})

// ! EDIT ROUTE
// Form to edit a job
router.get('/jobs/:id/edit',checkLoggedIn, checkAdmin, async(req,res)=> {
    try {
        const foundJob = await Job.findById(req.params.id);
        return res.render('jobs/edit', {foundJob});
      } 
      catch (error) {
        req.flash('error', 'Something went wrong while fetching a job, please try again later');
		console.log(error);
		return res.redirect('/jobs');
      }
})

// ! UPDATE ROUTE
// read data from form and add to database
router.patch('/jobs/:id',checkLoggedIn, checkAdmin, async(req,res)=>{
    try {
        const JobData ={ /*not to create new object just updating the values got from edit form */
            postName: req.body.postName,
            companyName: req.body.companyName,
            ctc: req.body.ctc,
            location:req.body.location,
            cgpa: req.body.cgpa,
            description: req.body.description,
            numberOfPositions: req.body.numberOfPositions
        };
        await Job.findByIdAndUpdate(req.params.id, JobData); /*method to update in database */
        
        const newNotif = new Notification({
            title:`${JobData.postName} opening edited`,
            body:`${JobData.companyName} just edited their job`,
            author: JobData.companyName,
        })
        await newNotif.save();
        res.flash('success', 'update is done');
        res.redirect('/jobs')
    } catch (error) {
        req.flash('error', 'Something went wrong while updating a job, please try again later');
		console.log(error);
		return res.redirect('/jobs');
    }
})

// ! DELETE ROUTE
// delete one job
router.delete('/jobs/:id',checkLoggedIn, checkAdmin, async(req,res)=>{
    try {
        const jobData = await Job.findById(req.params.id);
        await Job.findByIdAndDelete(req.params.id);
        const newNotif = new Notification({
            title:`${JobData.postName} opening deleted`,
            body:`${JobData.companyName} just deleted their job`,
            author: JobData.companyName,
        });
        await newNotif.save();
        req.flash('success', 'Successfully deleted the job');
		return res.redirect('/jobs');
    } catch (error) {
        req.flash('error', 'Something went wrong while deleting a job, please try again later');
		console.log(error);
		return res.redirect('/jobs');
    }
})

// ! CHANGE JOB STATUS
router.get('/jobs/:id/status',checkLoggedIn, checkAdmin, async (req,res) => {
    try {
        const { type } = req.query;
        const { id } = req.params;
        if(!type) return res.redirect(`/jobs/${id}`);
        if(!['active', 'over', 'interview'].includes(type)) type = 'active';
        
        const job = await Job.findByIdAndUpdate(id, {status: type});
        req.flash('success', 'status is successfully changed');
		return res.redirect(`/jobs/${id}`);
    } catch (error) {
        req.flash('error', 'Something went wrong while changing status of a job, please try again later');
		console.log(error);
		return res.redirect('/jobs');
    }
})

// ! APPLY TO JOBS
router.get('/jobs/:id/apply/:userId', checkLoggedIn, async(req,res) => {
    try {
        const { id, userId } = req.params;
        const job = await Job.findById(id);
        const user = await User.findById(userId);
        if (user.cgpa < job.cgpa) {
            req.flash('error', 'your cgpa does not meet the criteria');
            return res.redirect(`/jobs/${id}`);
        }
        const result = hasUserApplied(job, req.user);
		if (result) {
			req.flash('error', 'you can only apply once');
			return res.redirect(`/jobs/${id}`);
        }
        job.appliedUsers.push(user);
        await job.save();
        req.flash('success', 'Successfully applied');
        return res.redirect(`/jobs/${id}`);
    } catch (error) {
        req.flash('error', 'Something went wrong while applying to a job, please try again later');
		console.log(error);
		return res.redirect(`/jobs/${req.params.id}`);
    }
})

// ! TEST

router.get('/jobs/:id/test',checkLoggedIn, async (req,res) => {
    try {
        const job = await Job.findById(req.params.id);
		const result = hasUserApplied(job, req.user);
		if (!result) {
			req.flash('error', 'you need to apply first');
			return res.redirect(`/jobs/${req.params.id}`);
        }
		return res.render('jobs/test', { job });
    } catch (error) {
        req.flash('error', 'Something went wrong while displaying the test, please try again later');
		console.log(error);
		return res.redirect(`/jobs/${req.params.id}`);
    }
});

router.post('/jobs/:id/test',checkLoggedIn,async (req, res) => {
	// return res.send(req.body);
	// {"question0":"option1","question1":"option3"}
	try {
		const job = await Job.findById(req.params.id);
		const result = hasUserApplied(job, req.user);
		if (!result) {
			req.flash('error', 'you need to apply first');
			return res.redirect(`/jobs/${req.params.id}`);
		}
		const questions = job.questions;
		let marks = 0,
			correct = 0,
			wrong = 0,
			status,
			total = questions.length;
		for (let idx in questions) {
			let ques = questions[idx];
			let ans = req.body[`question${idx}`];
			if (ques.correctAnswer === ans) ++marks, ++correct;
			else ++wrong;
		}
		if (marks >= 0.7 * total) status = 'shortlisted';
		else status = 'rejected';
		return res.json({
			marks,
			correct,
			wrong,
			total,
			status
		});
	} catch (error) {
		req.flash('error', 'Something went wrong while displaying the test, please try again later');
		console.log(error);
		return res.redirect(`/jobs/${req.params.id}`);
	}
});

const hasUserApplied = (job, user) => {
	let flag = false;
	for (let ids of job.appliedUsers) {
		if (ids.equals(user._id)) flag = true;
	}
	return flag;
};

module.exports = router;

/* */