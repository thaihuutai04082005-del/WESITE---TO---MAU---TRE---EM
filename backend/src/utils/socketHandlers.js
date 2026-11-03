// Await handlers and preserve per-user event order when database I/O yields.
const queues = new Map();
export function bindSocketHandlers(socket, namespace) {
  const key = `${namespace}:${socket.data.userId}`;
  return (event, handler) =>
    socket.on(event, (...args) => {
      const task = (queues.get(key) || Promise.resolve())
        .then(() => handler(...args))
        .catch(() => {
          const ack = args[args.length - 1];
          if (typeof ack === 'function') ack({ error: 'server_error' });
          console.error(`[${namespace}] socket operation failed`);
        });
      queues.set(key, task);
      task.finally(() => {
        if (queues.get(key) === task) queues.delete(key);
      });
    });
}
