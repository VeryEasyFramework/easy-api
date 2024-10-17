import type {
  EntityRecord,
  GetListResult,
  ListOptions,
  RecordInfo,
  UserSession,
} from "@vef/types";
interface ErrorInfo {
  statusCode: number;
  message: string;
  title?: string;
}

export interface EasyApi {
  host: string;
  headers: Record<string, string>;
  call<T extends Record<string, any>>(
    group: string,
    action: string,
    data?: Record<string, any>,
  ): Promise<T>;
  getList<T extends EntityRecord = EntityRecord>(
    entity: string,
    options?: ListOptions,
  ): Promise<GetListResult<T>>;
  createEntity<T extends EntityRecord = EntityRecord>(
    entity: string,
    data: Record<string, any>,
  ): Promise<T>;
  getEntity<T extends EntityRecord = EntityRecord>(
    entity: string,
    id: string,
  ): Promise<T>;
  getRecordInfo(entity: string, id: string): Promise<RecordInfo>;
  updateEntity<T extends EntityRecord = EntityRecord>(
    entity: string,
    id: string,
    data: Record<string, any>,
  ): Promise<T>;
  deleteEntity(entity: string, id: string): Promise<void>;
  runEntityAction(
    entity: string,
    id: string,
    action: string,
    data?: Record<string, any>,
  ): Promise<any>;
  login(email: string, password: string): Promise<UserSession>;
  logout(): Promise<void>;
  authCheck(): Promise<UserSession>;
  onNotify(
    callback: (info: { message: string; title: string; type: string }) => void,
  ): void;
}

export class EasyApi implements EasyApi {
  host: string;
  headers: Record<string, string> = {};
  private notify: (
    info: { message: string; title: string; type: string },
  ) => void = (info) => {
    console.error(info);
  };

  constructor(host?: string) {
    this.host = host || "/api";
  }

  async call<T extends Record<string, any>>(
    group: string,
    action: string,
    data?: Record<string, any>,
  ): Promise<T> {
    const url = `${this.host}?group=${group as string}&action=${action}`;
    const response = await fetch(url, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...this.headers,
      },
      body: JSON.stringify(data),
    }).catch((e) => {
      this.notify({
        message: e.message,
        title: "Network Error",
        type: "error",
      });
      return new Response(null, { status: 500 });
    });
    if (!response.ok) {
      if (response.status === 302) {
        globalThis.location.href = response.headers.get("Location") || "/";
      }

      const content = await response.text();
      const info = this.parseError(response, content);
      const title = `${info.title || "API Error"} - ${info.statusCode}`;
      if (
        group === "auth" && action === "authCheck" && info.statusCode === 401
      ) {
        return {} as T;
      }
      this.notify({
        message: info.message,
        title: title,
        type: "error",
      });
      return {} as T;
    }
    return await response.json();
  }

  async getList<T extends EntityRecord = EntityRecord>(
    entity: string,
    options?: ListOptions,
  ): Promise<GetListResult<T>> {
    const fullOptions = {
      ...options,
      entity,
    };
    return await this.call<GetListResult<T>>("entity", "getList", fullOptions);
  }

  async createEntity<T extends EntityRecord = EntityRecord>(
    entity: string,
    data: Record<string, any>,
  ): Promise<T> {
    return await this.call<T>("entity", "createEntity", { entity, data });
  }

  async getEntity<T extends EntityRecord = EntityRecord>(
    entity: string,
    id: string,
  ): Promise<T> {
    return await this.call<T>("entity", "getEntity", { entity, id });
  }

  async getRecordInfo(entity: string, id: string): Promise<RecordInfo> {
    return await this.call("entity", "getRecordInfo", { entity, id });
  }

  async updateEntity<T extends EntityRecord = EntityRecord>(
    entity: string,
    id: string,
    data: Record<string, any>,
  ): Promise<T> {
    return await this.call<T>("entity", "updateEntity", { entity, id, data });
  }

  async deleteEntity(entity: string, id: string): Promise<void> {
    await this.call("entity", "deleteEntity", { entity, id });
  }

  async runEntityAction(
    entity: string,
    id: string,
    action: string,
    data?: Record<string, any>,
  ): Promise<any> {
    return await this.call("entity", "runEntityAction", {
      entity,
      id,
      action,
      data,
    });
  }

  async login(email: string, password: string): Promise<UserSession> {
    return await this.call("auth", "login", { email, password });
  }

  async logout(): Promise<void> {
    await this.call("auth", "logout");
  }

  async authCheck(): Promise<UserSession> {
    return await this.call("auth", "authCheck");
  }

  private parseError(response: Response, errorContent: string) {
    const info = {} as ErrorInfo;
    info.statusCode = response.status;
    let content: any;
    try {
      content = JSON.parse(errorContent ?? "");
      if ("error" in content) {
        content = content.error;
      }
      info.message = content;
    } catch (_e) {
      content = errorContent;
    }
    info.message = content;
    return info;
  }

  onNotify(
    callback: (info: { message: string; title: string; type: string }) => void,
  ) {
    this.notify = callback;
  }
}


