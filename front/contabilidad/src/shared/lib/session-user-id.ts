const USER_ID_KEY = 'signalr_user_id';

export function getSessionUserId(): string {
  let id = sessionStorage.getItem(USER_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(USER_ID_KEY, id);
  }
  return id;
}
