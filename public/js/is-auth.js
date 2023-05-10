module.exports = (req,res,next)=>{ //middleware that requests have to pass if authenticated
    if(!req.session.isLoggedIn)
    {
        return res.redirect('/login');
    }
    next();
}