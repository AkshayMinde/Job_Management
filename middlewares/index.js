const checkLoggedIn = (req,res,next) => {
    if(req.isAuthenticated()) next();
    else {
        req.flash('error', 'You need to be signed in first');
        res.redirect('/login');
    }
}

const checkAdmin = (req,res,next) => {
        if (req.user.isAdmin == true) {
            next();
        } else{
            req.flash('You are not permitted to do that task');
            res.redirect('back');
        }
}

const verifyUser = (req,res,next) => {
    if (req.user.isAdmin || req.user._id.equals(req.params.id) ) { /* isEquals compare a object id with a string */
        next();
    } else {
        req.flash('You are not permitted to do that task');
        res.redirect('back');
    }
}

module.exports = {
    checkAdmin,
    checkLoggedIn,
    verifyUser
}