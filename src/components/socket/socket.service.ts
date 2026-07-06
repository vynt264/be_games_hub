import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { BlacklistService } from "../blacklist/blacklist.service";

@WebSocketGateway({ cors: { origin: ["https://2q-app-quockhanh.tlj129.com"] } })
export class SocketService implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  private userSockets: Map<string, Set<string>> = new Map();

  constructor(private readonly blacklistService: BlacklistService) {}

  handleConnection(client: Socket) {
    try {
      const token = client.handshake.query.username;
      if (!token) {
        client.disconnect();
        return;
      }

      client.data.username = token;

      if (!this.userSockets.has(client.data.username)) {
        this.userSockets.set(client.data.username, new Set());
      }
      this.userSockets.get(client.data.username).add(client.id);
    } catch (err) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const username = client.data?.username;
    const socketId = client.id;

    if (username && this.userSockets.has(username)) {
      const sockets = this.userSockets.get(username);
      sockets.delete(socketId);

      if (sockets.size === 0) {
        this.userSockets.delete(username);

        setTimeout(async () => {
          if (!this.userSockets.has(username)) {
            await this.clearUserToken(username);
          }
        }, 3000);
      }
    }
  }

  private async clearUserToken(username: string) {
    await this.blacklistService.deleteUserTokens(username);
  }

  broadcastPopup(data: any) {
    this.server.emit("noel:popup", data);
  }
}
