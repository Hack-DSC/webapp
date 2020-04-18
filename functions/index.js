const functions = require('firebase-functions')
const admin = require('firebase-admin')
admin.initializeApp(functions.config().firebase)

const db = admin.firestore()

/**
 * Delete user's hacker profile when their user account is deleted.
 */
exports.deleteHackerProfile = functions.auth.user().onDelete(user => {
    return db.collection('hackers').doc(user.uid).delete()
})