export interface SocketRoom {
  roomName: string;
  events: string[];
}

export  type SocketStatus = "open" | "closed" | "connecting" | "error";

export class RealtimeClient {
  private socket!: WebSocket;
  private readonly host: string;
  private rooms: { name: string; events: string[] }[] = [];
  private messageListeners: ((room: string, event: string, data: any) => void)[] = [];
  private statusListeners: ((status: SocketStatus) => void)[] = [];
  private manualClose = false;

  get connected():boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  get connecting():boolean {
    return this.socket?.readyState === WebSocket.CONNECTING;
  }

  get closed() :boolean {
    return this.socket?.readyState === WebSocket.CLOSED;
  }

  constructor(host?: string) {
    const protocol = globalThis.location.protocol === "https:" ? "wss" : "ws";
    this.host = host || `${protocol}://${globalThis.location.host}/ws`;
  }


  onMessage(callback: (room: string, event: string, data: Record<string, any>) => void):void {
    if (this.messageListeners.includes(callback)) {
      return;
    }
    this.messageListeners.push(callback);
  }

  removeMessageListener(callback: (room: string, event: string, data: Record<string, any>) => void):void {
    this.messageListeners = this.messageListeners.filter((cb) => cb !== callback);
  }

  onStatusChange(callback: (status: SocketStatus) => void):void {
    this.statusListeners.push(callback);
  }

  removeStatusListener(callback: (status: SocketStatus) => void):void {
    this.statusListeners = this.statusListeners.filter((cb) => cb !== callback);
  }

  connect():void {
    this.socket = new WebSocket(this.host);
    this.manualClose = false;
    this.notifyStatus("connecting");
    this.socket.addEventListener("open", (_event) => {
      this.notifyStatus("open");
      this.rejoinRooms();
      this.socket.addEventListener("close", (_event) => {
        this.notifyStatus("closed");
        if (!this.manualClose) {
          this.retryReconnect(1000);
        }
      });
      this.socket.addEventListener("message", (event) => {

        let data;
        try {

          data = JSON.parse(event.data);
        } catch (_e) {
          data = {
            data: event.data
          }
        }
        if ('room' in data && 'event' in data && 'data' in data) {

          for (const listener of this.messageListeners) {
            listener(data.room, data.event, data.data);
          }
        }
      });
    });
    this.socket.addEventListener("error", (_event) => {
      this.notifyStatus("error");
      // console.log("socket error", event);
    });
  }

  private notifyStatus(status: SocketStatus):void {
    for (const listener of this.statusListeners) {
      listener(status);
    }
  }

  private retryReconnect(attempts: number):void {
    let count = 0;
    const interval = setInterval(() => {
      if (count >= attempts) {
        clearInterval(interval);
        return;
      }
      if (this.connected) {
        clearInterval(interval);
        return;
      }
      if (this.closed) {
        count++;
        console.log(`Reconnecting... ${count}/${attempts}`);
        this.reconnect();
      }
    }, 1000);
  }

  private reconnect() {
    if (this.closed) {
      this.connect();
    }
  }

  private rejoinRooms():void {
    for (const room of this.rooms) {
      if (room.events.length === 0) {
        this.send({type: "join", room: room.name});
        return;
      }
      for (const event of room.events) {
        this.send({type: "join", room: room.name, event});
      }
    }
  }


  join(room: string, event: string):void {


    if (!this.rooms.find((r) => r.name === room)) {
      this.rooms.push({name: room, events: [event]});
    } else {
      this.rooms = this.rooms.map((r) => {
        if (r.name === room) {
          r.events.push(event);
        }
        return r;
      });
    }
    this.send({type: "join", room, event});
  }

  leave(room: string, event?: string):void {
    if (event) {
      this.rooms = this.rooms.map((r) => {
        if (r.name === room) {
          r.events = r.events.filter((e) => e !== event);
        }
        return r;
      });
    } else {
      this.rooms = this.rooms.filter((r) => r.name !== room);
    }
    this.send({type: "leave", room, event});
  }

  disconnect() {
    this.manualClose = true;
    this.socket.close();
  }

  private send(message: Record<string, any>):void {
    if (!this.connected) {
      return;
    }
    this.socket.send(JSON.stringify(message));
  }
}
