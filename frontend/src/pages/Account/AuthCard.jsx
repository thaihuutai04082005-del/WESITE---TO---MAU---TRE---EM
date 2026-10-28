// Khung đăng nhập / đăng ký / quên mật khẩu: nền cảnh trời xanh đồi cỏ như trang chủ, thẻ kem viền vàng, gấu cầm bút sáp nhô lên ở trên.
export default function AuthCard({ title, subtitle, children }) {
  return (
    <div className="auth-bg">
      <div className="auth-card">
        <img src="/mascots/login-bear.webp" alt="" className="auth-bear" />
        <h1 className="auth-title">{title}</h1>
        {subtitle && <p className="auth-sub">{subtitle}</p>}
        <div className="auth-body">{children}</div>
      </div>
    </div>
  );
}
