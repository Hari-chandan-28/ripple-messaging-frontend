import axios from 'axios'

const BASE = 'http://localhost:8081'

export const signup = (username, email, password) =>
    axios.post(`${BASE}/api/auth/signup`, { username, email, password })

export const login = (email, password) =>
    axios.post(`${BASE}/api/auth/login`, { email, password })