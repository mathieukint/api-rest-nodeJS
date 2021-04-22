const jwt = require('jsonwebtoken');

const JWT_SIGN_CRYPT = '$2y$10$GWqwNxNurhpvuE56ZoEjD.f.bHEf89ecgOr5s4PfsJKVJ2GrfXJNy';

module.exports = {
    generateTokenForUser: function(userData) {
        return jwt.sign({
            user_id: userData.user_id,
            user_isAdmin: userData.user_isAdmin
        },
        JWT_SIGN_CRYPT,
        {
            expiresIn:'1h'
        })
    },
    parseAuthorization: function(authorization) {
        return (authorization != null) ? authorization.replace('Bearer ', '') : null;
    },
    getUserId: function(authorization) {
        const user_id = -1;
        const token = module.exports.parseAuthorization(authorization);
        if(token!=null) {
            try{
                const jwtToken = jwt.verify(token, JWT_SIGN_CRYPT);
                if(jwtToken!=null) {
                    user_id = jwtToken.user_id;
                }
            }
            catch(err) {
            }
        }
        return user_id;

    }
}