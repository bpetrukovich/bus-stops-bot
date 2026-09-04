export interface MessageSender {
  sendMessage(userId: number, message: string): void;
}
