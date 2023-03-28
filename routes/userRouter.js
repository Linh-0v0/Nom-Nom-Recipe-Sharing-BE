const express = require('express')
const User = require('../controllers/userCtrl')

const router = require('express').Router()

router.post('/', async (req, res) => {
  try {
    const { username, email, password } = req.body
    const userId = await User.createUser(username, email, password)
    res.status(201).json({ userId })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal server error' })
  }
})

module.exports = router
