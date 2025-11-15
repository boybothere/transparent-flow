const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    // Get token from the header
    const token = req.header('Authorization');
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        const justToken = token.split(' ')[1];

        const decoded = jwt.verify(justToken, process.env.JWT_SECRET);

        req.user = decoded.user;
        next();

    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};