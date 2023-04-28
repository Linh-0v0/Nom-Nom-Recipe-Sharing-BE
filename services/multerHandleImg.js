const multer = require('multer')

// configure multer to store uploaded files in memory
const storage = multer.memoryStorage()

const upload = multer({ storage: storage })

module.exports = { storage, upload }
