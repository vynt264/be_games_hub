export const ERROR_MESSAGE = {
  INVALID_TOKEN: "Token không hợp lệ.",
  INVALID_LEVEL: "Cấp VIP không phù hợp.",
  DELETE_TOKEN: "Token đã bị xóa.",
  LOGIN_FAILED: "Sai tên đăng nhập hoặc tài khoản không tồn tại.",
  INVALID_REFRESH_TOKEN: "Refresh token không hợp lệ.",

  GAME_NOT_FOUND: "Không tìm thấy trò chơi.",
  GAME_ALREADY_COMPLETED: "Trò chơi này đã kết thúc.",
  GAME_ALREADY_STARTED: "Bạn đang có trò chơi chưa hoàn thành.",
  GAME_TIME_EXPIRED: "Đã hết thời gian chơi.",
  INVALID_POSITION: "Vị trí không hợp lệ.",
  NO_TURNS_AVAILABLE: "Bạn không còn lượt chơi nào.",
  CONFIG_NOT_FOUND: "Không tìm thấy cấu hình.",
} as const;

export const ADMIN_ERROR_MESSAGE = {
  LOGIN_FAILED: "Sai tên đăng nhập hoặc mật khẩu.",
  ACCOUNT_LOCKED: "Tài khoản quản trị đã bị khóa.",
  ADMIN_NOT_FOUND: "Không tìm thấy tài khoản quản trị.",
  USER_NOT_FOUND: "Không tìm thấy tài khoản người dùng.",
  USERNAME_EXISTS: "Tên đăng nhập đã tồn tại trong hệ thống.",
  DAILY_TURNS_NOT_FOUND: "Không tìm thấy thông tin lượt chơi của người dùng",
  CANNOT_SUBTRACT_WHEN_NO_TURNS: "Không thể trừ lượt khi đã hết lượt chơi",
  GAME_CONFIG_NOT_FOUND: "Không tìm thấy cấu hình game",
  TURNS_EXCEED_MAX: "Tổng lượt chơi không được vượt quá {maxTurns} lượt",
  TURNS_CANNOT_BE_NEGATIVE: "Số lượt chơi không được âm",
  USED_TURNS_EXCEED_TOTAL:
    "Số lượt đã sử dụng không được vượt quá tổng lượt chơi",
} as const;

export const SUCCESS_MESSAGE = {
  LOGIN_SUCCESS: "Đăng nhập thành công.",
  TOKEN_REFRESHED: "Làm mới token thành công.",
  GAME_STARTED: "Bắt đầu trò chơi thành công.",
  GAME_ENDED: "Kết thúc trò chơi thành công.",
  LOGOUT_SUCCESS: "Đăng xuất thành công.",
} as const;

export const ENCRYPTION_ERROR_MESSAGE = {
  INVALID_ENCRYPTED_DATA: "Dữ liệu mã hóa không hợp lệ",
  DECRYPTION_FAILED: "Không thể giải mã dữ liệu",
  INVALID_SIGNATURE: "Chữ ký không hợp lệ",
  INVALID_NONCE: "Nonce không hợp lệ hoặc đã hết hạn",
  GAME_SESSION_EXPIRED: "Phiên game đã hết hạn",
};
