import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'https://campus-connect-backend-tau.vercel.app/api';

let socket = null

export function getSocket() {
    if (!socket) {
        socket = io(SOCKET_URL, {
            autoConnect: false,
            withCredentials: true,
        })
    }
    return socket
}

export function connectSocket(userId) {
    const s = getSocket()
    if (!s.connected) {
        s.connect()
        s.on('connect', () => {
            console.log('Socket connected:', s.id)
            s.emit('register', userId)
        })
    } else {
        s.emit('register', userId)
    }
    return s
}

export function disconnectSocket() {
    if (socket && socket.connected) {
        socket.disconnect()
    }
}
