module.exports = {
    mapUser(user) {
        return {id: user.id, email: user.email};
    }
};