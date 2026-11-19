import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:4000';

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
  }
  return socket;
};

export const connectSocket = (user) => {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
    s.emit('authenticate', { email: user.email, nombre: user.nombre });
  }
  return s;
};

export const disconnectSocket = () => {
  if (socket && socket.connected) {
    socket.disconnect();
  }
};

export const joinProject = (projectId) => {
  const s = getSocket();
  if (s.connected) {
    s.emit('join-project', projectId);
  }
};

export const leaveProject = (projectId) => {
  const s = getSocket();
  if (s.connected) {
    s.emit('leave-project', projectId);
  }
};

export default getSocket;
