import { io, type Socket } from 'socket.io-client';
import { API_URL } from '../api';

const SOCKET_URL = API_URL.replace(/\/api\/?$/, '');

class SocketService {
  private socket: Socket | null = null;

  connect(token: string): Socket {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        withCredentials: true,
        transports: ['websocket', 'polling'],
        auth: { token },
      });
      return this.socket;
    }

    this.socket.auth = { token };
    if (!this.socket.connected) {
      this.socket.connect();
    }
    return this.socket;
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  disconnect(): void {
    if (!this.socket) return;
    this.socket.disconnect();
    this.socket = null;
  }
}

export const socketService = new SocketService();
