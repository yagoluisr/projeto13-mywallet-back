function hasToken(req, res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) return res.sendStatus(401);
    
    res.locals.token = token
    next();
}

export default hasToken; 