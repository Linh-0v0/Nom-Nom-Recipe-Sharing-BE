import { useState } from 'react'
import { storage } from './firebase'
import { db } from './firebase'

function AvatarUploader({ userId }) {
  const [file, setFile] = useState(null)

  const handleFileInputChange = event => {
    setFile(event.target.files[0])
  }

  const handleUpload = () => {
    const storageRef = storage.ref()
    const avatarRef = storageRef.child(`avatars/${userId}/${file.name}`)
    const uploadTask = avatarRef.put(file)

    uploadTask.on(
      'state_changed',
      snapshot => {
        // handle upload progress updates if needed
      },
      error => {
        // handle upload errors if needed
        console.error(error)
      },
      () => {
        // handle successful upload
        avatarRef.getDownloadURL().then(url => {
          // save the URL to the database
          db.collection('users').doc(userId).update({
            avatarUrl: url
          })
        })
      }
    )
  }

  return (
    <div>
      <input type="file" onChange={handleFileInputChange} />
      <button onClick={handleUpload}>Upload</button>
    </div>
  )
}
