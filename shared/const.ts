export const COOKIE_NAME = "app_session_id";
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;
export const AXIOS_TIMEOUT_MS = 30_000;
export const UNAUTHED_ERR_MSG = 'Please login (10001)';
export const NOT_ADMIN_ERR_MSG = 'You do not have required permission (10002)';

// 販売は BOOTH に任せているので、自前のカート・決済（Stripe）は画面に出さない。
// コードは残してあるので、自分のサイトで売るようにするときは true に戻す。
export const CHECKOUT_ENABLED = false;
