import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Injectable, Logger, Inject, forwardRef } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ReservationService } from "./reservation.service";
import { JwtPayload } from "@/auth/interfaces/jwt-payload.interface";

@WebSocketGateway({
  namespace: "reservations",
  cors: {
    origin: "*",
    credentials: true,
  },
})
@Injectable()
export class ReservationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(ReservationGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    @Inject(forwardRef(() => ReservationService))
    private readonly reservationService: ReservationService
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token: string | undefined =
        (client.handshake.auth as Record<string, string | undefined>)?.token ||
        (client.handshake.query as Record<string, string | undefined>)?.token;

      if (!token) {
        this.logger.warn(`Client ${client.id} connected without token`);
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      (client.data as Record<string, unknown>).userId = payload.sub;

      // Join a personal room so we can emit targeted updates
      await client.join(`user:${payload.sub}`);

      this.logger.log(`Client ${client.id} connected as user ${payload.sub}`);
    } catch (err) {
      this.logger.warn(
        `Client ${client.id} failed auth: ${(err as Error).message}`
      );
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client ${client.id} disconnected`);
  }

  @SubscribeMessage("getReservationByUser")
  async handleGetReservations(
    @MessageBody() data: { userId?: string },
    @ConnectedSocket() client: Socket
  ) {
    try {
      // Use the authenticated user's ID from the JWT
      const userId = (client.data as Record<string, string>).userId;

      if (!userId) {
        return { event: "error", data: { message: "Unauthorized" } };
      }

      const reservations = await this.reservationService.findByUser(userId);

      client.emit("reservations", reservations);
    } catch (err) {
      this.logger.error(
        `Error fetching reservations: ${(err as Error).message}`
      );
      return {
        event: "error",
        data: { message: "Failed to fetch reservations" },
      };
    }
  }

  /**
   * Emit a reservation update to a specific user's room.
   * Called from the service after an update.
   */
  emitReservationUpdate(userId: string, reservation: unknown) {
    this.server.to(`user:${userId}`).emit("reservationUpdated", reservation);
  }
}
